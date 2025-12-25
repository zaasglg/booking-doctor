"use client";

import React, { useEffect, useState } from 'react';
import { Check, X, Edit, Trash2, Plus, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { getToken } from '@/lib/auth-utils';

type Doctor = {
  id: string;
  firstName?: string;
  lastName?: string;
  specialty?: string;
  bio?: string;
  services?: Array<{ id: string; name: string; price: number }>;
};

type Appointment = {
  id: string;
  patient: { id: string; name: string; email?: string; phone?: string };
  date: string;
  time: string;
  status: string;
  serviceName?: string | null;
  notes?: string | null;
};

export default function DoctorDashboardPage() {
  const { isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [services, setServices] = useState<Doctor['services']>([]);
  const [reviews, setReviews] = useState<Array<{ id: string; rating: number; comment?: string; patient?: { id: string; name: string }; createdAt: string }>>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [recordModalOpen, setRecordModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [recordDiagnosis, setRecordDiagnosis] = useState('');
  const [recordTreatment, setRecordTreatment] = useState('');
  const [recordMedications, setRecordMedications] = useState('');
  const [recordNotes, setRecordNotes] = useState('');
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [currentPayment, setCurrentPayment] = useState<null | {
    id: string;
    appointmentId?: string | null;
    amount: number;
    status: string;
    paymentMethod: string;
    transactionId: string;
    createdAt: string;
  }>(null);
  const [loading, setLoading] = useState(true);

  const statusLabelsRu: Record<string, string> = {
    upcoming: 'Предстоящая',
    confirmed: 'Подтверждена',
    completed: 'Завершена',
    cancelled: 'Отменена',
  };

  const statusClass = (s?: string) => {
    const st = (s || '').toLowerCase();
    if (st === 'upcoming') return 'bg-blue-100 text-blue-800';
    if (st === 'confirmed') return 'bg-yellow-100 text-yellow-800';
    if (st === 'completed') return 'bg-green-100 text-green-800';
    if (st === 'cancelled') return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push('/');
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated) fetchData();
  }, [isAuthenticated]);

  async function fetchData() {
    setLoading(true);
    const token = getToken();
    try {
      const [meRes, aptRes] = await Promise.all([
        fetch('/api/doctor/me', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/doctor/appointments', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (meRes.ok) {
        const data = await meRes.json();
        setDoctor(data.doctor || null);
      }

      // fetch services separately (useful after edits)
      const servicesRes = await fetch('/api/doctor/services', { headers: { Authorization: `Bearer ${token}` } });
      if (servicesRes.ok) {
        const sd = await servicesRes.json();
        setServices(sd.services || []);
      }

      // fetch reviews for doctor
      const reviewsRes = await fetch('/api/doctor/reviews', { headers: { Authorization: `Bearer ${token}` } });
      if (reviewsRes.ok) {
        const rv = await reviewsRes.json();
        setReviews(rv || []);
      }

      if (aptRes.ok) {
        const data = await aptRes.json();
        setAppointments(data.appointments || data || []);
      }
    } catch (err) {
      console.error('Error loading doctor dashboard:', err);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id: string, status: string) {
    const token = getToken();
    try {
      const res = await fetch('/api/doctor/appointments', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id, status }),
      });

      if (!res.ok) {
        console.error('Failed to update appointment status');
        return;
      }

      const updated = await res.json();
      setAppointments(prev => prev.map(a => (a.id === updated.id ? { ...a, status: updated.status } : a)));
    } catch (err) {
      console.error(err);
    }
  }

  // Services management
  async function createService(name: string, price: number, duration = 30) {
    const token = getToken();
    try {
      const res = await fetch('/api/doctor/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name, price, duration }),
      });
      if (!res.ok) throw new Error('Failed to create');
      const data = await res.json();
      setServices(prev => [data.service, ...(prev || [])]);
    } catch (err) {
      console.error(err);
    }
  }

  async function updateService(id: string, updates: { name?: string; price?: number; duration?: number }) {
    const token = getToken();
    try {
      const res = await fetch(`/api/doctor/services/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error('Failed to update');
      const data = await res.json();
      setServices(prev => (prev || []).map(s => (s.id === data.service.id ? data.service : s)));
    } catch (err) {
      console.error(err);
    }
  }

  async function deleteService(id: string) {
    const token = getToken();
    try {
      const res = await fetch(`/api/doctor/services/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete');
      setServices(prev => (prev || []).filter(s => s.id !== id));
    } catch (err) {
      console.error(err);
    }
  }

  // Medical record submit (inside component so it has access to state)
  async function submitMedicalRecord() {
    if (!selectedAppointment) return;
    const token = getToken();
    try {
      const res = await fetch('/api/medical-records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          date: selectedAppointment.date,
          doctorName: doctor?.firstName ? `${doctor.firstName} ${doctor.lastName || ''}`.trim() : undefined,
          specialty: doctor?.specialty,
          diagnosis: recordDiagnosis,
          treatment: recordTreatment,
          medications: recordMedications.split(',').map((s: string) => s.trim()).filter(Boolean),
          notes: recordNotes,
          patientId: selectedAppointment.patient?.id,
        }),
      });

      if (!res.ok) {
        console.error('Failed to create medical record');
        return false;
      }

      const data = await res.json();
      // close modal
      setRecordModalOpen(false);
      setSelectedAppointment(null);
      // optional: could refresh records or show toast
      return true;
    } catch (err) {
      console.error('Error creating medical record', err);
      return false;
    }
  }

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-10 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold">Панель доктора</h1>
            {doctor && (
              <div className="mt-3 text-base md:text-lg text-neutral-700">
                {doctor.firstName} {doctor.lastName} — <span className="font-medium">{doctor.specialty}</span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-neutral-900 rounded-md"
            >
              Перейти на сайт
            </a>

            <button
              onClick={() => {
                logout();
                router.push('/');
              }}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md"
            >
              Выйти
            </button>
          </div>
        </header>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Предстоящие записи</h2>
          {appointments.length === 0 ? (
            <div className="p-8 bg-white rounded-xl border">Нет записей</div>
          ) : (
            <div className="space-y-4">
              {appointments.map((apt) => (
                <div key={apt.id} className="p-6 bg-white rounded-xl border flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="text-lg font-semibold">{apt.patient?.name}</div>
                      <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${statusClass(apt.status)}`}>{statusLabelsRu[(apt.status || '').toLowerCase()] || (apt.status || '')}</span>
                    </div>
                        <div className="text-base text-neutral-600">{apt.patient?.phone || apt.patient?.email}</div>
                    <div className="text-base mt-2">{apt.date} · {apt.time} · <span className="font-medium">{apt.serviceName || 'Консультация'}</span></div>
                    {apt.notes && <div className="text-sm text-neutral-500 mt-2">Примечание: {apt.notes}</div>}
                  </div>

                  <div className="flex items-center space-x-3">
                    {apt.status === 'upcoming' && (
                      <button onClick={() => updateStatus(apt.id, 'CONFIRMED')} className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm">
                        <Check className="h-4 w-4" />
                        <span>Подтвердить</span>
                      </button>
                    )}
                    {apt.status !== 'cancelled' && apt.status !== 'completed' && (
                      <button onClick={() => updateStatus(apt.id, 'CANCELLED')} className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm">
                        <X className="h-4 w-4" />
                        <span>Отменить</span>
                      </button>
                    )}
                    {apt.status === 'confirmed' && (
                      <button onClick={() => updateStatus(apt.id, 'COMPLETED')} className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-md text-sm">
                        <Save className="h-4 w-4" />
                        <span>Завершить сеанс</span>
                      </button>
                    )}
                    {(apt.status || '').toLowerCase() === 'completed' && (
                      <button onClick={() => { setSelectedAppointment(apt); setRecordDiagnosis(''); setRecordTreatment(''); setRecordMedications(''); setRecordNotes(''); setRecordModalOpen(true); }} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm">
                        <Plus className="h-4 w-4" />
                        <span>Добавить медкарту</span>
                      </button>
                    )}
                    <button onClick={async () => {
                      // fetch payment for this appointment
                      const token = getToken();
                      try {
                        const res = await fetch(`/api/doctor/payments?appointmentId=${apt.id}`, { headers: { Authorization: `Bearer ${token}` } });
                        if (!res.ok) {
                          console.warn('No payment found for appointment', apt.id);
                          setCurrentPayment(null);
                          setPaymentModalOpen(true);
                          return;
                        }
                        const data = await res.json();
                        setCurrentPayment(data);
                        setPaymentModalOpen(true);
                      } catch (err) {
                        console.error('Error fetching payment', err);
                        setCurrentPayment(null);
                        setPaymentModalOpen(true);
                      }
                    }} className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-md text-sm">
                      <Save className="h-4 w-4" />
                      <span>Показать чек</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {paymentModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/40" onClick={() => { setPaymentModalOpen(false); setCurrentPayment(null); }} />
              <div className="relative bg-white rounded-xl p-6 w-full max-w-md z-10">
                <h3 className="text-lg font-semibold mb-4">Чек оплаты</h3>
                {currentPayment ? (
                  <div className="space-y-2 text-sm text-neutral-700">
                    <div>Сумма: <span className="font-medium">{currentPayment.amount} ₸</span></div>
                    <div>Статус: <span className="font-medium">{currentPayment.status}</span></div>
                    <div>Метод: <span className="font-medium">{currentPayment.paymentMethod}</span></div>
                    <div>Транзакция: <span className="font-medium">{currentPayment.transactionId}</span></div>
                    <div>Дата: <span className="font-medium">{new Date(currentPayment.createdAt).toLocaleString()}</span></div>
                  </div>
                ) : (
                  <div className="text-sm text-neutral-600">Платёж не найден для этой записи.</div>
                )}

                <div className="mt-4 flex justify-end gap-3">
                  <button onClick={() => { setPaymentModalOpen(false); setCurrentPayment(null); }} className="px-4 py-2 bg-gray-200 rounded-md">Закрыть</button>
                </div>
              </div>
            </div>
          )}
          {recordModalOpen && selectedAppointment && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/40" onClick={() => { setRecordModalOpen(false); setSelectedAppointment(null); }} />
              <div className="relative bg-white rounded-xl p-6 w-full max-w-2xl z-10">
                <h3 className="text-lg font-semibold mb-4">Создать медицинскую карту</h3>
                <div className="mb-3 text-sm text-neutral-700">Пациент: <span className="font-medium">{selectedAppointment.patient?.name}</span></div>
                <div className="mb-4 text-sm text-neutral-600">Дата приёма: {selectedAppointment.date} · {selectedAppointment.time}</div>

                <div className="space-y-3">
                  <textarea value={recordDiagnosis} onChange={e => setRecordDiagnosis(e.target.value)} placeholder="Диагноз" className="w-full px-3 py-2 border rounded-md text-base" />
                  <textarea value={recordTreatment} onChange={e => setRecordTreatment(e.target.value)} placeholder="Назначенное лечение" className="w-full px-3 py-2 border rounded-md text-base" />
                  <input value={recordMedications} onChange={e => setRecordMedications(e.target.value)} placeholder="Лекарства (через запятую)" className="w-full px-3 py-2 border rounded-md text-base" />
                  <textarea value={recordNotes} onChange={e => setRecordNotes(e.target.value)} placeholder="Примечания" className="w-full px-3 py-2 border rounded-md text-base" />
                </div>

                <div className="mt-4 flex justify-end gap-3">
                  <button onClick={async () => { await submitMedicalRecord(); }} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md">
                    <Save className="h-4 w-4" />
                    <span>Создать</span>
                  </button>
                  <button onClick={() => { setRecordModalOpen(false); setSelectedAppointment(null); }} className="flex items-center gap-2 px-4 py-2 bg-gray-200 rounded-md">
                    <X className="h-4 w-4" />
                    <span>Отмена</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Отзывы пациентов</h2>
          {!(reviews && reviews.length) ? (
            <div className="p-6 bg-white rounded-xl border">Пока нет отзывов</div>
          ) : (
            <div className="space-y-4">
              {reviews.map(r => (
                <div key={r.id} className="p-4 bg-white rounded-lg border">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{r.patient?.name || 'Пациент'}</div>
                      <div className="text-sm text-neutral-600">{new Date(r.createdAt).toLocaleDateString()}</div>
                    </div>
                    <div className="text-lg font-semibold text-yellow-500">{r.rating} ★</div>
                  </div>
                  {r.comment && <div className="mt-2 text-sm text-neutral-700">{r.comment}</div>}
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Услуги</h2>

          {/* Add service form */}
      <div className="bg-white p-6 rounded-xl border">
        <AddServiceForm onCreate={createService} />
          </div>

          {!(services && services.length) ? (
            <div className="p-6 bg-white rounded-xl border mt-4">Услуги не найдены</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {(services || []).map(s => (
                <ServiceCard key={s.id} service={s} onUpdate={updateService} onDelete={deleteService} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function AddServiceForm({ onCreate }: { onCreate: (name: string, price: number, duration?: number) => Promise<void> }) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState<string>('');
  const [duration, setDuration] = useState<string>('30');

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    const p = Number(price);
    const d = Number(duration) || 30;
    if (!name || Number.isNaN(p)) return;
    await onCreate(name, p, d);
    setName(''); setPrice(''); setDuration('30');
  };

  return (
    <form onSubmit={handle} className="flex flex-col md:flex-row gap-3 items-center">
      <input value={name} onChange={e => setName(e.target.value)} placeholder="Название услуги" className="px-4 py-3 rounded-lg border w-full md:w-1/2 text-base" />
      <input value={price} onChange={e => setPrice(e.target.value)} placeholder="Цена" className="px-4 py-3 rounded-lg border w-full md:w-1/4 text-base" />
      <input value={duration} onChange={e => setDuration(e.target.value)} placeholder="Длительность (мин)" className="px-4 py-3 rounded-lg border w-full md:w-1/6 text-base" />
      <button className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-lg text-base">
        <Plus className="h-4 w-4" />
        <span>Добавить</span>
      </button>
    </form>
  );
}

function ServiceCard({ service, onUpdate, onDelete }: { service: any; onUpdate: any; onDelete: any }) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(service.name);
  const [price, setPrice] = useState(String(service.price));
  const [duration, setDuration] = useState(String(service.duration || 30));

  const save = async () => {
    const p = Number(price);
    const d = Number(duration) || 30;
    await onUpdate(service.id, { name, price: p, duration: d });
    setIsEditing(false);
  };

  return (
    <div className="p-6 bg-white rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div className="flex-1">
        {!isEditing ? (
          <>
            <div className="text-lg font-semibold">{service.name}</div>
            <div className="text-base text-neutral-600">{service.price} ₸ — {service.duration || 30} мин</div>
          </>
        ) : (
          // when editing we open a modal instead of inline inputs
          <>
            <div className="text-lg font-semibold">{service.name}</div>
            <div className="text-base text-neutral-600">{service.price} ₸ — {service.duration || 30} мин</div>
          </>
        )}
      </div>

      <div className="flex items-center space-x-3">
        <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-4 py-2 bg-yellow-400 text-white rounded-md">
          <Edit className="h-4 w-4" />
          <span>Ред.</span>
        </button>
        <button onClick={() => onDelete(service.id)} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md">
          <Trash2 className="h-4 w-4" />
          <span>Удалить</span>
        </button>
      </div>

      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsEditing(false)} />
          <div className="relative bg-white rounded-xl p-6 w-full max-w-lg z-10">
            <h3 className="text-lg font-semibold mb-4">Редактировать услугу</h3>
            <div className="space-y-3">
              <input value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-base" />
              <div className="flex gap-3">
                <input value={price} onChange={e => setPrice(e.target.value)} className="w-1/2 px-3 py-2 border rounded-lg text-base" />
                <input value={duration} onChange={e => setDuration(e.target.value)} className="w-1/2 px-3 py-2 border rounded-lg text-base" />
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-3">
              <button onClick={save} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md">
                <Save className="h-4 w-4" />
                <span>Сохранить</span>
              </button>
              <button onClick={() => setIsEditing(false)} className="flex items-center gap-2 px-4 py-2 bg-gray-200 rounded-md">
                <X className="h-4 w-4" />
                <span>Отмена</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


