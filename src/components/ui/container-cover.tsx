"use client";
import { cn } from "@/lib/utils";
import React, { useRef, useState } from "react";
import { motion } from "framer-motion";

export const Cover = ({
    children,
    className,
}: {
    children?: React.ReactNode;
    className?: string;
}) => {
    const [hovered, setHovered] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    return (
        <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            ref={ref}
            className="relative inline-block"
        >
            <motion.div
                style={{
                    opacity: hovered ? 1 : 0,
                }}
                className="absolute inset-0 h-full w-full bg-neutral-900/[0.8] block rounded-lg"
            />

            <motion.span
                style={{
                    backgroundSize: hovered ? "100% 100%" : "0% 100%",
                }}
                transition={{
                    duration: 0.5,
                    ease: "linear",
                    delay: 0.2,
                }}
                className={cn(
                    `relative inline-block bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent bg-no-repeat bg-left-bottom transition-all duration-500`,
                    className
                )}
            >
                {children}
            </motion.span>
        </div>
    );
};