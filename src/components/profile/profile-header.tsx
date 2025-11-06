"use client";
import React from "react";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { ArrowLeft, LogOut } from "lucide-react";

export const ProfileHeader = () => {
    const { user, logout } = useAuth();
    const router = useRouter();

    return (
        <div className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between px-6 py-3">
                {/* Left side - Back button and Logo */}
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => router.push("/")}
                        className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
                    >
                        <ArrowLeft className="h-5 w-5" />
                        <span className="text-sm font-medium">Назад</span>
                    </button>

                    <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>

                    <h1 className="text-xl font-bold text-blue-600">DOQ</h1>
                </div>

                {/* Center - Page title */}
                <div className="text-center">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Профиль пользователя
                    </h2>
                </div>

                {/* Right side - User info and logout */}
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="hidden sm:block">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {user?.name}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                {user?.email}
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={logout}
                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
                        title="Выйти"
                    >
                        <LogOut className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};