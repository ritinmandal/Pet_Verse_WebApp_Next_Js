"use client";

import Image from "next/image";
import { Linkedin, Youtube, Facebook, Twitter } from "lucide-react";

type Member = {
  id: number;
  name: string;
  role: string;
  image: string;
};

const members: Member[] = [
  {
    id: 1,
    name: "Dr. Anika Sharma",
    role: "Veterinary Specialist",
    image: "/images/testimonial1.jpg",
  },
  {
    id: 2,
    name: "Carlos Mendes",
    role: "Animal Trainer",
    image: "/images/testimonial6.jpg",
  },
  {
    id: 3,
    name: "Sophia Lee",
    role: "Nutrition Consultant",
    image: "/images/testimonial2.jpg",
  },
  {
    id: 4,
    name: "Daniel Brooks",
    role: "Pet Wellness Coach",
    image: "/images/contactpg2.jpg",
  },
];

export default function Team() {
  return (
    <section className="py-20 px-6 md:px-12 lg:px-16 bg-gray-50 relative overflow-hidden">
      
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(6,182,212,0.08),transparent_70%)]" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        <div className="mb-16 text-center">
          <p className="text-sm md:text-base text-cyan-600 font-semibold tracking-widest uppercase">
            Our Experts
          </p>
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mt-3">
            Meet Our Specialists
          </h2>
          <p className="mt-4 text-gray-600 max-w-3xl mx-auto text-base md:text-lg leading-relaxed">
            A passionate team of certified veterinarians, trainers, and
            consultants dedicated to your pet’s health, nutrition, and happiness.
          </p>
        </div>

        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {members.map((member) => (
            <div
              key={member.id}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 flex flex-col items-center text-center transition-all duration-300 hover:shadow-xl hover:scale-105"
            >
              
              <div className="relative w-40 h-40 md:w-48 md:h-48 rounded-full overflow-hidden shadow-md">
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  className="object-cover transform hover:scale-110 transition-transform duration-500"
                />
              </div>

              
              <div className="mt-6 space-y-2">
                <h3 className="text-lg md:text-xl font-bold text-gray-900">
                  {member.name}
                </h3>
                <p className="text-sm text-gray-500 font-medium tracking-wide uppercase">
                  {member.role}
                </p>
              </div>

              
              <div className="flex justify-center gap-3 mt-5">
                <a
                  href="#"
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-cyan-600 hover:text-white transition-colors duration-300"
                >
                  <Linkedin size={18} />
                </a>
                <a
                  href="#"
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-cyan-600 hover:text-white transition-colors duration-300"
                >
                  <Youtube size={18} />
                </a>
                <a
                  href="#"
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-cyan-600 hover:text-white transition-colors duration-300"
                >
                  <Twitter size={18} />
                </a>
                <a
                  href="#"
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-cyan-600 hover:text-white transition-colors duration-300"
                >
                  <Facebook size={18} />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
