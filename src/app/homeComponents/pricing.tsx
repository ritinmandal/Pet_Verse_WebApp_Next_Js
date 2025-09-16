"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

const plans = [
  {
    title: "Puppy Plan",
    price: { monthly: 166, yearly: 166 * 12 },
    img: "/images/pricing1.jpg",
    features: [
      "Essential Pet Wellness",
      "Free Vet Consultation",
      "Essential Grooming",
      "Monthly Pet Care Tips",
      "Membership Discounts",
    ],
  },
  {
    title: "Paw Plan",
    price: { monthly: 333, yearly: 333 * 12 },
    img: "/images/banner7.jpg",
    features: [
      "Full Grooming Package",
      "Accessory Discounts (10%)",
      "Monthly Health Tracker",
      "Loyalty Reward Points",
      "Seasonal Flea Treatment",
    ],
  },
  {
    title: "Tail-Wag Plan",
    price: { monthly: 500, yearly: 500 * 12 },
    img: "/images/pricing3.jpg",
    features: [
      "Teeth Cleaning Session",
      "Premium Organic Shampoo",
      "Pet Spa Therapy",
      "Seasonal Care Upgrade",
      "Skin Health Analysis",
    ],
  },
];

export default function PricingSection() {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <section className="w-full bg-gray-50 py-20 relative overflow-hidden">
      
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(6,182,212,0.08),transparent_70%)]" />

      
      <div className="text-center mb-16 relative z-10">
        <p className="text-cyan-600 font-semibold tracking-widest uppercase">
          Pricing
        </p>
        <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mt-3">
          Choose Your Perfect Plan
        </h2>

        
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => setIsYearly(false)}
            className={`px-6 py-2 rounded-l-full border transition-all duration-300 
              ${!isYearly
                ? "bg-cyan-600 text-white border-cyan-600"
                : "bg-white border-cyan-600 text-cyan-600 hover:bg-cyan-50"
              }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setIsYearly(true)}
            className={`px-6 py-2 rounded-r-full border transition-all duration-300 
              ${isYearly
                ? "bg-cyan-600 text-white border-cyan-600"
                : "bg-white border-cyan-600 text-cyan-600 hover:bg-cyan-50"
              }`}
          >
            Yearly
          </button>
        </div>
      </div>

      
      <div className="max-w-7xl mx-auto px-6 grid gap-10 md:grid-cols-3 relative z-10">
        {plans.map((plan, i) => (
          <motion.div
            key={i}
            className="relative w-full bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden flex flex-col justify-between group hover:shadow-xl hover:shadow-cyan-100 cursor-pointer transition-all"
            whileHover={{ scale: 1.05 }}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: i * 0.2 }}
            viewport={{ once: true }}
          >
            
            <div className="relative w-full h-52 overflow-hidden">
              <Image
                src={plan.img}
                alt={plan.title}
                fill
                className="object-cover transform group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
            </div>

            
            <div className="flex flex-col flex-1 justify-between p-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {plan.title}
                </h3>
                <p className="mt-4 text-3xl font-extrabold text-cyan-600">
                  ₹{isYearly ? plan.price.yearly : plan.price.monthly}
                  <span className="text-sm font-medium ml-1 text-gray-500">
                    /{isYearly ? "yr" : "mo"}
                  </span>
                </p>
                <ul className="mt-6 space-y-3 text-sm text-gray-600">
                  {plan.features.map((feature, idx) => (
                    <li
                      key={idx}
                      className="flex items-center gap-2 group-hover:text-gray-800 transition-colors"
                    >
                      <span className="w-2 h-2 rounded-full bg-cyan-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              
              <button
                className="mt-8 w-full py-3 rounded-xl bg-cyan-600 text-white font-semibold 
               transition-transform duration-300 hover:scale-105 active:scale-95 shadow-md shadow-cyan-200 
               group-hover:bg-cyan-500"
              >
                Select Plan
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
