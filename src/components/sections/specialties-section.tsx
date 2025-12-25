"use client";
import {
  IconHeartbeat,
  IconBrain,
  IconEye,
  IconDental,
  IconDroplet,
  IconWoman,
  IconBabyCarriage,
  IconStethoscope,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function SpecialtiesSection() {
  const specialties = [
    {
      title: "Терапевт",
      description: "Ваш первый помощник в вопросах здоровья. Профилактика, диагностика и лечение широкого спектра заболеваний. Консультации по общему самочувствию.",
      icon: <IconStethoscope className="h-8 w-8" />,
      iconBg: "from-blue-500/20 via-blue-400/20 to-cyan-500/20",
      iconColor: "text-blue-600 dark:text-blue-400",
      gradient: "from-blue-50 via-cyan-50 to-white dark:from-blue-950/30 dark:via-cyan-950/30 dark:to-black",
      borderColor: "border-blue-200/50 dark:border-blue-800/30",
      hoverBorder: "hover:border-blue-400/60 dark:hover:border-blue-500/50",
      shadowColor: "hover:shadow-blue-500/20 dark:hover:shadow-blue-500/10",
    },
    {
      title: "Кардиолог",
      description: "Забота о вашем сердце и сосудах. Современная диагностика, лечение аритмии, гипертонии. Профилактика сердечно-сосудистых заболеваний.",
      icon: <IconHeartbeat className="h-8 w-8" />,
      iconBg: "from-red-500/20 via-rose-400/20 to-pink-500/20",
      iconColor: "text-red-600 dark:text-red-400",
      gradient: "from-red-50 via-rose-50 to-white dark:from-red-950/30 dark:via-rose-950/30 dark:to-black",
      borderColor: "border-red-200/50 dark:border-red-800/30",
      hoverBorder: "hover:border-red-400/60 dark:hover:border-red-500/50",
      shadowColor: "hover:shadow-red-500/20 dark:hover:shadow-red-500/10",
      className: "md:col-span-1",
    },
    {
      title: "Невролог",
      description: "Здоровье нервной системы и мозга. Лечение головных болей, мигрени, неврозов. Реабилитация после инсультов и травм.",
      icon: <IconBrain className="h-8 w-8" />,
      iconBg: "from-purple-500/20 via-violet-400/20 to-indigo-500/20",
      iconColor: "text-purple-600 dark:text-purple-400",
      gradient: "from-purple-50 via-violet-50 to-white dark:from-purple-950/30 dark:via-violet-950/30 dark:to-black",
      borderColor: "border-purple-200/50 dark:border-purple-800/30",
      hoverBorder: "hover:border-purple-400/60 dark:hover:border-purple-500/50",
      shadowColor: "hover:shadow-purple-500/20 dark:hover:shadow-purple-500/10",
      className: "md:col-span-1",
    },
    {
      title: "Офтальмолог",
      description: "Сохраним ваше зрение на долгие годы. Диагностика глазных заболеваний, подбор очков и линз. Лечение катаракты и глаукомы.",
      icon: <IconEye className="h-8 w-8" />,
      iconBg: "from-emerald-500/20 via-green-400/20 to-teal-500/20",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      gradient: "from-emerald-50 via-green-50 to-white dark:from-emerald-950/30 dark:via-green-950/30 dark:to-black",
      borderColor: "border-emerald-200/50 dark:border-emerald-800/30",
      hoverBorder: "hover:border-emerald-400/60 dark:hover:border-emerald-500/50",
      shadowColor: "hover:shadow-emerald-500/20 dark:hover:shadow-emerald-500/10",
      className: "md:col-span-1",
    },
    {
      title: "Стоматолог",
      description: "Здоровая и красивая улыбка для всей семьи. Лечение кариеса, протезирование, имплантация. Профессиональная гигиена полости рта.",
      icon: <IconDental className="h-8 w-8" />,
      iconBg: "from-cyan-500/20 via-sky-400/20 to-blue-500/20",
      iconColor: "text-cyan-600 dark:text-cyan-400",
      gradient: "from-cyan-50 via-sky-50 to-white dark:from-cyan-950/30 dark:via-sky-950/30 dark:to-black",
      borderColor: "border-cyan-200/50 dark:border-cyan-800/30",
      hoverBorder: "hover:border-cyan-400/60 dark:hover:border-cyan-500/50",
      shadowColor: "hover:shadow-cyan-500/20 dark:hover:shadow-cyan-500/10",
      className: "md:col-span-1",
    },
    {
      title: "Дерматолог",
      description: "Красота и здоровье вашей кожи. Лечение акне, экземы, псориаза. Удаление новообразований и косметологические процедуры.",
      icon: <IconDroplet className="h-8 w-8" />,
      iconBg: "from-orange-500/20 via-amber-400/20 to-yellow-500/20",
      iconColor: "text-orange-600 dark:text-orange-400",
      gradient: "from-orange-50 via-amber-50 to-white dark:from-orange-950/30 dark:via-amber-950/30 dark:to-black",
      borderColor: "border-orange-200/50 dark:border-orange-800/30",
      hoverBorder: "hover:border-orange-400/60 dark:hover:border-orange-500/50",
      shadowColor: "hover:shadow-orange-500/20 dark:hover:shadow-orange-500/10",
      className: "md:col-span-1",
    },
    {
      title: "Гинеколог",
      description: "Деликатная забота о женском здоровье. Профилактические осмотры, планирование беременности, лечение гинекологических заболеваний.",
      icon: <IconWoman className="h-8 w-8" />,
      iconBg: "from-pink-500/20 via-rose-400/20 to-fuchsia-500/20",
      iconColor: "text-pink-600 dark:text-pink-400",
      gradient: "from-pink-50 via-rose-50 to-white dark:from-pink-950/30 dark:via-rose-950/30 dark:to-black",
      borderColor: "border-pink-200/50 dark:border-pink-800/30",
      hoverBorder: "hover:border-pink-400/60 dark:hover:border-pink-500/50",
      shadowColor: "hover:shadow-pink-500/20 dark:hover:shadow-pink-500/10",
      className: "md:col-span-1",
    },
    {
      title: "Педиатр",
      description: "Здоровье и развитие вашего ребенка - наш приоритет. Наблюдение с рождения, вакцинация, лечение детских заболеваний.",
      icon: <IconBabyCarriage className="h-8 w-8" />,
      iconBg: "from-amber-500/20 via-yellow-400/20 to-orange-500/20",
      iconColor: "text-amber-600 dark:text-amber-400",
      gradient: "from-amber-50 via-yellow-50 to-white dark:from-amber-950/30 dark:via-yellow-950/30 dark:to-black",
      borderColor: "border-amber-200/50 dark:border-amber-800/30",
      hoverBorder: "hover:border-amber-400/60 dark:hover:border-amber-500/50",
      shadowColor: "hover:shadow-amber-500/20 dark:hover:shadow-amber-500/10",
      className: "md:col-span-1",
    },
  ];

  return (
    <section className="relative py-24 bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-black dark:via-neutral-950 dark:to-black overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 dark:bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 dark:bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Left side - Header and Description */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12 lg:mb-0"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center gap-2 mb-6"
            >
              <div className="h-px w-8 bg-gradient-to-r from-transparent to-blue-500 dark:to-blue-400" />
              <span className="text-sm font-semibold px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/50 dark:to-cyan-950/50 text-blue-600 dark:text-blue-400 uppercase tracking-wider border border-blue-200/50 dark:border-blue-800/30">
                Специалисты
              </span>
              <div className="h-px w-8 bg-gradient-to-l from-transparent to-blue-500 dark:to-blue-400" />
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 relative"
            >
              <span className="bg-gradient-to-r from-gray-900 via-blue-800 to-gray-900 dark:from-white dark:via-blue-200 dark:to-white bg-clip-text text-transparent">
                Наши врачи-специалисты
              </span>
              <div className="absolute -bottom-2 left-0 w-24 h-1 bg-gradient-to-r from-blue-500 to-transparent dark:from-blue-400 rounded-full" />
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-lg md:text-xl text-gray-600 dark:text-gray-300 leading-relaxed"
            >
              Команда опытных врачей готова оказать вам качественную медицинскую помощь.
            </motion.p>
          </motion.div>

          {/* Right side - Vertical List */}
          <div className="flex flex-col gap-4">
            {specialties.map((specialty, index) => (
              <SpecialtyCard
                key={index}
                {...specialty}
                index={index}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function SpecialtyCard({
  title,
  description,
  icon,
  iconBg,
  iconColor,
  gradient,
  borderColor,
  hoverBorder,
  shadowColor,
  index,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  gradient: string;
  borderColor: string;
  hoverBorder: string;
  shadowColor: string;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{
        duration: 0.5,
        delay: index * 0.08,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{ x: -4, scale: 1.01 }}
      className={cn(
        "group relative rounded-2xl overflow-hidden",
        "bg-gradient-to-br",
        gradient,
        "border-2",
        borderColor,
        hoverBorder,
        "transition-all duration-500 ease-out",
        shadowColor,
        "hover:shadow-2xl",
        "cursor-pointer"
      )}
    >
      {/* Shine effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      </div>

      <div className="relative flex items-center gap-4 p-5">
        {/* Icon */}
        <div className={cn(
          "flex-shrink-0 p-3 rounded-xl bg-gradient-to-br",
          iconBg,
          "backdrop-blur-sm",
          "group-hover:scale-110 group-hover:rotate-3 transition-all duration-300"
        )}>
          <div className={iconColor}>
            {icon}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className={cn(
            "font-bold text-lg md:text-xl text-gray-900 dark:text-white mb-2",
            "group-hover:text-transparent group-hover:bg-clip-text",
            "group-hover:bg-gradient-to-r group-hover:from-gray-900 group-hover:to-gray-700",
            "dark:group-hover:from-white dark:group-hover:to-gray-300",
            "transition-all duration-300"
          )}>
            {title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-2 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors duration-300">
            {description}
          </p>
        </div>

        {/* Arrow indicator */}
        <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <svg
            className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>

        {/* Decorative left accent */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-current to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
      </div>
    </motion.div>
  );
}