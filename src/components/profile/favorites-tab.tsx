"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { 
  Heart, 
  Star, 
  MapPin, 
  Phone, 
  Clock, 
  User,
  Calendar,
  Search,
  Filter,
  Plus,
  X,
  HeartOff
} from "lucide-react";
import { cn } from "@/lib/utils";

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
  image?: string;
  description: string;
  availableSlots: string[];
  addedDate: string;
}

interface FavoriteDoctor extends Doctor {
  notes?: string;
  lastVisit?: string;
  nextAppointment?: string;
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
    description: "Опытный терапевт с 15-летним стажем. Специализируется на диагностике и лечении внутренних болезней.",
    availableSlots: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
    addedDate: "2024-10-15"
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
    description: "Ведущий кардиолог с международным опытом. Эксперт в области диагностики сердечно-сосудистых заболеваний.",
    availableSlots: ["08:00", "09:30", "11:00", "13:30", "15:00", "16:30"],
    addedDate: "2024-09-20"
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
    description: "Специалист по неврологическим расстройствам. Современные методы диагностики и лечения.",
    availableSlots: ["09:15", "10:45", "12:15", "14:30", "16:00", "17:30"],
    addedDate: "2024-11-01"
  }
];

export const FavoritesTab = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteDoctor[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSpecialty, setFilterSpecialty] = useState("");
  const [showAddDoctor, setShowAddDoctor] = useState(false);
  const [availableDoctors, setAvailableDoctors] = useState<Doctor[]>(mockDoctors);
  const [selectedDoctor, setSelectedDoctor] = useState<FavoriteDoctor | null>(null);
  const [showDoctorDetails, setShowDoctorDetails] = useState(false);
  const [doctorNotes, setDoctorNotes] = useState("");

  // Загрузка избранных врачей из localStorage
  useEffect(() => {
    if (user?.email) {
      const savedFavorites = localStorage.getItem(`favorites_${user.email}`);
      if (savedFavorites) {
        setFavorites(JSON.parse(savedFavorites));
      }
    }
  }, [user?.email]);

  // Сохранение избранных врачей в localStorage
  const saveFavorites = (newFavorites: FavoriteDoctor[]) => {
    if (user?.email) {
      localStorage.setItem(`favorites_${user.email}`, JSON.stringify(newFavorites));
      setFavorites(newFavorites);
    }
  };

  // Добавление врача в избранное
  const addToFavorites = (doctor: Doctor) => {
    const favoriteDoctor: FavoriteDoctor = {
      ...doctor,
      addedDate: new Date().toISOString().split('T')[0],
      notes: ""
    };
    
    const updatedFavorites = [...favorites, favoriteDoctor];
    saveFavorites(updatedFavorites);
    setShowAddDoctor(false);
  };

  // Удаление врача из избранного
  const removeFromFavorites = (doctorId: string) => {
    const updatedFavorites = favorites.filter(doctor => doctor.id !== doctorId);
    saveFavorites(updatedFavorites);
  };

  // Обновление заметок о враче
  const updateDoctorNotes = (doctorId: string, notes: string) => {
    const updatedFavorites = favorites.map(doctor =>
      doctor.id === doctorId ? { ...doctor, notes } : doctor
    );
    saveFavorites(updatedFavorites);
  };

  // Фильтрация врачей
  const filteredFavorites = favorites.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.clinic.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = !filterSpecialty || doctor.specialty === filterSpecialty;
    return matchesSearch && matchesSpecialty;
  });

  // Доступные врачи для добавления (исключая уже добавленных)
  const availableToAdd = availableDoctors.filter(doctor => 
    !favorites.some(fav => fav.id === doctor.id)
  );

  // Получение уникальных специальностей
  const specialties = [...new Set(favorites.map(doctor => doctor.specialty))];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                <Heart className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Избранные врачи
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Ваши любимые врачи для быстрого доступа
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowAddDoctor(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
            >
              <Plus className="h-4 w-4" />
              <span>Добавить врача</span>
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        {favorites.length > 0 && (
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Поиск врачей..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                />
              </div>

              {/* Specialty Filter */}
              {specialties.length > 0 && (
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-gray-400" />
                  <select
                    value={filterSpecialty}
                    onChange={(e) => setFilterSpecialty(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                  >
                    <option value="">Все специальности</option>
                    {specialties.map((specialty) => (
                      <option key={specialty} value={specialty}>
                        {specialty}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        )}
      </div> 
     {/* Content */}
      {favorites.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="text-center py-12">
            <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
              Нет избранных врачей
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Добавьте врачей в избранное для быстрого доступа к записи
            </p>
            <button
              onClick={() => setShowAddDoctor(true)}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
            >
              Добавить первого врача
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFavorites.map((doctor) => (
            <div
              key={doctor.id}
              className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow duration-200"
            >
              {/* Doctor Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {doctor.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {doctor.specialty}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeFromFavorites(doctor.id)}
                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  title="Удалить из избранного"
                >
                  <HeartOff className="h-4 w-4" />
                </button>
              </div>

              {/* Doctor Info */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span>{doctor.rating}</span>
                  <span>•</span>
                  <span>{doctor.experience} лет опыта</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <MapPin className="h-4 w-4" />
                  <span className="truncate">{doctor.clinic}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <Phone className="h-4 w-4" />
                  <span>{doctor.phone}</span>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-600 dark:text-gray-400">Стоимость:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {doctor.price.toLocaleString()} ₸
                </span>
              </div>

              {/* Notes */}
              {doctor.notes && (
                <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-medium">Заметки:</span> {doctor.notes}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setSelectedDoctor(doctor);
                    setDoctorNotes(doctor.notes || "");
                    setShowDoctorDetails(true);
                  }}
                  className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors text-sm"
                >
                  Подробнее
                </button>
                <button className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm">
                  Записаться
                </button>
              </div>

              {/* Added Date */}
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Добавлен: {new Date(doctor.addedDate).toLocaleDateString("ru-RU")}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Add Doctor */}
      {showAddDoctor && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-4xl w-full max-h-[85vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Добавить врача в избранное
                </h3>
                <button
                  onClick={() => setShowAddDoctor(false)}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-4">
              {availableToAdd.length === 0 ? (
                <div className="text-center py-8">
                  <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Все врачи уже в избранном
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Вы добавили всех доступных врачей в избранное
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availableToAdd.map((doctor) => (
                    <div
                      key={doctor.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => addToFavorites(doctor)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="h-5 w-5 text-red-600 dark:text-red-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 dark:text-white truncate">
                            {doctor.name}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {doctor.specialty}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Star className="h-3 w-3 text-yellow-500" />
                            <span className="text-xs text-gray-500">{doctor.rating}</span>
                            <span className="text-xs text-gray-500">•</span>
                            <span className="text-xs text-gray-500">{doctor.experience} лет</span>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                            {doctor.clinic}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {doctor.price.toLocaleString()} ₸
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Doctor Details */}
      {showDoctorDetails && selectedDoctor && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-2xl w-full max-h-[85vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Информация о враче
                </h3>
                <button
                  onClick={() => {
                    setShowDoctorDetails(false);
                    setSelectedDoctor(null);
                  }}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Doctor Header */}
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {selectedDoctor.name}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    {selectedDoctor.specialty}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedDoctor.rating} • {selectedDoctor.experience} лет опыта
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Описание</h4>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  {selectedDoctor.description}
                </p>
              </div>

              {/* Contact Info */}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Контактная информация</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-700 dark:text-gray-300">{selectedDoctor.clinic}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-700 dark:text-gray-300">{selectedDoctor.address}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-700 dark:text-gray-300">{selectedDoctor.phone}</span>
                  </div>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="font-medium text-gray-900 dark:text-white">Стоимость консультации:</span>
                <span className="text-lg font-bold text-red-600 dark:text-red-400">
                  {selectedDoctor.price.toLocaleString()} ₸
                </span>
              </div>

              {/* Notes */}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Личные заметки</h4>
                <textarea
                  value={doctorNotes}
                  onChange={(e) => setDoctorNotes(e.target.value)}
                  placeholder="Добавьте заметки о враче..."
                  rows={3}
                  className="w-full px-3 py-2 border-0 bg-gray-50 dark:bg-gray-800 rounded-lg focus:ring-1 focus:ring-red-500 dark:text-white text-sm resize-none"
                />
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex justify-between">
              <button
                onClick={() => {
                  updateDoctorNotes(selectedDoctor.id, doctorNotes);
                  setShowDoctorDetails(false);
                  setSelectedDoctor(null);
                }}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm"
              >
                Сохранить заметки
              </button>
              <div className="flex space-x-3">
                <button
                  onClick={() => removeFromFavorites(selectedDoctor.id)}
                  className="px-4 py-2 bg-red-100 hover:bg-red-200 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm"
                >
                  Удалить из избранного
                </button>
                <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm">
                  Записаться на прием
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};