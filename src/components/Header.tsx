"use client";
import React, { useState } from "react";
import { HoveredLink, Menu, MenuItem } from "@/components/ui/navbar-menu";
import { cn } from "@/lib/utils";
import { Button as MovingButton } from "@/components/ui/moving-border";
import { LoginModal } from "@/components/auth/login-modal";
import { RegisterModal } from "@/components/auth/register-modal";
import { useAuth } from "@/contexts/auth-context";
import { User, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Header({ hideLogo = false }: { hideLogo?: boolean }) {
  return (
    <div className="relative w-full flex items-center justify-center">
      <Navbar className="top-2" hideLogo={hideLogo} />
    </div>
  );
}

function Navbar({ className, hideLogo = false }: { className?: string; hideLogo?: boolean }) {
  const [active, setActive] = useState<string | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  return (
    <div className="w-full">
      {/* Logo */}
      {!hideLogo && (
        <div className="fixed top-10 left-10 z-50">
          <h1 className="text-2xl font-bold text-blue-600 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200">
            DOQ
          </h1>
        </div>
      )}

      {/* Navigation Menu */}
      <div
        className={cn("fixed top-10 inset-x-0 max-w-2xl mx-auto z-50", className)}
      >
        <Menu setActive={setActive}>
          <MenuItem setActive={setActive} active={active} item="Главная">
            <div className="flex flex-col space-y-4 text-sm">
              <HoveredLink href="/">О нас</HoveredLink>
              <HoveredLink href="/">Как это работает</HoveredLink>
              <HoveredLink href="/">Отзывы</HoveredLink>
              <HoveredLink href="/">Новости</HoveredLink>
            </div>
          </MenuItem>
          <MenuItem setActive={setActive} active={active} item="Врачи">
            <div className="flex flex-col space-y-4 text-sm p-4">
              <HoveredLink href="/doctors/therapist">
                <div className="flex flex-col">
                  <span className="font-semibold">Терапевт</span>
                  <span className="text-neutral-600 dark:text-neutral-400">Общая медицина и первичная диагностика</span>
                </div>
              </HoveredLink>
              <HoveredLink href="/doctors/cardiologist">
                <div className="flex flex-col">
                  <span className="font-semibold">Кардиолог</span>
                  <span className="text-neutral-600 dark:text-neutral-400">Заболевания сердца и сосудов</span>
                </div>
              </HoveredLink>
              <HoveredLink href="/doctors/neurologist">
                <div className="flex flex-col">
                  <span className="font-semibold">Невролог</span>
                  <span className="text-neutral-600 dark:text-neutral-400">Нервная система и головной мозг</span>
                </div>
              </HoveredLink>
              <HoveredLink href="/doctors/dentist">
                <div className="flex flex-col">
                  <span className="font-semibold">Стоматолог</span>
                  <span className="text-neutral-600 dark:text-neutral-400">Лечение и профилактика зубов</span>
                </div>
              </HoveredLink>
            </div>
          </MenuItem>
          <MenuItem setActive={setActive} active={active} item="Услуги">
            <div className="flex flex-col space-y-4 text-sm">
              <HoveredLink href="/services/consultation">Консультация</HoveredLink>
              <HoveredLink href="/services/diagnostics">Диагностика</HoveredLink>
              <HoveredLink href="/services/treatment">Лечение</HoveredLink>
              <HoveredLink href="/services/prevention">Профилактика</HoveredLink>
            </div>
          </MenuItem>
          <MenuItem setActive={setActive} active={active} item="Контакты">
            <div className="flex flex-col space-y-4 text-sm">
              <HoveredLink href="/contact">Связаться с нами</HoveredLink>
              <HoveredLink href="/support">Поддержка</HoveredLink>
              <HoveredLink href="/locations">Наши клиники</HoveredLink>
              <HoveredLink href="/feedback">Обратная связь</HoveredLink>
            </div>
          </MenuItem>
        </Menu>
      </div>

      {/* Auth Buttons */}
      <div className="fixed top-10 right-10 flex items-center space-x-4 z-50">
        {isLoading ? (
          <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse"></div>
        ) : isAuthenticated ? (
          <>
            {/* User Info */}
            <button
              onClick={() => router.push(user?.role === 'DOCTOR' ? '/doctor/dashboard' : '/profile')}
              className="flex items-center space-x-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm px-4 py-2 rounded-2xl border border-gray-200 dark:border-gray-600 hover:bg-white dark:hover:bg-gray-800 transition-colors duration-200"
            >
              <User className="h-4 w-4 text-gray-600 dark:text-gray-300" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {user?.name}
              </span>
            </button>

            {/* Logout Button */}
            <button
              onClick={logout}
              className="h-10 w-10 bg-red-600 hover:bg-red-700 text-white rounded-2xl transition-colors duration-200 flex items-center justify-center"
              title="Выйти"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </>
        ) : (
          <>
            <MovingButton
              borderRadius="1rem"
              className="bg-white dark:bg-slate-900 text-black dark:text-white border-neutral-200 dark:border-slate-800 text-sm"
              containerClassName="h-10 w-24"
              onClick={() => setIsLoginModalOpen(true)}
            >
              Войти
            </MovingButton>
            <button
              onClick={() => setIsRegisterModalOpen(true)}
              className="h-10 w-32 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-2xl transition-colors duration-200"
            >
              Регистрация
            </button>
          </>
        )}
      </div>

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />

      {/* Register Modal */}
      <RegisterModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
      />
    </div>
  );
}
