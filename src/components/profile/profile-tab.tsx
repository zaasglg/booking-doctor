"use client";
import React, { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { User, Mail, Phone, Calendar, MapPin, Edit3, Save, X } from "lucide-react";

export const ProfileTab = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    birthDate: "",
    address: "",
    gender: "",
  });

  const handleSave = () => {
    // Здесь будет логика сохранения данных
    setIsEditing(false);
    alert("Профиль обновлен!");
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      birthDate: "",
      address: "",
      gender: "",
    });
    setIsEditing(false);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="px-4 lg:px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
              Личная информация
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Управляйте своими личными данными и настройками аккаунта
            </p>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 text-sm"
          >
            <Edit3 className="h-4 w-4" />
            <span>{isEditing ? "Отменить" : "Редактировать"}</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 lg:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            {/* Avatar Section */}
            <div className="lg:col-span-2 flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 mb-6">
              <div className="w-20 h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-2xl lg:text-3xl">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="text-center sm:text-left">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Фото профиля
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Загрузите фото для вашего профиля
                </p>
                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  Изменить фото
                </button>
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Полное имя
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={!isEditing}
                  className="w-full pl-10 pr-4 py-2 lg:py-3 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:bg-gray-50 dark:disabled:bg-gray-700 disabled:text-gray-500"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={!isEditing}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:bg-gray-50 dark:disabled:bg-gray-700 disabled:text-gray-500"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Телефон
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  disabled={!isEditing}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:bg-gray-50 dark:disabled:bg-gray-700 disabled:text-gray-500"
                />
              </div>
            </div>

            {/* Birth Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Дата рождения
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                  disabled={!isEditing}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:bg-gray-50 dark:disabled:bg-gray-700 disabled:text-gray-500"
                />
              </div>
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Пол
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                disabled={!isEditing}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:bg-gray-50 dark:disabled:bg-gray-700 disabled:text-gray-500"
              >
                <option value="">Выберите пол</option>
                <option value="male">Мужской</option>
                <option value="female">Женский</option>
              </select>
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Адрес
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  disabled={!isEditing}
                  rows={3}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:bg-gray-50 dark:disabled:bg-gray-700 disabled:text-gray-500 resize-none"
                  placeholder="Введите ваш адрес"
                />
              </div>
            </div>
          </div>

          {/* Save/Cancel Buttons */}
          {isEditing && (
            <div className="flex items-center space-x-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleSave}
                className="flex items-center space-x-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200"
              >
                <Save className="h-4 w-4" />
                <span>Сохранить изменения</span>
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center space-x-2 px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200"
              >
                <X className="h-4 w-4" />
                <span>Отменить</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};