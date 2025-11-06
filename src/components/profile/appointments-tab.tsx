"use client";
import React, { useState, useEffect } from "react";
import { Calendar, Clock, User, MapPin, Phone, Plus, Filter, X, Search } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

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
}

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  clinic: string;
  address: string;
  phone: string;
  rating: number;
  experience: number;
  price: number;
  availableSlots: string[];
}

const mockDoctors: Doctor[] = [
  {
    id: "1",
    name: "Доктор Иванов А.И.",
    specialty: "Терапевт",
    clinic: "Медицинский центр \"Здоровье\"",
    address: "ул. Абая, 123",
    phone: "+7 (777) 123-45-67",
    rating: 4.8,
    experience: 15,
    price: 8000,
    availableSlots: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"]
  },
  {
    id: "2",
    name: "Доктор Петрова М.С.",
    specialty: "Кардиолог",
    clinic: "Кардиологический центр",
    address: "пр. Достык, 456",
    phone: "+7 (777) 987-65-43",
    rating: 4.9,
    experience: 20,
    price: 12000,
    availableSlots: ["08:00", "09:30", "11:00", "13:30", "15:00", "16:30"]
  },
  {
    id: "3",
    name: "Доктор Сидоров В.П.",
    specialty: "Невролог",
    clinic: "Неврологическая клиника",
    address: "ул. Сатпаева, 789",
    phone: "+7 (777) 555-44-33",
    rating: 4.7,
    experience: 12,
    price: 10000,
    availableSlots: ["09:15", "10:45", "12:15", "14:30", "16:00", "17:30"]
  },
  {
    id: "4",
    name: "Доктор Казымова А.Б.",
    specialty: "Дерматолог",
    clinic: "Клиника красоты и здоровья",
    address: "ул. Толе би, 321",
    phone: "+7 (777) 111-22-33",
    rating: 4.6,
    experience: 8,
    price: 9000,
    availableSlots: ["10:00", "11:30", "13:00", "14:30", "16:00", "17:00"]
  },
  {
    id: "5",
    name: "Доктор Омаров Т.К.",
    specialty: "Ортопед",
    clinic: "Центр травматологии",
    address: "пр. Аль-Фараби, 654",
    phone: "+7 (777) 444-55-66",
    rating: 4.8,
    experience: 18,
    price: 11000,
    availableSlots: ["08:30", "10:00", "11:30", "13:00", "15:30", "17:00"]
  }
];

const mockAppointments: Appointment[] = [
  {
    id: "1",
    doctorName: "Доктор Иванов А.И.",
    specialty: "Терапевт",
    date: "2024-11-15",
    time: "10:00",
    status: "upcoming",
    clinic: "Медицинский центр \"Здоровье\"",
    address: "ул. Абая, 123",
    phone: "+7 (777) 123-45-67",
  },
  {
    id: "2",
    doctorName: "Доктор Петрова М.С.",
    specialty: "Кардиолог",
    date: "2024-10-28",
    time: "14:30",
    status: "completed",
    clinic: "Кардиологический центр",
    address: "пр. Достык, 456",
    phone: "+7 (777) 987-65-43",
  },
  {
    id: "3",
    doctorName: "Доктор Сидоров В.П.",
    specialty: "Невролог",
    date: "2024-10-20",
    time: "09:15",
    status: "cancelled",
    clinic: "Неврологическая клиника",
    address: "ул. Сатпаева, 789",
    phone: "+7 (777) 555-44-33",
  },
];

const statusColors = {
  upcoming: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
  completed: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
};

const statusLabels = {
  upcoming: "Предстоящий",
  completed: "Завершен",
  cancelled: "Отменен",
};

export const AppointmentsTab = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filter, setFilter] = useState<"all" | "upcoming" | "completed" | "cancelled">("all");
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [doctors] = useState<Doctor[]>(mockDoctors);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [bookingStep, setBookingStep] = useState<"search" | "select-time" | "confirm">("search");

  // Загрузка записей из localStorage
  useEffect(() => {
    if (user?.email) {
      const savedAppointments = localStorage.getItem(`appointments_${user.email}`);
      if (savedAppointments) {
        setAppointments(JSON.parse(savedAppointments));
      } else {
        setAppointments(mockAppointments);
      }
    }
  }, [user?.email]);

  // Сохранение записей в localStorage
  const saveAppointments = (newAppointments: Appointment[]) => {
    if (user?.email) {
      localStorage.setItem(`appointments_${user.email}`, JSON.stringify(newAppointments));
      setAppointments(newAppointments);
    }
  };

  const filteredAppointments = appointments.filter(
    (appointment) => filter === "all" || appointment.status === filter
  );

  const specialties = [...new Set(doctors.map(doctor => doctor.specialty))];

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = !selectedSpecialty || doctor.specialty === selectedSpecialty;
    return matchesSearch && matchesSpecialty;
  });

  const handleBookAppointment = () => {
    if (!selectedDoctor || !selectedDate || !selectedTime) return;

    const newAppointment: Appointment = {
      id: Date.now().toString(),
      doctorName: selectedDoctor.name,
      specialty: selectedDoctor.specialty,
      date: selectedDate,
      time: selectedTime,
      status: "upcoming",
      clinic: selectedDoctor.clinic,
      address: selectedDoctor.address,
      phone: selectedDoctor.phone,
    };

    const updatedAppointments = [newAppointment, ...appointments];
    saveAppointments(updatedAppointments);

    // Сброс состояния
    setShowBookingModal(false);
    setBookingStep("search");
    setSelectedDoctor(null);
    setSelectedDate("");
    setSelectedTime("");
    setSearchTerm("");
    setSelectedSpecialty("");
  };

  const handleCancelAppointment = (appointmentId: string) => {
    const updatedAppointments = appointments.map(appointment =>
      appointment.id === appointmentId
        ? { ...appointment, status: "cancelled" as const }
        : appointment
    );
    saveAppointments(updatedAppointments);
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
                          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                            <Phone className="h-4 w-4" />
                            <span>{appointment.phone}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col space-y-2 ml-4">
                      {appointment.status === "upcoming" && (
                        <>
                          <button className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors duration-200">
                            Изменить
                          </button>
                          <button
                            onClick={() => handleCancelAppointment(appointment.id)}
                            className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded transition-colors duration-200"
                          >
                            Отменить
                          </button>
                        </>
                      )}
                      {appointment.status === "completed" && (
                        <button className="px-3 py-1 text-sm bg-green-600 hover:bg-green-700 text-white rounded transition-colors duration-200">
                          Отзыв
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

      {/* Модальное окно записи к врачу */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-3xl w-full max-h-[85vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-medium text-gray-900 dark:text-white">
                  {bookingStep === "search" && "Выберите врача"}
                  {bookingStep === "select-time" && "Выберите время"}
                  {bookingStep === "confirm" && "Подтверждение"}
                </h3>
                <button
                  onClick={() => {
                    setShowBookingModal(false);
                    setBookingStep("search");
                    setSelectedDoctor(null);
                    setSelectedDate("");
                    setSelectedTime("");
                    setSearchTerm("");
                    setSelectedSpecialty("");
                  }}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="p-4">
              {bookingStep === "search" && (
                <div className="space-y-4">
                  {/* Поиск */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Поиск врача..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border-0 bg-gray-50 dark:bg-gray-800 rounded-lg focus:ring-1 focus:ring-blue-500 dark:text-white text-sm"
                    />
                  </div>

                  {/* Фильтр специальностей */}
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => setSelectedSpecialty("")}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${!selectedSpecialty
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400"
                        }`}
                    >
                      Все
                    </button>
                    {specialties.map((specialty) => (
                      <button
                        key={specialty}
                        onClick={() => setSelectedSpecialty(specialty)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${selectedSpecialty === specialty
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400"
                          }`}
                      >
                        {specialty}
                      </button>
                    ))}
                  </div>

                  {/* Список врачей */}
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {filteredDoctors.map((doctor) => (
                      <div
                        key={doctor.id}
                        className="border-0 bg-gray-50 dark:bg-gray-800 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                        onClick={() => {
                          setSelectedDoctor(doctor);
                          setBookingStep("select-time");
                        }}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                              {doctor.name}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              {doctor.specialty}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                              <span>★ {doctor.rating}</span>
                              <span>{doctor.experience} лет</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-gray-900 dark:text-white">
                              {doctor.price.toLocaleString()} ₸
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {bookingStep === "select-time" && selectedDoctor && (
                <div className="space-y-4">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                    <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                      {selectedDoctor.name}
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {selectedDoctor.specialty}
                    </p>
                  </div>

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
                        className="w-full px-3 py-2 border-0 bg-gray-50 dark:bg-gray-800 rounded-lg focus:ring-1 focus:ring-blue-500 dark:text-white text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Время
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {selectedDoctor.availableSlots.map((slot) => (
                          <button
                            key={slot}
                            onClick={() => setSelectedTime(slot)}
                            className={`px-3 py-2 text-xs rounded-lg transition-colors ${selectedTime === slot
                              ? "bg-blue-600 text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                              }`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between pt-2">
                    <button
                      onClick={() => setBookingStep("search")}
                      className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      Назад
                    </button>
                    <button
                      onClick={() => setBookingStep("confirm")}
                      disabled={!selectedDate || !selectedTime}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg text-sm"
                    >
                      Далее
                    </button>
                  </div>
                </div>
              )}

              {bookingStep === "confirm" && selectedDoctor && (
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Врач</span>
                      <span className="font-medium text-gray-900 dark:text-white">{selectedDoctor.name}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Дата</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {new Date(selectedDate).toLocaleDateString("ru-RU")}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Время</span>
                      <span className="font-medium text-gray-900 dark:text-white">{selectedTime}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Стоимость</span>
                      <span className="font-semibold text-blue-600 dark:text-blue-400">
                        {selectedDoctor.price.toLocaleString()} ₸
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between pt-2">
                    <button
                      onClick={() => setBookingStep("select-time")}
                      className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      Назад
                    </button>
                    <button
                      onClick={handleBookAppointment}
                      className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium"
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