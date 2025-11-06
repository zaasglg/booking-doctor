"use client";
import { cn } from "@/lib/utils";

export const BentoGrid = ({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        "grid md:auto-rows-[18rem] grid-cols-1 md:grid-cols-3 gap-4 max-w-7xl mx-auto ",
        className
      )}
    >
      {children}
    </div>
  );
};

export const BentoGridItem = ({
  className,
  title,
  description,
  header,
  icon,
}: {
  className?: string;
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  header?: React.ReactNode;
  icon?: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        "row-span-1 rounded-2xl group/bento hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 shadow-lg p-6 bg-gradient-to-br from-white to-gray-50 dark:from-black dark:to-gray-900 border border-gray-200/50 dark:border-white/[0.1] hover:border-blue-300/50 dark:hover:border-blue-500/30 justify-between flex flex-col space-y-4 hover:-translate-y-1 cursor-pointer",
        className
      )}
    >
      {header}
      <div className="group-hover/bento:translate-x-1 transition-all duration-300">
        <div className="mb-4 p-3 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 w-fit group-hover/bento:scale-110 transition-transform duration-300">
          {icon}
        </div>
        <div className="font-sans font-bold text-gray-900 dark:text-white mb-3 text-lg group-hover/bento:text-blue-600 dark:group-hover/bento:text-blue-400 transition-colors duration-300">
          {title}
        </div>
        <div className="font-sans font-normal text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
          {description}
        </div>
      </div>
    </div>
  );
};