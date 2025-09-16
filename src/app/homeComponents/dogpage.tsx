"use client";

import Image from "next/image";
import { Heart, User, ShieldCheck, Utensils } from "lucide-react";

export default function WhoWeAreSection() {
  return (
    <section className="relative bg-[#f8f5ef] py-16">
      <div className="text-center mb-12">
        <span className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 mb-2">
          🐾 WHO WE ARE
        </span>
        <h1 className="text-4xl font-extrabold text-gray-800">
          Your Pets Will Be Extremely <br /> Happy With Us
        </h1>
      </div>

      <div className="container mx-auto max-w-7xl grid md:grid-cols-3 items-center gap-8">
        
        <div className="flex flex-col gap-10 text-right">
          <div className="flex items-center gap-4">
            <div className="ml-auto">
              <h3 className="text-xl font-bold text-gray-800">
                Pets Care 24/7
              </h3>
              <p className="text-gray-600 text-lg">
                Medicenter offers comprehensive dental care for both adults and
                children from our office at Toronto.
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-cyan-500 text-2xl">
              <Heart />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="ml-auto">
              <h3 className="text-xl font-bold text-gray-800">
                Skilled Personal
              </h3>
              <p className="text-gray-600 text-lg">
                Medicenter offers comprehensive dental care for both adults and
                children from our office at Toronto.
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-cyan-500 text-2xl">
              <ShieldCheck />
            </div>
          </div>
        </div>

        
        <div className="flex justify-center">
          <Image
            src="/images/dogimage.png"
            alt="Happy Dog"
            width={400}
            height={400}
            className="object-contain"
          />
        </div>

        
        <div className="flex flex-col gap-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-cyan-500 text-2xl">
              <User />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">
                Best Veterinarians
              </h3>
              <p className="text-gray-600 text-lg">
                Medicenter offers comprehensive dental care for both adults and
                children from our office at Toronto.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-cyan-500 text-5xl">
              <Utensils />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">Quality Food</h3>
              <p className="text-gray-600 text-lg">
                Medicenter offers comprehensive dental care for both adults and
                children from our office at Toronto.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
