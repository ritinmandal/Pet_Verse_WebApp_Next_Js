'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface BannerSlide {
  id: number;
  imgSrc: string;
  title: string;
  subtitle: string;
  description: string;
}

const Banner = () => {
  const slides: BannerSlide[] = [
    {
      id: 1,
      imgSrc: '/images/banner2.jpg',
      title: 'Welcome to Petverse',
      subtitle: 'CONNECT WITH PET LOVERS',
      description:
        'Join the ultimate hub for pets and their humans. Share stories, find friends, and celebrate the bond with your furry family.',
    },
    {
      id: 2,
      imgSrc: '/images/banner1.jpg',
      title: 'Premium Pet Care',
      subtitle: 'SERVICES YOU CAN TRUST',
      description:
        'From grooming to veterinary visits — discover trusted professionals to keep your pets healthy and happy.',
    },
    {
      id: 3,
      imgSrc: '/images/banner3.jpg',
      title: 'Everything Pets Need',
      subtitle: 'MARKETPLACE',
      description:
        'Shop curated products, premium accessories, and essentials for every type of pet — all in one place.',
    },
    {
      id: 4,
      imgSrc: '/images/banner4.jpg',
      title: 'Discover Local Pets',
      subtitle: 'FIND YOUR PACK',
      description:
        'Connect with pet parents nearby, set up playdates, and grow your community with Petverse’s discovery tools.',
    },
    {
      id: 5,
      imgSrc: '/images/banner6.jpg',
      title: 'Safe & Easy Payments',
      subtitle: 'PETVERSE WALLET',
      description:
        'Book services and shop with confidence using our secure, seamless wallet system.',
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  const slideTimerRef = useCallback(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  useEffect(() => {
    const cleanup = slideTimerRef();
    return cleanup;
  }, [slideTimerRef]);

  return (
    <section className="relative h-screen w-full overflow-hidden bg-black">
      
      {slides.map((slide, index) => (
        <motion.img
          key={slide.id}
          src={slide.imgSrc}
          alt={slide.title}
          className="absolute inset-0 w-full h-full object-cover"
          initial={{ opacity: 0 }}
          animate={{
            opacity: index === currentSlide ? 1 : 0,
            scale: index === currentSlide ? 1 : 1.05,
          }}
          transition={{ duration: 1.2, ease: 'easeInOut' }}
        />
      ))}

      
      <div className="absolute inset-0 bg-gradient-to-b from-teal-900/60 via-blue-900/50 to-black/70 z-0" />

      
      <div className="relative z-10 h-full flex items-center justify-center">
        <div className="text-center max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.p
            key={`subtitle-${currentSlide}`}
            className="text-teal-300 font-semibold text-sm sm:text-base lg:text-lg tracking-wider uppercase"
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {slides[currentSlide].subtitle}
          </motion.p>

          <motion.h1
            key={`title-${currentSlide}`}
            className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight drop-shadow-lg"
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            {slides[currentSlide].title}
          </motion.h1>

          <motion.p
            key={`desc-${currentSlide}`}
            className="text-white/90 text-sm sm:text-base md:text-lg lg:text-xl max-w-3xl mx-auto mt-4 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            {slides[currentSlide].description}
          </motion.p>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            className="mt-8 sm:mt-12 bg-gradient-to-r from-teal-500 to-blue-600 text-white font-semibold text-sm sm:text-base lg:text-lg px-6 sm:px-8 py-3 sm:py-4 rounded-full shadow-lg hover:shadow-xl"
          >
            Get Started
          </motion.button>
        </div>
      </div>

      
      <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? 'bg-teal-400 scale-125'
                : 'bg-white/50 hover:bg-white/75'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      
      <motion.button
        onClick={() => {
          const element = document.getElementById('main-content');
          if (element) element.scrollIntoView({ behavior: 'smooth' });
        }}
        className="absolute bottom-8 right-6 sm:right-10 text-white hover:text-teal-300 transition-colors duration-200 z-20"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        aria-label="Scroll to main content"
      >
        <ChevronDown className="w-6 h-6 sm:w-8 sm:h-8" />
      </motion.button>
    </section>
  );
};

export default Banner;
