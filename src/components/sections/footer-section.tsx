import {
  Phone,
  Mail,
  MapPin,
  Clock,
} from "lucide-react";

export default function FooterSection() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-2xl font-bold text-blue-400 mb-4">DOQ</h3>
            <p className="text-gray-400 mb-4">
              Платформа для записи к врачам онлайн. Быстро, удобно, надежно.
            </p>
            <div className="flex items-center text-gray-400 mb-2">
              <Clock className="h-4 w-4 mr-2" />
              <span>Работаем 24/7</span>
            </div>
            <div className="flex items-center text-gray-400">
              <MapPin className="h-4 w-4 mr-2" />
              <span>Алматы, Казахстан</span>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Сервис</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="#" className="hover:text-white transition-colors duration-200">
                  Найти врача
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors duration-200">
                  Записаться на прием
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors duration-200">
                  Мои записи
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors duration-200">
                  Отзывы пациентов
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors duration-200">
                  Онлайн консультации
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Поддержка</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="#" className="hover:text-white transition-colors duration-200">
                  Центр помощи
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors duration-200">
                  Часто задаваемые вопросы
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors duration-200">
                  Контакты
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors duration-200">
                  Обратная связь
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors duration-200">
                  Техническая поддержка
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Контакты</h4>
            <div className="space-y-3 text-gray-400">
              <div className="flex items-center hover:text-white transition-colors duration-200">
                <Phone className="h-4 w-4 mr-3 text-blue-400" />
                <div>
                  <div className="font-medium">+7 (777) 123-45-67</div>
                  <div className="text-sm">Горячая линия</div>
                </div>
              </div>
              <div className="flex items-center hover:text-white transition-colors duration-200">
                <Mail className="h-4 w-4 mr-3 text-blue-400" />
                <div>
                  <div className="font-medium">info@doq.kz</div>
                  <div className="text-sm">Общие вопросы</div>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <h5 className="text-sm font-semibold mb-3">Следите за нами</h5>
              <div className="flex space-x-3">
                <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors duration-200">
                  <span className="sr-only">Instagram</span>
                  <div className="w-6 h-6 bg-gray-600 rounded hover:bg-blue-500 transition-colors duration-200"></div>
                </a>
                <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors duration-200">
                  <span className="sr-only">Telegram</span>
                  <div className="w-6 h-6 bg-gray-600 rounded hover:bg-blue-500 transition-colors duration-200"></div>
                </a>
                <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors duration-200">
                  <span className="sr-only">WhatsApp</span>
                  <div className="w-6 h-6 bg-gray-600 rounded hover:bg-green-500 transition-colors duration-200"></div>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-gray-400 text-sm">
            <p>&copy; 2024 DOQ. Все права защищены.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-white transition-colors duration-200">
                Политика конфиденциальности
              </a>
              <a href="#" className="hover:text-white transition-colors duration-200">
                Условия использования
              </a>
              <a href="#" className="hover:text-white transition-colors duration-200">
                Лицензии
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}