'use client';

import { motion, AnimatePresence, Variants } from "framer-motion";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";

interface LoaderProps {
  isLoading: boolean;
}

export default function Loader({ isLoading }: LoaderProps) {
  const [show, setShow] = useState(isLoading);
  const titleRef = useRef<HTMLDivElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    setShow(isLoading);
  }, [isLoading]);


  useEffect(() => {
    if (show && titleRef.current && !hasAnimated && window.gsap) {
      const title = titleRef.current;
      const text = "PetVerse";

      title.innerHTML = '';
      text.split('').forEach((letter) => {
        const span = document.createElement('span');
        span.textContent = letter;
        span.style.opacity = '0';
        span.style.transform = 'translateY(20px)';
        title.appendChild(span);
      });

      const spans = title.querySelectorAll('span');
      window.gsap.fromTo(
        spans,
        { opacity: 0, y: 20, scale: 0.8 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          ease: "back.out(1.7)",
          stagger: 0.1,
          delay: 0.5,
          onComplete: () => {
            window.gsap.to(spans, {
              textShadow: "0 0 40px rgba(77, 201, 254, 0.8), 0 0 60px rgba(94, 178, 234, 0.6)",
              duration: 1.5,
              yoyo: true,
              repeat: -1,
              ease: "power2.inOut"
            });
          },
        }
      );

      setHasAnimated(true);
    }
  }, [show, hasAnimated]);

  useEffect(() => {
    if (!show) setHasAnimated(false);
  }, [show]);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 1, ease: "easeOut" } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 1, ease: "easeInOut" } },
  };

  const contentVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { delay: 0.2, duration: 1, ease: "easeOut" } },
    exit: { y: -20, opacity: 0, transition: { duration: 0.6, ease: "easeInOut" } },
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
        >
          
          <Image
            src="/images/banner2.jpg"
            alt="Background"
            fill
            className="object-cover"
            priority
          />

          
          <div className="absolute inset-0 bg-blue-950/40 backdrop-blur-lg" />

          
          <motion.div
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-4"
          >
            
            <div className="w-60 h-60 sm:w-64 sm:h-64 md:w-72 md:h-72 flex items-center justify-center">
              <motion.img
                src="/icons/loader.gif"  // <-- replace with your gif path
                alt="Loading..."
                className="w-full h-full object-contain"
                
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>

            
            <div
              ref={titleRef}
              className="font-[var(--font-inter)] text-5xl sm:text-5xl lg:text-7xl font-bold tracking-wide text-white"
              style={{
                letterSpacing: "0.2em",
                fontWeight: "700",
                textShadow: "0 0 20px rgba(245, 249, 251, 0.5)",
              }}
            />

            <motion.p
              className="text-white/80 text-lg mt-5 font-[var(--font-inter)] font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 1.1, duration: 1 }}
              style={{ letterSpacing: "0.02em" }}
            >
              Connecting Pets, Owners & Services in One Happy Place
            </motion.p>

            
            <motion.div
              className="flex space-x-2 mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 2.2 }}
            >
              {[0, 1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  className="w-3 h-3 bg-white/70 rounded-full"
                  animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.25, ease: "easeInOut" }}
                />
              ))}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
