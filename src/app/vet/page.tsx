'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface ServiceCard {
  id: number;
  title: string;
  description: string;
  image: string;
  alt: string;
}

const services: ServiceCard[] = [
  {
    id: 1,
    title: 'Dog checkup',
    description: 'Routine health exams ensure dogs stay strong, happy, and healthy.',
    image: '/images/vet1.jpg',
    alt: 'Veterinarian examining a golden retriever with stethoscope',
  },
  {
    id: 2,
    title: 'Cat wellness',
    description: 'Gentle, thorough health inspection tailored for your beloved cat.',
    image: '/images/vet2.jpg',
    alt: 'Veterinarian gently examining a gray and white cat',
  },
  {
    id: 3,
    title: 'Vet diagnostics',
    description: "Imaging and diagnostic services to assess your pet's health.",
    image: '/images/vet3.jpg',
    alt: 'Veterinarian looking at X-ray images on tablet',
  },
  {
    id: 4,
    title: 'Dental exam',
    description: 'Oral health checks prevent dental issues and improve pet wellness.',
    image: '/images/vet4.jpg',
    alt: "Close-up of dog's teeth being examined",
  },
  {
    id: 5,
    title: 'Pet nutrition',
    description: 'We guide pet owners on healthy diets and balanced nutrition for pets.',
    image: '/images/vet5.jpg',
    alt: 'Smiling veterinarian holding a golden retriever',
  },
  {
    id: 6,
    title: 'Behavior support',
    description: 'We help pets and owners with training, behavior, and gentle care.',
    image: '/images/vet6.jpg',
    alt: 'Female veterinarian holding a small dog',
  },
];

const plans = [
  {
    title: 'Puppy Plan',
    price: { monthly: 166, yearly: 166 * 12 },
    img: '/images/pricing1.jpg',
    features: [
      'Essential Pet Wellness',
      'Free Vet Consultation',
      'Essential Grooming',
      'Monthly Pet Care Tips',
      'Membership Discounts',
    ],
  },
  {
    title: 'Paw Plan',
    price: { monthly: 333, yearly: 333 * 12 },
    img: '/images/pricing2.jpg',
    features: [
      'Full Grooming Package',
      'Accessory Discounts (10%)',
      'Monthly Health Tracker',
      'Loyalty Reward Points',
      'Seasonal Flea Treatment',
    ],
  },
  {
    title: 'Tail-Wag Plan',
    price: { monthly: 500, yearly: 500 * 12 },
    img: '/images/pricing3.jpg',
    features: [
      'Teeth Cleaning Session',
      'Premium Organic Shampoo',
      'Pet Spa Therapy',
      'Seasonal Care Upgrade',
      'Skin Health Analysis',
    ],
  },
];

const ACCENT = {
  primary: 'bg-cyan-500',
  primaryText: 'text-cyan-500',
  primaryRing: 'ring-cyan-500/40',
  darkFrom: 'from-[#0b132b]',
  darkVia: 'via-[#1c2541]',
  darkTo: 'to-[#3a506b]',
  ink: 'text-[#0b132b]',
  inkSoft: 'text-[#1c2541]',
  onDark: 'text-white',
  yellow: 'text-yellow-400',
};

const PricingSection = () => {
  const [isYearly, setIsYearly] = React.useState(false);

  return (
    <section className="w-full bg-gradient-to-b from-slate-50 to-sky-50 py-16">
      <div className="text-center mb-12 px-4">
        <p className={`${ACCENT.primaryText} font-bold tracking-wide`}>/PRICING</p>
        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mt-2">
          Choose Your Plan
        </h2>

        <div className="mt-6 inline-flex rounded-full border border-slate-200 bg-white shadow-sm overflow-hidden">
          <button
            onClick={() => setIsYearly(false)}
            className={`px-6 py-2 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 ${ACCENT.primaryRing} ${
              !isYearly ? `${ACCENT.primary} text-white` : 'text-slate-800'
            }`}
            aria-pressed={!isYearly}
          >
            Monthly
          </button>
          <button
            onClick={() => setIsYearly(true)}
            className={`px-6 py-2 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 ${ACCENT.primaryRing} ${
              isYearly ? `${ACCENT.primary} text-white` : 'text-slate-800'
            }`}
            aria-pressed={isYearly}
          >
            Yearly
          </button>
        </div>

        <p className="mt-3 text-sm text-slate-600">
          Tip: Switch to <span className="font-semibold">Yearly</span> to keep billing simple.
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-4 grid gap-8 md:grid-cols-3">
        {plans.map((plan, i) => (
          <motion.div
            key={i}
            className="relative w-full bg-white rounded-2xl shadow-lg overflow-hidden h-[540px] flex flex-col justify-between cursor-pointer group border border-slate-100"
            initial={{ rotateY: 180, opacity: 0 }}
            whileInView={{ rotateY: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
            viewport={{ once: true }}
            style={{ perspective: 1000, transformStyle: 'preserve-3d' }}
          >
            <div className="relative w-full h-56">
              <Image
                src={plan.img}
                alt={plan.title}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover"
                priority={i === 0}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="absolute top-3 right-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-900 shadow">
                {plan.title}
              </span>
            </div>

            <div className="flex flex-col flex-1 justify-between p-6 transition-colors group-hover:bg-[#0b132b] group-hover:text-white">
              <div>
                <h3 className="text-xl font-semibold">{plan.title}</h3>

                <p className={`mt-3 text-3xl font-extrabold ${ACCENT.primaryText} group-hover:text-yellow-300`}>
                  ₹{isYearly ? plan.price.yearly : plan.price.monthly}
                  <span className="text-sm font-medium ml-1">/{isYearly ? 'yr' : 'mo'}</span>
                </p>

                <ul className="mt-6 space-y-2 text-sm">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="mt-2 mr-2 inline-block h-2 w-2 rounded-full bg-cyan-500 group-hover:bg-yellow-300" />
                      <span className="leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                className={`mt-6 w-full py-3 rounded-xl ${ACCENT.primary} text-white font-semibold
                transition-transform duration-300 hover:scale-105 active:scale-95
                group-hover:bg-white group-hover:text-[#0b132b] focus:outline-none focus-visible:ring-2 ${ACCENT.primaryRing}`}
                aria-label={`Select ${plan.title}`}
              >
                Select Plan
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

const VeterinaryServices: React.FC = () => {
  const router = useRouter();

  return (
    <div className={`min-h-screen bg-gradient-to-br ${ACCENT.darkFrom} ${ACCENT.darkVia} ${ACCENT.darkTo}`}>
      <div className="relative w-full h-48 sm:h-64 md:h-72 lg:h-80 mb-8">
        <Image
          src="/images/statbg9.jpg"
          alt="Products Banner"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-4">
          <h1 className="text-3xl md:text-5xl font-extrabold text-white drop-shadow-md">Veterinary Support</h1>
          <p className="text-sm md:text-base text-slate-200 mt-2">Home / Health</p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="text-center py-12 md:py-16 lg:py-20 px-4"
      >
        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-white mb-4 md:mb-6"
        >
          We support & nurture animal health
        </motion.h1>
        <motion.p
          viewport={{ once: true }}
          className="text-lg md:text-xl text-cyan-200/90 max-w-2xl mx-auto leading-relaxed"
        >
          Discover our veterinary services and how we help families every day.
        </motion.p>
      </motion.div>

      <div className="container mx-auto px-4 pb-16 md:pb-20 lg:pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-10 max-w-7xl mx-auto">
          {services.map((service) => (
            <motion.div
              key={service.id}
              className="bg-white/95 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group cursor-pointer border border-slate-100"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              viewport={{ once: true }}
            >
              <div className="relative h-48 md:h-52 lg:h-56 overflow-hidden">
                <Image
                  src={service.image}
                  alt={service.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              <div className="p-6 md:p-7 lg:p-8">
                <motion.h3
                  className="text-xl md:text-2xl font-bold text-slate-900 mb-3 md:mb-4 group-hover:text-[#0b132b] transition-colors duration-300"
                  whileHover={{ x: 5 }}
                >
                  {service.title}
                </motion.h3>
                <p className="text-slate-600 text-sm md:text-base leading-relaxed">
                  {service.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="relative w-full h-72 sm:h-80 md:h-96 mb-16">
        <Image
          src="/images/loadbg2.jpg"
          alt="Give your pet the care they deserve"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/60" />
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-4">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white">
            Give your pet the care they deserve today
          </h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/contactUs')}
            className={`mt-6 ${ACCENT.primary} text-white font-bold py-3 px-8 rounded-full text-lg md:text-xl transition-all duration-300 focus:outline-none focus-visible:ring-2 ${ACCENT.primaryRing}`}
          >
            Contact Us
          </motion.button>
        </div>
      </div>

      <PricingSection />

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="text-center py-12 md:py-16 bg-gradient-to-r from-sky-50 to-cyan-50"
      >
        <h3 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-slate-900 mb-4 md:mb-6">
          Ready to care for your pet?
        </h3>
        <p className="text-slate-600 text-lg md:text-xl mb-6 md:mb-8 max-w-2xl mx-auto px-4">
          Schedule an appointment today and give your beloved companion the care they deserve.
        </p>
      </motion.div>
    </div>
  );
};

export default VeterinaryServices;
