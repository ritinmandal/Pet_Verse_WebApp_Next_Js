"use client";

import { useState } from "react";
import Image from "next/image";
import { Calendar, PawPrint, Dog, Cat } from "lucide-react";

export default function BookAppointmentSection() {
  const [pet, setPet] = useState<string | null>(null);
  const [services, setServices] = useState<string[]>([]);

  const toggleService = (s: string) => {
    setServices((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  return (
    <section className="mx-auto max-w-7xl my-16 rounded-3xl overflow-hidden shadow-xl">
      <div className="grid md:grid-cols-2">
        
        <div className="relative h-[500px] md:h-auto">
          <Image
            src="/images/vet1.jpg"
            alt="Pet Care"
            fill
            className="object-cover"
          />
        </div>

        
        <div className="relative bg-gradient-to-br from-[#0a1e3a] to-[#0e2f4d] p-10 text-white flex flex-col justify-center">
          
          <div className="absolute inset-0 opacity-10 bg-[url('/images/paw-pattern.png')] bg-repeat" />

          <div className="relative z-10">
            <span className="inline-flex items-center gap-2 rounded-full bg-cyan-500/20 px-4 py-1 text-sm font-medium text-cyan-300 mb-6">
              <PawPrint className="h-4 w-4" /> Planning a Visit?
            </span>

            <h2 className="text-4xl font-extrabold mb-2">Book Appointment!</h2>
            <p className="text-gray-300 mb-6">
              Choose your pet type and the services you need.
            </p>

            
            <div className="mb-6 space-x-4">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={pet === "dog"}
                  onChange={() => setPet("dog")}
                  className="peer hidden"
                />
                <span className="w-5 h-5 border rounded peer-checked:bg-cyan-500"></span>
                <Dog className="h-4 w-4" /> Dog
              </label>
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={pet === "cat"}
                  onChange={() => setPet("cat")}
                  className="peer hidden"
                />
                <span className="w-5 h-5 border rounded peer-checked:bg-cyan-500"></span>
                <Cat className="h-4 w-4" /> Cat
              </label>
            </div>

            
            <div className="mb-6 grid grid-cols-3 gap-3">
              {["House Sitting", "Drop In Visits", "Vaccination"].map((s) => (
                <button
                  key={s}
                  onClick={() => toggleService(s)}
                  className={`flex flex-col items-center justify-center rounded-xl border px-4 py-4 text-sm font-medium transition ${
                    services.includes(s)
                      ? "border-cyan-500 bg-cyan-500/20 text-cyan-300"
                      : "border-white/20 text-gray-300 hover:border-cyan-400"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            
            <div className="mb-6 grid grid-cols-2 gap-4">
              <input
                type="email"
                placeholder="Email Address"
                className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-gray-400 focus:border-cyan-400 focus:outline-none"
              />
              <div className="relative">
                <input
                  type="date"
                  className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-gray-400 focus:border-cyan-400 focus:outline-none"
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>

            
            <button className="group w-full rounded-xl border-2 border-cyan-500 px-6 py-3 font-semibold text-cyan-300 hover:bg-cyan-500 hover:text-[#0a1e3a] transition-all">
              Submit Now ✦
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
