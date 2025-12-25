"use client";
import React, { useState, useEffect } from "react";
import { Calendar, Clock, User, MapPin, Phone, Plus, Filter, X, Search, ChevronLeft, Star, Heart } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";

interface Appointment {
  id: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  status: "upcoming" | "completed" | "cancelled";
  clinic: string;
  address: string;
  phone: string;
  serviceName?: string;
  price?: number;
}

interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
}

interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  middleName: string;
  specialty: string;
  rating: number;
  experience: number;
  services: Service[];
  availableSlots?: string[]; // We might mock this or fetch real slots later
}

const MOCK_SLOTS = ["09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00"];

const statusColors: Record<string, string> = {
  upcoming: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
  completed: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
};

const statusLabels: Record<string, string> = {
  upcoming: "Предстоящий",
  completed: "Завершен",
  cancelled: "Отменен",
};

export const AppointmentsTab = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [currentReviewAppointment, setCurrentReviewAppointment] = useState<string | null>(null);
  const [reviewedAppointments, setReviewedAppointments] = useState<string[]>([]);
  const [filter, setFilter] = useState<"all" | "upcoming" | "completed" | "cancelled">("all");
  const [showBookingModal, setShowBookingModal] = useState(false);

  // Wizard State
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1); // 1: Select Category, 2: Select Doctor, 3: Select Service, 4: Select Date/Time & Confirm
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [unavailableSlots, setUnavailableSlots] = useState<string[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  // Search/Filter State for Wizard
  const [searchQuery, setSearchQuery] = useState("");

  // Only for Step 2+ filtering if needed within a category, or just for search
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);

  // Load appointments
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/appointments', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          // mark reviewed flag by checking reviews existence could be added, but we'll rely on server check on submit
          setAppointments(data);
          // fetch user's reviews to mark which appointments have been reviewed
          try {
            const revRes = await fetch('/api/reviews', { headers: { 'Authorization': `Bearer ${token}` } });
            if (revRes.ok) {
              const userReviews = await revRes.json();
              setReviewedAppointments((userReviews || []).map((r: any) => r.appointmentId));
            }
          } catch (err) {
            console.error('Failed to fetch user reviews', err);
          }
        }
      } catch (error) {
        console.error("Failed to load appointments", error);
      }
    };
    fetchAppointments();
  }, []);

  // Load doctors
  useEffect(() => {
    const fetchDoctors = async () => {
      setLoadingDoctors(true);
      try {
        const res = await fetch('/api/doctors');
        if (res.ok) {
          setDoctors(await res.json());
        }

        // Also fetch favorites to mark them
        const token = localStorage.getItem('token');
        if (token) {
          const favRes = await fetch('/api/favorites', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (favRes.ok) {
            const favs = await favRes.json();
            setFavoriteIds(favs.map((d: any) => d.id));
          }
        }
      } catch (err) {
        console.error("Failed to fetch doctors", err);
      } finally {
        setLoadingDoctors(false);
      }
    };
    fetchDoctors();
  }, []);

  const handleToggleFavorite = async (e: React.MouseEvent, doctorId: string) => {
    e.stopPropagation(); // Prevent card click
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ doctorId })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.isFavorite) {
          setFavoriteIds([...favoriteIds, doctorId]);
        } else {
          setFavoriteIds(favoriteIds.filter(id => id !== doctorId));
        }
      }
    } catch (err) {
      console.error("Failed to toggle favorite", err);
    }
  };

  // UseEffect to fetch availability when doctor and date are selected
  useEffect(() => {
    const fetchAvailability = async () => {
      if (selectedDoctor && selectedDate) {
        // Reset time when date changes
        setSelectedTime("");

        try {
          const res = await fetch(`/api/appointments/availability?doctorId=${selectedDoctor.id}&date=${selectedDate}`);
          if (res.ok) {
            const data = await res.json();
            setUnavailableSlots(data.unavailableSlots || []);
          }
        } catch (error) {
          console.error("Failed to fetch availability", error);
        }
      } else {
        setUnavailableSlots([]);
      }
    };
    fetchAvailability();
  }, [selectedDoctor, selectedDate]);

  const filteredAppointments = appointments.filter(
    (appointment) => filter === "all" || appointment.status === filter
  );

  const uniqueSpecialties = Array.from(new Set(doctors.map(d => d.specialty)));

  const filteredDoctors = doctors.filter(doc => {
    const matchesSearch = `${doc.firstName} ${doc.lastName} ${doc.specialty}`.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialty = selectedSpecialty ? doc.specialty === selectedSpecialty : true;
    return matchesSearch && matchesSpecialty;
  });

  const handleBookAppointment = async () => {
    if (!selectedDoctor || !selectedService || !selectedDate || !selectedTime) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          doctorId: selectedDoctor.id,
          serviceId: selectedService.id,
          date: selectedDate,
          time: selectedTime
        })
      });

      if (res.ok) {
        const newAppointment = await res.json();
        setAppointments([newAppointment, ...appointments]);
        closeModal();
      }
    } catch (error) {
      alert('Ошибка при создании записи');
    }
  };


  const closeModal = () => {
    setShowBookingModal(false);
    setStep(1);
    setSelectedDoctor(null);
    setSelectedService(null);
    setSelectedDate("");
    setSelectedTime("");
    setSearchQuery("");
    setSelectedSpecialty(null);
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    return maxDate.toISOString().split('T')[0];
  };

  const handleCancelAppointment = async (id: string) => {
    if (!confirm('Вы уверены, что хотите отменить эту запись?')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/appointments', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id,
          status: 'cancelled'
        })
      });

      if (res.ok) {
        // Update local state
        setAppointments(appointments.map(apt =>
          apt.id === id ? { ...apt, status: 'cancelled' } : apt
        ));
      } else {
        alert('Ошибка при отмене записи');
      }
    } catch (error) {
      alert('Ошибка при отмене записи');
    }
  };


  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="px-4 lg:px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
                Мои записи
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Управляйте своими записями к врачам
              </p>
            </div>
            <button
              onClick={() => setShowBookingModal(true)}
              className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 text-sm"
            >
              <Plus className="h-4 w-4" />
              <span>Новая запись</span>
            </button>
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-4 mt-4">
            <Filter className="h-5 w-5 text-gray-400" />
            <div className="flex space-x-2">
              {[
                { key: "all", label: "Все" },
                { key: "upcoming", label: "Предстоящие" },
                { key: "completed", label: "Завершенные" },
                { key: "cancelled", label: "Отмененные" },
              ].map((filterOption) => (
                <button
                  key={filterOption.key}
                  onClick={() => setFilter(filterOption.key as "all" | "upcoming" | "completed" | "cancelled")}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200 ${filter === filterOption.key
                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                    }`}
                >
                  {filterOption.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Appointments List */}
        <div className="p-6">
          {filteredAppointments.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Нет записей
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                У вас пока нет записей к врачам
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {appointment.doctorName}
                        </h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[appointment.status]
                            }`}
                        >
                          {statusLabels[appointment.status]}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          {appointment.serviceName && (
                            <div className="flex items-center space-x-2 text-sm text-gray-900 dark:text-white font-medium">
                              <Clock className="h-4 w-4 text-gray-500" />
                              <span>{appointment.serviceName} {appointment.price ? `(${appointment.price} ₸)` : ''}</span>
                            </div>
                          )}
                          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                            <User className="h-4 w-4" />
                            <span>{appointment.specialty}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {new Date(appointment.date).toLocaleDateString("ru-RU", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                            <Clock className="h-4 w-4" />
                            <span>{appointment.time}</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-start space-x-2 text-sm text-gray-600 dark:text-gray-400">
                            <MapPin className="h-4 w-4 mt-0.5" />
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">
                                {appointment.clinic}
                              </div>
                              <div>{appointment.address}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col space-y-2 ml-4">
                      {appointment.status === 'upcoming' && (
                        <button
                          onClick={() => handleCancelAppointment(appointment.id)}
                          className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors border border-red-200 dark:border-red-900/30"
                        >
                          Отменить
                        </button>
                      )}
                        {appointment.status === 'completed' && !reviewedAppointments.includes(appointment.id) && (
                          <button
                            onClick={async () => {
                              // check if review exists (extra safeguard)
                              try {
                                const token = localStorage.getItem('token');
                                const res = await fetch(`/api/reviews?appointmentId=${appointment.id}`, { headers: { 'Authorization': `Bearer ${token}` } });
                                if (res.ok) {
                                  const existing = await res.json();
                                  if (existing) {
                                    alert('Вы уже оставили отзыв для этой записи.');
                                    // mark locally to hide button
                                    setReviewedAppointments(prev => Array.from(new Set([...prev, appointment.id])));
                                    return;
                                  }
                                }
                              } catch (err) {
                                console.error('Error checking review', err);
                              }
                              setCurrentReviewAppointment(appointment.id);
                              setReviewRating(5);
                              setReviewComment('');
                              setReviewModalOpen(true);
                            }}
                            className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-blue-200"
                          >
                            Оценить
                          </button>
                        )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {/* Modal code remains the same... needs to be explicitly included or just let the rest be implicit? The tool replaces until the end line... I must include the rest of the component or be careful with ranges.
     The user's file is large (543 lines). I should target the range from handleBookAppointment end to the bottom of the list rendering, but wait...
     I'll just replace the rendering part of the component to include the handler and the button.
  */}


      {/* Модальное окно записи к врачу */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-3xl w-full max-h-[85vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {step > 1 && (
                    <button onClick={() => setStep(step - 1 as 1 | 2 | 3 | 4)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                      <ChevronLeft className="h-5 w-5 text-gray-500" />
                    </button>
                  )}
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {step === 1 ? "Выберите специальность" : step === 2 ? "Выберите врача" : step === 3 ? "Выберите услугу" : "Детали записи"}
                  </h3>
                </div>
                <button
                  onClick={closeModal}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="p-4">
              {step === 1 && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Выберите направление для записи к врачу</p>

                  {loadingDoctors ? (
                    <div className="text-center py-8 text-gray-500">Загрузка специальностей...</div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {uniqueSpecialties.map((specialty) => (
                        <button
                          key={specialty}
                          onClick={() => {
                            setSelectedSpecialty(specialty);
                            setStep(2);
                          }}
                          className="p-4 bg-gray-50 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 border border-gray-200 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800 rounded-xl text-left transition-colors group"
                        >
                          <h4 className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                            {specialty}
                          </h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {doctors.filter(d => d.specialty === specialty).length} врачей
                          </p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder={`Поиск ${selectedSpecialty ? 'врача- ' + selectedSpecialty.toLowerCase() : 'врача'}...`}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 dark:text-white"
                    />
                  </div>

                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <span>Выбрано:</span>
                    <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full font-medium">
                      {selectedSpecialty}
                    </span>
                  </div>

                  <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                    {filteredDoctors.length === 0 ? (
                      <div className="flex items-center justify-center p-8 text-gray-500">Врачи не найдены</div>
                    ) : (
                      filteredDoctors.map((doc) => {
                        const minPrice = doc.services.length > 0 ? Math.min(...doc.services.map(s => s.price)) : 0;
                        return (
                          <div
                            key={doc.id}
                            onClick={() => {
                              setSelectedDoctor(doc);
                              setStep(3);
                            }}
                            className="flex justify-between items-center p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:shadow-md cursor-pointer transition-all bg-white dark:bg-gray-800"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                                {doc.firstName[0]}{doc.lastName[0]}
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900 dark:text-white">
                                  Доктор {doc.lastName} {doc.firstName[0]}.
                                </h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{doc.specialty}</p>
                                <div className="flex items-center text-xs text-yellow-500 mt-1 space-x-2">
                                  <span className="flex items-center"><Star className="h-3 w-3 mr-1 fill-current" /> {doc.rating}</span>
                                  <span className="text-gray-400">• {doc.experience} лет опыта</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="block font-bold text-gray-900 dark:text-white">
                                {minPrice > 0 ? `от ${minPrice.toLocaleString()} ₸` : "Нет цен"}
                              </span>
                              <button
                                onClick={(e) => handleToggleFavorite(e, doc.id)}
                                className="p-2 mt-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors inline-block"
                              >
                                <Heart className={cn("h-5 w-5", favoriteIds.includes(doc.id) ? "fill-red-500 text-red-500" : "")} />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {step === 3 && selectedDoctor && (
                <div className="space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg flex items-center space-x-3 mb-4">
                    <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                      {selectedDoctor.firstName[0]}{selectedDoctor.lastName[0]}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        Доктор {selectedDoctor.lastName} {selectedDoctor.firstName}
                      </h4>
                      <p className="text-sm text-gray-500">{selectedDoctor.specialty}</p>
                    </div>
                  </div>

                  <h4 className="font-medium text-gray-900 dark:text-white">Доступные услуги:</h4>
                  <div className="space-y-2">
                    {selectedDoctor.services.map((service) => (
                      <div
                        key={service.id}
                        onClick={() => {
                          setSelectedService(service);
                          setStep(4);
                        }}
                        className="flex justify-between items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 cursor-pointer transition-colors bg-white dark:bg-gray-800"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                            <Clock className="h-5 w-5 text-gray-500" />
                          </div>
                          <div>
                            <h5 className="font-medium text-gray-900 dark:text-white">{service.name}</h5>
                            <p className="text-xs text-gray-500">{service.duration} мин</p>
                          </div>
                        </div>
                        <span className="font-bold text-blue-600 dark:text-blue-400">
                          {service.price.toLocaleString()} ₸
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {step === 4 && selectedDoctor && selectedService && (
                <div className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Дата
                      </label>
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        min={getMinDate()}
                        max={getMaxDate()}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg focus:ring-1 focus:ring-blue-500 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Время
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {MOCK_SLOTS.map((slot) => {
                          const isUnavailable = unavailableSlots.includes(slot);
                          return (
                            <button
                              key={slot}
                              onClick={() => !isUnavailable && setSelectedTime(slot)}
                              disabled={isUnavailable}
                              className={`px-3 py-2 text-xs rounded-lg transition-colors border ${selectedTime === slot
                                ? "bg-blue-600 text-white border-blue-600"
                                : isUnavailable
                                  ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed decoration-slice"
                                  : "bg-white text-gray-700 hover:bg-gray-50 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:border-gray-700"
                                }`}
                            >
                              {slot}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mt-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Услуга:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedService.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Врач:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedDoctor.lastName} {selectedDoctor.firstName}</span>
                    </div>
                    <div className="flex justify-between font-bold pt-2 border-t border-gray-200 dark:border-gray-700">
                      <span className="text-gray-900 dark:text-white">Итого:</span>
                      <span className="text-blue-600 dark:text-blue-400">{selectedService.price.toLocaleString()} ₸</span>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={handleBookAppointment}
                      disabled={!selectedDate || !selectedTime}
                      className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white rounded-lg text-sm font-medium"
                    >
                      Подтвердить запись
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Review modal */}
      {reviewModalOpen && currentReviewAppointment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Оставить отзыв</h3>
              <button onClick={() => setReviewModalOpen(false)} className="text-gray-400 hover:text-gray-600">×</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Оценка</label>
                <div className="flex items-center space-x-2">
                  {[5,4,3,2,1].map((s) => (
                    <button
                      key={s}
                      onClick={() => setReviewRating(s)}
                      className={`px-3 py-1 rounded-lg border ${reviewRating === s ? 'bg-yellow-400 text-white' : 'bg-white dark:bg-gray-800'}`}
                    >{s} ★</button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Комментарий (опционально)</label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 dark:text-white"
                  rows={4}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setReviewModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-800 rounded-lg"
                >Отмена</button>
                <button
                  onClick={async () => {
                    try {
                      const token = localStorage.getItem('token');
                      const res = await fetch('/api/reviews', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${token}`,
                        },
                        body: JSON.stringify({ appointmentId: currentReviewAppointment, rating: reviewRating, comment: reviewComment })
                      });

                      if (res.ok) {
                        alert('Спасибо за отзыв!');
                        // mark locally as reviewed so button disappears
                        if (currentReviewAppointment) {
                          setReviewedAppointments(prev => Array.from(new Set([...prev, currentReviewAppointment])));
                        }
                        setReviewModalOpen(false);
                        setCurrentReviewAppointment(null);
                        // Optionally update local appointments or refetch
                      } else {
                        const err = await res.json().catch(() => ({}));
                        alert(err?.error || 'Ошибка при отправке отзыва');
                      }
                    } catch (err) {
                      console.error('Failed to submit review', err);
                      alert('Ошибка при отправке отзыва');
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                >Отправить</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};