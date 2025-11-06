"use client";
import { cn } from "@/lib/utils";
import {
  IconCalendarEvent,
  IconClock,
  IconShieldCheck,
  IconStethoscope,
  IconUsers,
  IconDeviceMobile,
  IconCertificate,
  IconHeartHandshake,
} from "@tabler/icons-react";

export default function FeaturesSection() {
  const features = [
    {
      title: "Онлайн запись",
      description:
        "Записывайтесь на прием к врачу в любое время суток через наш сайт или мобильное приложение.",
      icon: <IconCalendarEvent />,
    },
    {
      title: "Быстро и удобно",
      description:
        "Находите подходящего врача за несколько минут и записывайтесь на удобное время.",
      icon: <IconClock />,
    },
    {
      title: "Проверенные врачи",
      description:
        "Все врачи в нашей базе имеют необходимые сертификаты и многолетний опыт работы.",
      icon: <IconShieldCheck />,
    },
    {
      title: "Широкий выбор специалистов",
      description: "Более 50 медицинских специальностей в одном месте для вашего удобства.",
      icon: <IconStethoscope />,
    },
    {
      title: "Персональный подход",
      description: "Индивидуальный подход к каждому пациенту и учет всех особенностей здоровья.",
      icon: <IconUsers />,
    },
    {
      title: "Мобильное приложение",
      description:
        "Управляйте записями, получайте напоминания и консультируйтесь с врачами через приложение.",
      icon: <IconDeviceMobile />,
    },
    {
      title: "Лицензированные клиники",
      description:
        "Сотрудничаем только с лицензированными медицинскими учреждениями.",
      icon: <IconCertificate />,
    },
    {
      title: "Забота о здоровье",
      description: "Ваше здоровье и комфорт - наш главный приоритет в работе.",
      icon: <IconHeartHandshake />,
    },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Почему выбирают нас
          </h2>
          <p className="text-lg text-gray-600">
            Мы делаем медицинские услуги доступными и удобными
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 relative z-10 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <Feature key={feature.title} {...feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

const Feature = ({
  title,
  description,
  icon,
  index,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  index: number;
}) => {
  return (
    <div
      className={cn(
        "flex flex-col lg:border-r py-10 relative group/feature dark:border-neutral-800 border-neutral-200",
        (index === 0 || index === 4) && "lg:border-l dark:border-neutral-800 border-neutral-200",
        index < 4 && "lg:border-b dark:border-neutral-800 border-neutral-200"
      )}
    >
      {index < 4 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-t from-blue-50 dark:from-neutral-800 to-transparent pointer-events-none" />
      )}
      {index >= 4 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-b from-blue-50 dark:from-neutral-800 to-transparent pointer-events-none" />
      )}
      <div className="mb-4 relative z-10 px-10 text-blue-600 dark:text-neutral-400">
        {icon}
      </div>
      <div className="text-lg font-bold mb-2 relative z-10 px-10">
        <div className="absolute left-0 inset-y-0 h-6 group-hover/feature:h-8 w-1 rounded-tr-full rounded-br-full bg-neutral-300 dark:bg-neutral-700 group-hover/feature:bg-blue-500 transition-all duration-200 origin-center" />
        <span className="group-hover/feature:translate-x-2 transition duration-200 inline-block text-neutral-800 dark:text-neutral-100">
          {title}
        </span>
      </div>
      <p className="text-sm text-neutral-600 dark:text-neutral-300 max-w-xs relative z-10 px-10">
        {description}
      </p>
    </div>
  );
};