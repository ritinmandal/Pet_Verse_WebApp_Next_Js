"use client";

import React from "react";

const offers: string[] = [
  "Massive 60% Discount",
  "Up to 40% Price Drop",
  "Weekly Special",
  "Buy 2 Get 1 Free",
  "Exclusive Pet Care Deals",
];

const PetOffersMarquee: React.FC = () => {

  const repeatedOffers = [...offers, ...offers];

  return (
    <div className="relative w-full h-20 overflow-hidden bg-gradient-to-r from-yellow-300 via-yellow-300 to-yellow-300 py-3">
      
      <div className="absolute inset-0  bg-blue-950 transform -skew-y-1" />

      
      <div className="relative flex py-3 animate-marquee whitespace-nowrap">
        {repeatedOffers.map((offer, index) => (
          <div
            key={index}
            className="flex items-center justify-center mx-8 text-white font-bold text-lg md:text-xl tracking-wide"
          >
            <span className="mx-3 text-yellow-200">*</span>
            {offer}
            <span className="mx-3 text-amber-200">*</span>
          </div>
        ))}
      </div>

      
      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          display: inline-flex;
          animation: marquee 30s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};

export default PetOffersMarquee;
