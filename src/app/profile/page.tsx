"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/profile/sidebar";
import { ProfileTab } from "@/components/profile/profile-tab";
import { AppointmentsTab } from "@/components/profile/appointments-tab";
import { MedicalRecordsTab } from "@/components/profile/medical-records-tab";
import { PaymentsTab } from "@/components/profile/payments-tab";
import { FavoritesTab } from "@/components/profile/favorites-tab";
import { SettingsTab } from "@/components/profile/settings-tab";
import { ProfileHeader } from "@/components/profile/profile-header";
import { FileText, Heart, CreditCard, Bell, Shield, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

// Placeholder компоненты для остальных вкладок
const PlaceholderTab = ({ title, icon: Icon, description }: { title: string; icon: React.ComponentType<{ className?: string }>; description: string }) => (
    <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-12 text-center">
                <Icon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{title}</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">{description}</p>
                <div className="inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 rounded-lg">
                    <span className="text-sm font-medium">Скоро будет доступно</span>
                </div>
            </div>
        </div>
    </div>
);

export default function ProfilePage() {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("profile");
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push("/");
        }
    }, [isAuthenticated, isLoading, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    const renderTabContent = () => {
        switch (activeTab) {
            case "profile":
                return <ProfileTab />;
            case "appointments":
                return <AppointmentsTab />;
            case "medical-records":
                return <MedicalRecordsTab />;
            case "favorites":
                return <FavoritesTab />;
            case "payments":
                return <PaymentsTab />;
            case "notifications":
                return (
                    <PlaceholderTab
                        title="Настройки уведомлений"
                        icon={Bell}
                        description="Настройте, как и когда вы хотите получать уведомления о записях и напоминания."
                    />
                );
            case "security":
                return (
                    <PlaceholderTab
                        title="Безопасность"
                        icon={Shield}
                        description="Управляйте паролем, двухфакторной аутентификацией и другими настройками безопасности."
                    />
                );
            case "settings":
                return <SettingsTab />;
            default:
                return <ProfileTab />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Profile Header */}
            <ProfileHeader />

            {/* Sidebar */}
            <Sidebar
                activeTab={activeTab}
                onTabChange={setActiveTab}
                isCollapsed={sidebarCollapsed}
                onToggleCollapse={setSidebarCollapsed}
            />

            {/* Main Content */}
            <div className={cn(
                "p-4 lg:p-8 transition-all duration-300",
                sidebarCollapsed ? "ml-16" : "ml-72"
            )}>
                <div className="mt-20">
                    {renderTabContent()}
                </div>
            </div>
        </div>
    );
}