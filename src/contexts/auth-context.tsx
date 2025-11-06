"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Загрузка пользователя из localStorage при инициализации
  useEffect(() => {
    const loadUser = () => {
      try {
        const savedUser = localStorage.getItem("user");
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      } catch (error) {
        console.error("Error loading user from localStorage:", error);
        localStorage.removeItem("user");
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  // Функция регистрации
  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      setIsLoading(true);

      // Получаем существующих пользователей
      const existingUsers = JSON.parse(localStorage.getItem("users") || "[]");

      // Проверяем, существует ли пользователь с таким email
      const userExists = existingUsers.some((u: User) => u.email === userData.email);
      if (userExists) {
        alert("Пользователь с таким email уже существует!");
        return false;
      }

      // Создаем нового пользователя
      const newUser: User = {
        id: Date.now().toString(),
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
      };

      // Сохраняем пароль отдельно (в реальном приложении пароли должны быть захешированы)
      const userWithPassword = {
        ...newUser,
        password: userData.password, // В реальном приложении нужно хешировать
      };

      // Добавляем пользователя в список
      const updatedUsers = [...existingUsers, userWithPassword];
      localStorage.setItem("users", JSON.stringify(updatedUsers));

      // Автоматически логиним пользователя после регистрации
      setUser(newUser);
      localStorage.setItem("user", JSON.stringify(newUser));

      return true;
    } catch (error) {
      console.error("Registration error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Функция входа
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);

      // Получаем пользователей из localStorage
      const users = JSON.parse(localStorage.getItem("users") || "[]");

      // Ищем пользователя с указанным email и паролем
      const foundUser = users.find(
        (u: { email: string; password: string }) => u.email === email && u.password === password
      );

      if (!foundUser) {
        alert("Неверный email или пароль!");
        return false;
      }

      // Создаем объект пользователя без пароля
      const userWithoutPassword: User = {
        id: foundUser.id,
        name: foundUser.name,
        email: foundUser.email,
        phone: foundUser.phone,
      };

      setUser(userWithoutPassword);
      localStorage.setItem("user", JSON.stringify(userWithoutPassword));

      return true;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Функция выхода
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};