"use client";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
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

export default function SpecialtiesSection() {
  const specialties = [
    {
      title: "Терапевт",
      description: "Ваш первый помощник в вопросах здоровья. Профилактика, диагностика и лечение широкого спектра заболеваний. Консультации по общему самочувствию.",
      icon: <IconStethoscope className="h-7 w-7 text-blue-600" />,
      className: "md:col-span-1",
    },
    {
      title: "Кардиолог",
      description: "Забота о вашем сердце и сосудах. Современная диагностика, лечение аритмии, гипертонии. Профилактика сердечно-сосудистых заболеваний.",
      icon: <IconHeartbeat className="h-7 w-7 text-red-600" />,
      className: "md:col-span-1",
    },
    {
      title: "Невролог",
      description: "Здоровье нервной системы и мозга. Лечение головных болей, мигрени, неврозов. Реабилитация после инсультов и травм.",
      icon: <IconBrain className="h-7 w-7 text-purple-600" />,
      className: "md:col-span-1",
    },
    {
      title: "Офтальмолог",
      description: "Сохраним ваше зрение на долгие годы. Диагностика глазных заболеваний, подбор очков и линз. Лечение катаракты и глаукомы.",
      icon: <IconEye className="h-7 w-7 text-green-600" />,
      className: "md:col-span-1",
    },
    {
      title: "Стоматолог",
      description: "Здоровая и красивая улыбка для всей семьи. Лечение кариеса, протезирование, имплантация. Профессиональная гигиена полости рта.",
      icon: <IconDental className="h-7 w-7 text-cyan-600" />,
      className: "md:col-span-1",
    },
    {
      title: "Дерматолог",
      description: "Красота и здоровье вашей кожи. Лечение акне, экземы, псориаза. Удаление новообразований и косметологические процедуры.",
      icon: <IconDroplet className="h-7 w-7 text-orange-600" />,
      className: "md:col-span-1",
    },
    {
      title: "Гинеколог",
      description: "Деликатная забота о женском здоровье. Профилактические осмотры, планирование беременности, лечение гинекологических заболеваний.",
      icon: <IconWoman className="h-7 w-7 text-pink-600" />,
      className: "md:col-span-1",
    },
    {
      title: "Педиатр",
      description: "Здоровье и развитие вашего ребенка - наш приоритет. Наблюдение с рождения, вакцинация, лечение детских заболеваний.",
      icon: <IconBabyCarriage className="h-7 w-7 text-amber-600" />,
      className: "md:col-span-1",
    },
  ];

  return (
    <section className="py-20 bg-gray-50 dark:bg-black">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        <div className="text-center mb-20">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Наши врачи-специалисты
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Команда опытных врачей готова оказать вам качественную медицинскую помощь.
            Выберите специалиста и запишитесь на консультацию в удобное время.
          </p>
        </div>

        <BentoGrid className="max-w-6xl mx-auto md:auto-rows-[19rem] grid-cols-1 md:grid-cols-4 gap-3">
          {specialties.map((specialty, index) => (
            <BentoGridItem
              key={index}
              title={specialty.title}
              description={specialty.description}
              icon={specialty.icon}
              className={specialty.className}
            />
          ))}
        </BentoGrid>
      </div>
    </section>
  );
}