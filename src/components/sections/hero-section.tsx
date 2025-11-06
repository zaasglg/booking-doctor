import { HeroHighlight } from "@/components/ui/hero-highlight";
import { Cover } from "@/components/ui/container-cover";
import { motion } from "framer-motion";

export default function HeroSection() {
  return (
    <HeroHighlight containerClassName="min-h-screen">
      <div className="flex flex-col items-center justify-center px-4">
        <h1 className="text-3xl px-4 md:text-5xl lg:text-6xl font-bold text-neutral-700 dark:text-white max-w-5xl leading-relaxed lg:leading-snug text-center mx-auto mb-8 uppercase">
          Найдите лучших врачей и{" "}
          запишитесь на прием
          онлайн
        </h1>

        <motion.p
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.5,
            delay: 0.2,
            ease: [0.4, 0.0, 0.2, 1],
          }}
          className="text-lg md:text-xl text-neutral-600 dark:text-neutral-300 max-w-3xl text-center mx-auto mb-12"
        >
          Быстро и удобно находите квалифицированных специалистов,
          выбирайте удобное время и получайте качественную медицинскую помощь
        </motion.p>

        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.5,
            delay: 0.4,
            ease: [0.4, 0.0, 0.2, 1],
          }}
          className="flex flex-col sm:flex-row gap-4 mb-16"
        >
          <button className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200 shadow-lg">
            Записаться к врачу
          </button>
          <button className="px-8 py-4 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 font-semibold rounded-lg transition-colors duration-200">
            Найти специалиста
          </button>
        </motion.div>

        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.5,
            delay: 0.6,
            ease: [0.4, 0.0, 0.2, 1],
          }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto text-center"
        >
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <div className="text-3xl font-bold text-blue-600 mb-2">500+</div>
            <div className="text-neutral-600 dark:text-neutral-300">Врачей</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <div className="text-3xl font-bold text-blue-600 mb-2">50+</div>
            <div className="text-neutral-600 dark:text-neutral-300">Специальностей</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <div className="text-3xl font-bold text-blue-600 mb-2">24/7</div>
            <div className="text-neutral-600 dark:text-neutral-300">Поддержка</div>
          </div>
        </motion.div>
      </div>
    </HeroHighlight>
  );
}