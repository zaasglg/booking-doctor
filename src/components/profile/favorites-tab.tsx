"use client";
import React, { useState, useEffect } from "react";
import { Star, Search, MapPin, Heart, Calendar } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

interface Service {
  id: string;
  name: string;
  price: number;
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
  avatar?: string;
  bio?: string;
}

export const FavoritesTab = () => {
  const [favorites, setFavorites] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/favorites', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        setFavorites(await res.json());
      }
    } catch (err) {
      console.error("Failed to fetch favorites", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleToggleFavorite = async (doctorId: string) => {
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
        // Remove from list immediately
        setFavorites(favorites.filter(doc => doc.id !== doctorId));
      }
    } catch (err) {
      console.error("Failed to toggle favorite", err);
    }
  };

  // Booking Wizard State
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [step, setStep] = useState<1 | 2>(1); // 1: Select Service, 2: Select Date/Time & Confirm
  const [unavailableSlots, setUnavailableSlots] = useState<string[]>([]);
  const MOCK_SLOTS = ["09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00"];

  const handleBookClick = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setStep(1);
    setShowBookingModal(true);
  };

  const closeModal = () => {
    setShowBookingModal(false);
    setSelectedDoctor(null);
    setSelectedService(null);
    setSelectedDate("");
    setSelectedTime("");
    setStep(1);
    setUnavailableSlots([]);
  };

  // UseEffect to fetch availability when doctor and date are selected
  useEffect(() => {
    const fetchAvailability = async () => {
      if (selectedDoctor && selectedDate) {
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
        alert("Запись успешно создана!");
        closeModal();
      }
    } catch (error) {
      alert('Ошибка при создании записи');
    }
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

  const filteredFavorites = favorites.filter(doc =>
    `${doc.firstName} ${doc.lastName} ${doc.specialty}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Избранные врачи</h1>
        <p className="text-gray-500 mb-6">Список ваших сохраненных специалистов</p>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Поиск избранных врачей..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 dark:text-white"
          />
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Загрузка...</div>
        ) : filteredFavorites.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Список пуст</h3>
            <p className="text-gray-500">Добавляйте врачей в избранное, чтобы они появились здесь</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFavorites.map((doc) => {
              const minPrice = doc.services.length > 0 ? Math.min(...doc.services.map(s => s.price)) : 0;
              return (
                <div key={doc.id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-white dark:bg-gray-800 hover:shadow-md transition-shadow relative">
                  <button
                    onClick={() => handleToggleFavorite(doc.id)}
                    className="absolute top-4 right-4 p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                  >
                    <Heart className="h-5 w-5 fill-current" />
                  </button>

                  <div className="flex items-center space-x-4 mb-4">
                    <div className="h-14 w-14 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xl">
                      {doc.firstName[0]}{doc.lastName[0]}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {doc.lastName} {doc.firstName}
                      </h3>
                      <p className="text-sm text-blue-600 dark:text-blue-400">{doc.specialty}</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <div className="flex items-center space-x-2">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span>{doc.rating} рейтинг • {doc.experience} лет опыта</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {minPrice > 0 ? `от ${minPrice.toLocaleString()} ₸` : "Нет цен"}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleBookClick(doc)}
                    className="w-full py-2 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-colors text-sm font-medium">
                    Записаться
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {showBookingModal && selectedDoctor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-2xl w-full max-h-[85vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {step === 1 ? "Выберите услугу" : "Детали записи"}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-500">
                <span className="text-2xl">&times;</span>
              </button>
            </div>

            <div className="p-6">
              {step === 1 && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                      {selectedDoctor.firstName[0]}{selectedDoctor.lastName[0]}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        Доктор {selectedDoctor.lastName} {selectedDoctor.firstName}
                      </h4>
                      <p className="text-sm text-gray-500">{selectedDoctor.specialty}</p>
                    </div>
                  </div>

                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Доступные услуги:</h4>
                  <div className="space-y-2">
                    {selectedDoctor.services.map((service) => (
                      <div
                        key={service.id}
                        onClick={() => {
                          setSelectedService(service);
                          setStep(2);
                        }}
                        className="flex justify-between items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 cursor-pointer transition-colors bg-white dark:bg-gray-800"
                      >
                        <div className="font-medium text-gray-900 dark:text-white">{service.name}</div>
                        <div className="font-bold text-blue-600 dark:text-blue-400">{service.price.toLocaleString()} ₸</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {step === 2 && selectedService && (
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
                                ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed line-through decoration-gray-400"
                                : "bg-white text-gray-700 hover:bg-gray-50 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:border-gray-700"
                              }`}
                          >
                            {slot}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mt-4 space-y-2">
                    <div className="flex justify-between font-bold pt-2 border-t border-gray-200 dark:border-gray-700">
                      <span className="text-gray-900 dark:text-white">Итого:</span>
                      <span className="text-blue-600 dark:text-blue-400">{selectedService.price.toLocaleString()} ₸</span>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2 space-x-2">
                    <button
                      onClick={() => setStep(1)}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      Назад
                    </button>
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
    </div>
  );
};