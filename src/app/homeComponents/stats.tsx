﻿"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";


const useAnimatedCounter = (end: number, duration = 2000, shouldStart = false) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!shouldStart) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);

      setCount(Math.floor(progress * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration, shouldStart]);

  return count;
};


type StatItemProps = {
  number: number;
  label: string;
  delay?: number;
};

const StatItem = ({ number, label, delay = 0 }: StatItemProps) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(ref, { once: false, amount: 0.3 });
  const animatedNumber = useAnimatedCounter(number, 2000, isInView);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
      className="flex flex-col items-center text-center"
    >
      
      <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-yellow-300 leading-tight ]">
        {animatedNumber}+
      </h2>

      
      <p className="text-sm sm:text-base md:text-lg lg:text-xl text-[#f5f5dc] font-medium mt-1 drop-shadow-[0_0_1px_rgba(255,255,255,0.7)]">
        {label}
      </p>
    </motion.div>
  );
};


const StatsSection = () => {
  const stats = [
    { number: 5000, label: "Users" },
    { number: 1700, label: "Products" },
    { number: 350, label: "Appointments" },
    { number: 70, label: "Pets Diagnosed" },
  ];

  return (
    <section
      className="relative py-16 sm:py-20 md:py-44 bg-fixed bg-center bg-cover"
      style={{ backgroundImage: "url('/images/banner7.jpg')" }}
    >
      
                  <div className="absolute inset-0 bg-blue-900/40 backdrop-blur-xs" />

      
      <div className="relative z-10 flex justify-center px-4 sm:px-8">
        <div className="grid grid-cols-1  sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10 md:gap-12 max-w-6xl w-full">
          {stats.map((stat, index) => (
            <StatItem
              key={index}
              number={stat.number}
              label={stat.label}
              delay={index * 0.2}
              
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
