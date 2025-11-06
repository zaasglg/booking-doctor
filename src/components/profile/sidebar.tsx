"use client";
import React, { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import {
  User,
  Calendar,
  FileText,
  Settings,
  Heart,
  CreditCard,
  LogOut,
  ChevronLeft,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: (collapsed: boolean) => void;
}

const menuItems = [
  {
    id: "profile",
    label: "Профиль",
    icon: User,
  },
  {
    id: "appointments",
    label: "Мои записи",
    icon: Calendar,
  },
  {
    id: "medical-records",
    label: "Медкарта",
    icon: FileText,
  },
  {
    id: "favorites",
    label: "Избранное",
    icon: Heart,
  },
  {
    id: "payments",
    label: "Платежи",
    icon: CreditCard,
  },
  {
    id: "settings",
    label: "Настройки",
    icon: Settings,
  },
];

export const Sidebar = ({ 
  activeTab, 
  onTabChange, 
  isCollapsed: externalCollapsed, 
  onToggleCollapse 
}: SidebarProps) => {
  const { user, logout } = useAuth();
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  
  const isCollapsed = externalCollapsed !== undefined ? externalCollapsed : internalCollapsed;
  const toggleCollapsed = onToggleCollapse || setInternalCollapsed;

  return (
    <div className={cn(
      "bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 h-[calc(100vh-5rem)] overflow-y-auto flex-shrink-0 fixed left-0 top-20 transition-all duration-300 z-40 rounded-2xl",
      isCollapsed ? "w-16" : "w-72"
    )}>
      {/* Toggle Button */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user?.name}
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
          )}
          
          <button
            onClick={() => toggleCollapsed(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-150"
          >
            {isCollapsed ? (
              <Menu className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronLeft className="h-4 w-4 text-gray-500" />
            )}
          </button>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="p-2">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={cn(
                  "w-full flex items-center rounded-lg text-left transition-colors duration-150",
                  isCollapsed ? "justify-center px-3 py-3" : "space-x-3 px-3 py-2",
                  isActive
                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                )}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className={cn("h-4 w-4",
                  isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-400 dark:text-gray-500")} />
                {!isCollapsed && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Logout Button */}
        <div className="mt-6 pt-3 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={logout}
            className={cn(
              "w-full flex items-center rounded-lg text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-150",
              isCollapsed ? "justify-center px-3 py-3" : "space-x-3 px-3 py-2"
            )}
            title={isCollapsed ? "Выйти" : undefined}
          >
            <LogOut className="h-4 w-4" />
            {!isCollapsed && (
              <span className="text-sm font-medium">Выйти</span>
            )}
          </button>
        </div>
      </nav>
    </div>
  );
};