'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

type Service = {
  id: number;
  title: string;
  desc: string;
  img: string;
};

const services: Service[] = [
  { id: 1, title: 'Dog Checkup',        desc: 'Ad litora torquent conubia nostra nascetu inceptos.',           img: '/icons/service5.png' },
  { id: 2, title: 'Cat Wellness',       desc: 'Luctus nibh finibus facilisis dapibus etiam interdum tortor.',  img: '/icons/servive4.png' }, // If this file name is a typo, rename to /icons/service4.png
  { id: 3, title: 'Pet Nutrition',      desc: 'Primis vulputate ornare sagittis vehicula praesent accumsan.',  img: '/icons/service2.png' },
  { id: 4, title: 'Behaviour Support',  desc: 'Bibendum egestas iaculis massa nisl malesuada lacinia integer.', img: '/icons/service6.png' },
];

export default function PetServices() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;


    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const rows = Array.from(section.querySelectorAll<HTMLElement>('.service-row'));
    const triggers: ScrollTrigger[] = [];

    if (!prefersReduced) {
      rows.forEach((row) => {
        const cards = row.querySelectorAll<HTMLElement>('.service-card');
        const tween = gsap.fromTo(
          cards,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            stagger: 0.08,
            duration: 0.7,
            ease: 'power3.out',
          }
        );

        const st = ScrollTrigger.create({
          trigger: row,
          start: 'top 85%',
          animation: tween,
          once: true,
        });

        triggers.push(st);
      });
    } else {
      gsap.set('.service-card', { clearProps: 'all', y: 0, opacity: 1 });
    }

    return () => {
      triggers.forEach((t) => t.kill());
      ScrollTrigger.killAll(false); // leave other pages alone, just stop attached triggers
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full bg-[#FFF6E9] overflow-hidden pt-8 sm:pt-10 lg:pt-12 pb-14 sm:pb-20 lg:pb-24"
      aria-labelledby="pet-services-heading"
    >
      <div className="pointer-events-none absolute bottom-0 -left-8 sm:-left-10 lg:-left-16 lg:z-20 sm:mt-15">
        <Image
          src="/icons/home1-dog-img.png"
          alt="Dog illustration"
          width={280}
          height={240}
          priority
          sizes="(min-width: 1024px) 250px, (min-width: 640px) 180px, 140px"
          className="h-auto w-[140px] sm:w-[180px] lg:w-[250px] object-contain"
        />
      </div>

      <div className="pointer-events-none absolute bottom-0 right-4 sm:right-6 lg:right-5 lg:z-20">
        <Image
          src="/icons/home1-cat-img.png"
          alt="Cat illustration"
          width={180}
          height={160}
          priority
          sizes="(min-width: 1024px) 160px, (min-width: 640px) 120px, 90px"
          className="h-auto w-[90px] sm:w-[120px] lg:w-[160px] object-contain"
        />
      </div>

      
      <div className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6 text-center">
        <p className="mb-2 text-xs sm:text-sm font-bold uppercase tracking-wider text-cyan-600">
          Serving Pet Needs
        </p>
        <h2
          id="pet-services-heading"
          className="mb-3 text-2xl sm:text-4xl lg:text-5xl font-bold leading-tight text-[#0F172A]"
        >
          Our Pet Services
        </h2>
        <p className="mx-auto mt-2 max-w-2xl text-sm sm:text-base lg:text-lg text-gray-700">
          Fringilla lacus nec metus bibendum egestas iaculis massa. Ut hendrerit semper vel class
          aptent taciti sociosqu. Inceptos himenaeos orci varius natoque.
        </p>
      </div>

      
      <div className="relative z-10 mx-auto mt-8 sm:mt-12 lg:mt-14 max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <div className="service-row grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4 lg:gap-6">
          {services.map((service) => (
            <article
              key={service.id}
              className="service-card group relative flex w-full flex-col items-center overflow-hidden rounded-3xl border border-white/40 bg-[#FFF6E9] p-5 shadow-md transition-transform duration-300 hover:bg-cyan-600 hover:scale-[1.02] hover:shadow-xl"
            >
              
              <div className="pointer-events-none absolute inset-0 origin-bottom-left -skew-y-3 bg-gradient-to-br from-cyan-500/0 via-cyan-600/0 to-cyan-700/0 opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100" />

              <div className="relative z-10 flex h-full flex-col items-center">
                <div className="mb-4 flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-white shadow-lg transition-transform duration-300 group-hover:scale-110 sm:h-24 sm:w-24">
                  <Image
                    src={service.img}
                    alt={service.title}
                    width={96}
                    height={96}
                    loading="lazy"
                    sizes="(min-width:1024px) 96px, (min-width:640px) 88px, 72px"
                    className="h-14 w-14 object-contain sm:h-16 sm:w-16"
                  />
                </div>

                <h3 className="relative z-10 mb-1 text-lg font-bold text-[#0F172A] transition-colors duration-300 group-hover:text-white sm:text-xl lg:text-2xl">
                  {service.title}
                </h3>

                <p className="relative z-10 mb-2 text-center text-sm leading-relaxed text-gray-700 transition-colors duration-300 group-hover:text-white sm:mb-3 sm:text-base">
                  {service.desc}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
