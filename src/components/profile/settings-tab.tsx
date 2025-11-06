"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import {
    Settings,
    Moon,
    Sun,
    Globe,
    Bell,
    Shield,
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Clock,
    Save,
    Eye,
    EyeOff,
    Trash2,
    Download,
    Upload
} from "lucide-react";
import { cn } from "@/lib/utils";

interface UserSettings {
    theme: "light" | "dark" | "system";
    language: "ru" | "kk" | "en";
    notifications: {
        email: boolean;
        sms: boolean;
        push: boolean;
        appointments: boolean;
        promotions: boolean;
        reminders: boolean;
    };
    privacy: {
        profileVisible: boolean;
        shareData: boolean;
        analytics: boolean;
    };
    appointments: {
        defaultDuration: number;
        reminderTime: number;
        autoConfirm: boolean;
    };
}

const defaultSettings: UserSettings = {
    theme: "system",
    language: "ru",
    notifications: {
        email: true,
        sms: true,
        push: true,
        appointments: true,
        promotions: false,
        reminders: true,
    },
    privacy: {
        profileVisible: true,
        shareData: false,
        analytics: true,
    },
    appointments: {
        defaultDuration: 30,
        reminderTime: 60,
        autoConfirm: false,
    },
};

export const SettingsTab = () => {
    const { user, logout } = useAuth();
    const [settings, setSettings] = useState<UserSettings>(defaultSettings);
    const [activeSection, setActiveSection] = useState<"general" | "notifications" | "privacy" | "account">("general");
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showPasswordChange, setShowPasswordChange] = useState(false);
    const [passwordData, setPasswordData] = useState({
        current: "",
        new: "",
        confirm: ""
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });

    // Загрузка настроек из localStorage
    useEffect(() => {
        if (user?.email) {
            const savedSettings = localStorage.getItem(`settings_${user.email}`);
            if (savedSettings) {
                setSettings(JSON.parse(savedSettings));
            }
        }
    }, [user?.email]);

    // Сохранение настроек в localStorage
    const saveSettings = (newSettings: UserSettings) => {
        if (user?.email) {
            localStorage.setItem(`settings_${user.email}`, JSON.stringify(newSettings));
            setSettings(newSettings);
        }
    };

    // Обновление настроек
    const updateSettings = (section: keyof UserSettings, key: string, value: any) => {
        const newSettings = {
            ...settings,
            [section]: {
                ...(settings[section] as any),
                [key]: value
            }
        };
        saveSettings(newSettings);
    };

    // Смена пароля
    const handlePasswordChange = () => {
        if (!passwordData.current || !passwordData.new || !passwordData.confirm) {
            alert("Заполните все поля");
            return;
        }

        if (passwordData.new !== passwordData.confirm) {
            alert("Новые пароли не совпадают");
            return;
        }

        if (passwordData.new.length < 6) {
            alert("Пароль должен содержать минимум 6 символов");
            return;
        }

        // Здесь должна быть логика проверки текущего пароля и обновления
        alert("Пароль успешно изменен");
        setShowPasswordChange(false);
        setPasswordData({ current: "", new: "", confirm: "" });
    };

    // Удаление аккаунта
    const handleDeleteAccount = () => {
        if (user?.email) {
            // Удаляем все данные пользователя
            localStorage.removeItem(`user_${user.email}`);
            localStorage.removeItem(`settings_${user.email}`);
            localStorage.removeItem(`appointments_${user.email}`);
            localStorage.removeItem(`payments_${user.email}`);
            localStorage.removeItem(`paymentMethods_${user.email}`);
            localStorage.removeItem(`medicalRecords_${user.email}`);
            localStorage.removeItem(`vitalSigns_${user.email}`);
            localStorage.removeItem(`allergies_${user.email}`);
            localStorage.removeItem(`chronicConditions_${user.email}`);

            // Удаляем из списка пользователей
            const users = JSON.parse(localStorage.getItem("users") || "[]");
            const updatedUsers = users.filter((u: any) => u.email !== user.email);
            localStorage.setItem("users", JSON.stringify(updatedUsers));

            logout();
        }
    };

    // Экспорт данных
    const handleExportData = () => {
        if (!user?.email) return;

        const userData = {
            user: user,
            settings: settings,
            appointments: JSON.parse(localStorage.getItem(`appointments_${user.email}`) || "[]"),
            payments: JSON.parse(localStorage.getItem(`payments_${user.email}`) || "[]"),
            paymentMethods: JSON.parse(localStorage.getItem(`paymentMethods_${user.email}`) || "[]"),
            medicalRecords: JSON.parse(localStorage.getItem(`medicalRecords_${user.email}`) || "[]"),
            vitalSigns: JSON.parse(localStorage.getItem(`vitalSigns_${user.email}`) || "{}"),
            allergies: JSON.parse(localStorage.getItem(`allergies_${user.email}`) || "{}"),
            chronicConditions: JSON.parse(localStorage.getItem(`chronicConditions_${user.email}`) || "{}")
        };

        const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `medbooking_data_${user.email}_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const sections = [
        { id: "general", label: "Общие", icon: Settings },
        { id: "notifications", label: "Уведомления", icon: Bell },
        { id: "privacy", label: "Приватность", icon: Shield },
        { id: "account", label: "Аккаунт", icon: User }
    ];

    const languages = [
        { code: "ru", name: "Русский" },
        { code: "kk", name: "Қазақша" },
        { code: "en", name: "English" }
    ];

    const themes = [
        { code: "light", name: "Светлая", icon: Sun },
        { code: "dark", name: "Темная", icon: Moon },
        { code: "system", name: "Системная", icon: Settings }
    ];

    return (
        <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                            <Settings className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Настройки
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                Управляйте настройками профиля и приложения
                            </p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <div className="px-6 py-4">
                    <div className="flex space-x-1">
                        {sections.map((section) => {
                            const Icon = section.icon;
                            return (
                                <button
                                    key={section.id}
                                    onClick={() => setActiveSection(section.id as any)}
                                    className={cn(
                                        "flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200",
                                        activeSection === section.id
                                            ? "bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                                            : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                                    )}
                                >
                                    <Icon className="h-4 w-4" />
                                    <span>{section.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>      {/*
 Content */}
            {activeSection === "general" && (
                <div className="space-y-6">
                    {/* Тема */}
                    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Внешний вид
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                    Тема оформления
                                </label>
                                <div className="grid grid-cols-3 gap-3">
                                    {themes.map((theme) => {
                                        const Icon = theme.icon;
                                        return (
                                            <button
                                                key={theme.code}
                                                onClick={() => updateSettings("theme", "theme", theme.code)}
                                                className={cn(
                                                    "flex items-center space-x-2 p-3 rounded-lg border transition-colors",
                                                    settings.theme === theme.code
                                                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400"
                                                        : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                                                )}
                                            >
                                                <Icon className="h-4 w-4" />
                                                <span className="text-sm font-medium">{theme.name}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Язык */}
                    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Язык и регион
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                    Язык интерфейса
                                </label>
                                <div className="grid grid-cols-3 gap-3">
                                    {languages.map((language) => (
                                        <button
                                            key={language.code}
                                            onClick={() => updateSettings("language", "language", language.code)}
                                            className={cn(
                                                "flex items-center justify-center p-3 rounded-lg border transition-colors",
                                                settings.language === language.code
                                                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400"
                                                    : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                                            )}
                                        >
                                            <span className="text-sm font-medium">{language.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Записи */}
                    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Настройки записей
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Длительность приема по умолчанию (минуты)
                                </label>
                                <select
                                    value={settings.appointments.defaultDuration}
                                    onChange={(e) => updateSettings("appointments", "defaultDuration", parseInt(e.target.value))}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                                >
                                    <option value={15}>15 минут</option>
                                    <option value={30}>30 минут</option>
                                    <option value={45}>45 минут</option>
                                    <option value={60}>1 час</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Напоминание за (минуты)
                                </label>
                                <select
                                    value={settings.appointments.reminderTime}
                                    onChange={(e) => updateSettings("appointments", "reminderTime", parseInt(e.target.value))}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                                >
                                    <option value={15}>15 минут</option>
                                    <option value={30}>30 минут</option>
                                    <option value={60}>1 час</option>
                                    <option value={120}>2 часа</option>
                                    <option value={1440}>1 день</option>
                                </select>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Автоподтверждение записей
                                    </label>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Автоматически подтверждать записи без ожидания
                                    </p>
                                </div>
                                <button
                                    onClick={() => updateSettings("appointments", "autoConfirm", !settings.appointments.autoConfirm)}
                                    className={cn(
                                        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                                        settings.appointments.autoConfirm ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-700"
                                    )}
                                >
                                    <span
                                        className={cn(
                                            "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                                            settings.appointments.autoConfirm ? "translate-x-6" : "translate-x-1"
                                        )}
                                    />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeSection === "notifications" && (
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                        Настройки уведомлений
                    </h3>
                    <div className="space-y-6">
                        {/* Способы уведомлений */}
                        <div>
                            <h4 className="font-medium text-gray-900 dark:text-white mb-4">Способы уведомлений</h4>
                            <div className="space-y-4">
                                {[
                                    { key: "email", label: "Email уведомления", description: "Получать уведомления на электронную почту" },
                                    { key: "sms", label: "SMS уведомления", description: "Получать SMS на мобильный телефон" },
                                    { key: "push", label: "Push уведомления", description: "Уведомления в браузере" }
                                ].map((item) => (
                                    <div key={item.key} className="flex items-center justify-between">
                                        <div>
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                {item.label}
                                            </label>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {item.description}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => updateSettings("notifications", item.key, !settings.notifications[item.key as keyof typeof settings.notifications])}
                                            className={cn(
                                                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                                                settings.notifications[item.key as keyof typeof settings.notifications] ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-700"
                                            )}
                                        >
                                            <span
                                                className={cn(
                                                    "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                                                    settings.notifications[item.key as keyof typeof settings.notifications] ? "translate-x-6" : "translate-x-1"
                                                )}
                                            />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Типы уведомлений */}
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                            <h4 className="font-medium text-gray-900 dark:text-white mb-4">Типы уведомлений</h4>
                            <div className="space-y-4">
                                {[
                                    { key: "appointments", label: "Записи к врачам", description: "Подтверждения, изменения, напоминания" },
                                    { key: "reminders", label: "Напоминания", description: "Напоминания о предстоящих приемах" },
                                    { key: "promotions", label: "Акции и предложения", description: "Специальные предложения и скидки" }
                                ].map((item) => (
                                    <div key={item.key} className="flex items-center justify-between">
                                        <div>
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                {item.label}
                                            </label>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {item.description}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => updateSettings("notifications", item.key, !settings.notifications[item.key as keyof typeof settings.notifications])}
                                            className={cn(
                                                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                                                settings.notifications[item.key as keyof typeof settings.notifications] ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-700"
                                            )}
                                        >
                                            <span
                                                className={cn(
                                                    "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                                                    settings.notifications[item.key as keyof typeof settings.notifications] ? "translate-x-6" : "translate-x-1"
                                                )}
                                            />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {activeSection === "privacy" && (
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                        Настройки приватности
                    </h3>
                    <div className="space-y-6">
                        {[
                            {
                                key: "profileVisible",
                                label: "Видимость профиля",
                                description: "Разрешить врачам видеть базовую информацию профиля"
                            },
                            {
                                key: "shareData",
                                label: "Обмен данными",
                                description: "Разрешить обмен медицинскими данными между клиниками"
                            },
                            {
                                key: "analytics",
                                label: "Аналитика",
                                description: "Разрешить сбор анонимных данных для улучшения сервиса"
                            }
                        ].map((item) => (
                            <div key={item.key} className="flex items-center justify-between py-4 border-b border-gray-100 dark:border-gray-800 last:border-b-0">
                                <div>
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {item.label}
                                    </label>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        {item.description}
                                    </p>
                                </div>
                                <button
                                    onClick={() => updateSettings("privacy", item.key, !settings.privacy[item.key as keyof typeof settings.privacy])}
                                    className={cn(
                                        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                                        settings.privacy[item.key as keyof typeof settings.privacy] ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-700"
                                    )}
                                >
                                    <span
                                        className={cn(
                                            "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                                            settings.privacy[item.key as keyof typeof settings.privacy] ? "translate-x-6" : "translate-x-1"
                                        )}
                                    />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeSection === "account" && (
                <div className="space-y-6">
                    {/* Информация об аккаунте */}
                    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Информация об аккаунте
                        </h3>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Имя
                                    </label>
                                    <p className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 p-2 rounded">
                                        {user?.name || "Не указано"}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Email
                                    </label>
                                    <p className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 p-2 rounded">
                                        {user?.email || "Не указано"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Безопасность */}
                    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Безопасность
                        </h3>
                        <div className="space-y-4">
                            <button
                                onClick={() => setShowPasswordChange(true)}
                                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                            >
                                <Shield className="h-4 w-4" />
                                <span>Изменить пароль</span>
                            </button>
                        </div>
                    </div>

                    {/* Данные */}
                    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Управление данными
                        </h3>
                        <div className="space-y-4">
                            <button
                                onClick={handleExportData}
                                className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200"
                            >
                                <Download className="h-4 w-4" />
                                <span>Экспорт данных</span>
                            </button>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Скачать все ваши данные в формате JSON
                            </p>
                        </div>
                    </div>

                    {/* Опасная зона */}
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-red-900 dark:text-red-400 mb-4">
                            Опасная зона
                        </h3>
                        <div className="space-y-4">
                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
                            >
                                <Trash2 className="h-4 w-4" />
                                <span>Удалить аккаунт</span>
                            </button>
                            <p className="text-xs text-red-600 dark:text-red-400">
                                Это действие нельзя отменить. Все ваши данные будут удалены навсегда.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Модальное окно смены пароля */}
            {showPasswordChange && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-gray-900 rounded-xl max-w-md w-full">
                        <div className="p-4 border-b border-gray-100 dark:border-gray-800">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Изменить пароль
                            </h3>
                        </div>
                        <div className="p-4 space-y-4">
                            {[
                                { key: "current", label: "Текущий пароль", placeholder: "Введите текущий пароль" },
                                { key: "new", label: "Новый пароль", placeholder: "Введите новый пароль" },
                                { key: "confirm", label: "Подтвердите пароль", placeholder: "Повторите новый пароль" }
                            ].map((field) => (
                                <div key={field.key}>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        {field.label}
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPasswords[field.key as keyof typeof showPasswords] ? "text" : "password"}
                                            value={passwordData[field.key as keyof typeof passwordData]}
                                            onChange={(e) => setPasswordData({ ...passwordData, [field.key]: e.target.value })}
                                            placeholder={field.placeholder}
                                            className="w-full px-3 py-2 pr-10 border-0 bg-gray-50 dark:bg-gray-800 rounded-lg focus:ring-1 focus:ring-blue-500 dark:text-white text-sm"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPasswords({
                                                ...showPasswords,
                                                [field.key]: !showPasswords[field.key as keyof typeof showPasswords]
                                            })}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showPasswords[field.key as keyof typeof showPasswords] ?
                                                <EyeOff className="h-4 w-4" /> :
                                                <Eye className="h-4 w-4" />
                                            }
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex justify-end space-x-3">
                            <button
                                onClick={() => {
                                    setShowPasswordChange(false);
                                    setPasswordData({ current: "", new: "", confirm: "" });
                                }}
                                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                                Отмена
                            </button>
                            <button
                                onClick={handlePasswordChange}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
                            >
                                Изменить пароль
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Модальное окно подтверждения удаления */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-gray-900 rounded-xl max-w-md w-full">
                        <div className="p-4 border-b border-gray-100 dark:border-gray-800">
                            <h3 className="text-lg font-semibold text-red-900 dark:text-red-400">
                                Удалить аккаунт
                            </h3>
                        </div>
                        <div className="p-4">
                            <p className="text-gray-700 dark:text-gray-300 mb-4">
                                Вы уверены, что хотите удалить свой аккаунт? Это действие нельзя отменить.
                            </p>
                            <p className="text-sm text-red-600 dark:text-red-400">
                                Будут удалены:
                            </p>
                            <ul className="text-sm text-red-600 dark:text-red-400 list-disc list-inside mt-2">
                                <li>Все записи к врачам</li>
                                <li>История платежей</li>
                                <li>Медицинские данные</li>
                                <li>Настройки профиля</li>
                            </ul>
                        </div>
                        <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex justify-end space-x-3">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                                Отмена
                            </button>
                            <button
                                onClick={handleDeleteAccount}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium"
                            >
                                Удалить аккаунт
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};