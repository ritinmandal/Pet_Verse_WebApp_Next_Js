"use client";

import Image from "next/image";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Heart, ShieldCheck, PawPrint } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

type TimeLeft = {
  days: number;
  hours: number;
  mins: number;
  secs: number;
};

interface OfferBannerProps {
  endDate?: Date;
}

export default function OfferBanner({ endDate }: OfferBannerProps) {
  const defaultTarget = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    d.setHours(d.getHours() + 8);
    d.setMinutes(d.getMinutes() + 30);
    d.setSeconds(d.getSeconds() + 52);
    return d;
  }, []);

  const target = endDate ?? defaultTarget;
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() =>
    diffFromNow(target)
  );

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(diffFromNow(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  const rootRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: rootRef.current,
          start: "top 80%",
        },
      });

      tl.from(".ob-heading", { y: 30, opacity: 0, duration: 0.6 })
        .from(
          ".ob-sub",
          { y: 20, opacity: 0, duration: 0.6, stagger: 0.1 },
          "-=0.3"
        )
        .from(".ob-cta", { scale: 0.95, opacity: 0, duration: 0.4 }, "-=0.2");
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={rootRef} className="relative w-full overflow-hidden">
      
      <div className="absolute top-0 left-0 w-full pointer-events-none z-10">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 150"
          className="w-full h-[70px] sm:h-[90px] md:h-[110px] lg:h-[140px]"
          preserveAspectRatio="none"
        >
          <path
            d="M0,64 C480,180 960,0 1440,100 L1440,0 L0,0 Z"
            fill="white"
          />
        </svg>
      </div>

      
      <div className="relative min-h-[500px] md:min-h-[640px] flex items-center">
        <Image
          src="/images/pricing1.jpg"
          alt="Happy pet with owner"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-900/60 via-cyan-700/40 to-cyan-500/30 backdrop-blur-[2px]" />

        
        <div className="relative z-20 container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-8">
            
            <div className="md:col-span-6 text-white text-center md:text-left">
              <p className="ob-sub text-xs md:text-sm tracking-widest text-yellow-300 font-semibold mb-2">
                INSTANT DISCOUNT COUPON
              </p>

              <h2 className="ob-heading font-bold leading-tight mb-3 text-2xl sm:text-4xl lg:text-5xl">
                PetVerse Deals You’ll Love —<br className="hidden sm:block" />
                Ending Soon
              </h2>

              <p className="ob-sub max-w-[600px] mx-auto md:mx-0 text-sm md:text-base opacity-90 mb-6">
                Unlock exclusive savings for your furry companions. Limited-time
                coupons for pet care, wellness, and grooming essentials.
              </p>

              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-6">
                <FlipTimer label="Days" value={pad(timeLeft.days)} wide />
                <Colon />
                <FlipTimer label="Hrs" value={pad(timeLeft.hours)} />
                <Colon />
                <FlipTimer label="Mins" value={pad(timeLeft.mins)} />
                <Colon />
                <FlipTimer label="Secs" value={pad(timeLeft.secs)} />
              </div>

              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="ob-cta inline-flex items-center justify-center rounded-xl px-6 py-3 font-semibold text-lg shadow-lg bg-cyan-500 text-white hover:bg-cyan-600"
              >
                Claim Your Offer
              </motion.button>
            </div>

            
            <div className="md:col-span-6 flex justify-center md:justify-end">
              <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-6 md:p-8 max-w-sm text-center space-y-6">
                <Image
                  src="/images/footerimg8.jpg"
                  alt="Pet Wellness"
                  width={300}
                  height={200}
                  className="rounded-xl object-cover w-full h-40"
                />
                <div className="grid grid-cols-3 gap-4">
                  <FeatureCard icon={<PawPrint />} label="Pet Care" />
                  <FeatureCard icon={<Heart />} label="Loved by 2k+" />
                  <FeatureCard icon={<ShieldCheck />} label="Trusted Service" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


function diffFromNow(target: Date): TimeLeft {
  const now = new Date().getTime();
  const end = target.getTime();
  let delta = Math.max(0, Math.floor((end - now) / 1000));

  const days = Math.floor(delta / (3600 * 24));
  delta -= days * 3600 * 24;
  const hours = Math.floor(delta / 3600);
  delta -= hours * 3600;
  const mins = Math.floor(delta / 60);
  delta -= mins * 60;
  const secs = delta;

  return { days, hours, mins, secs };
}

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function Colon() {
  return (
    <span className="mx-2 text-xl md:text-3xl font-bold opacity-90 text-white">
      :
    </span>
  );
}

function FlipTimer({
  value,
  label,
  wide,
}: {
  value: string | number;
  label: string;
  wide?: boolean;
}) {
  return (
    <div
      className={[
        "ob-card backdrop-blur-md bg-white/20 border border-white/30 text-white rounded-xl text-center",
        "px-3 py-3 md:px-4 md:py-4",
        wide ? "min-w-[80px]" : "min-w-[60px]",
        "shadow-lg flex flex-col items-center justify-center relative overflow-hidden",
      ].join(" ")}
    >
      <div className="relative h-[1.3em] md:h-[1.6em] flex items-center justify-center">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={value}
            initial={{ y: "-100%", rotateX: 90, opacity: 0 }}
            animate={{ y: "0%", rotateX: 0, opacity: 1 }}
            exit={{ y: "100%", rotateX: -90, opacity: 0 }}
            transition={{ duration: 0.45, ease: "easeInOut" }}
            className="absolute text-2xl md:text-4xl font-extrabold leading-none"
          >
            {value}
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="mt-2 text-xs md:text-sm font-medium opacity-80">
        {label}
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center space-y-1">
      <div className="w-12 h-12 flex items-center justify-center rounded-full bg-cyan-100 text-cyan-600 shadow-md">
        {icon}
      </div>
      <p className="text-xs md:text-sm font-semibold text-gray-700">{label}</p>
    </div>
  );
}
