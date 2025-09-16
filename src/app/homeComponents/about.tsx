'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Button } from '@/components/ui/button';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

export default function AboutPage() {
    const sectionRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLDivElement>(null);

    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ['start end', 'end start'],
    });

    const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '25%']);
    const contentY = useTransform(scrollYProgress, [0, 1], ['0%', '-8%']);

    useEffect(() => {
        if (textRef.current) {
            gsap.fromTo(
                textRef.current.querySelectorAll('.reveal-text'),
                { y: 80, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 1.2,
                    stagger: 0.2,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: textRef.current,
                        start: 'top 80%',
                    },
                }
            );
        }

        const paw = document.querySelector('.paw-float');
        if (paw) {
            gsap.to(paw, {
                rotation: 15,
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: true,
                },
            });

            gsap.to(paw, {
                y: '-=20',
                x: '+=15',
                duration: 4,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
            });
        }
    }, []);

    return (
        <section
            ref={sectionRef}
            className="relative overflow-hidden bg-gradient-to-br from-[#1E3A8A] via-cyan-500 to-teal-300 min-h-screen"
        >5
            <div className="absolute top-20 left-10 w-40 h-40 bg-pink-400/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-40 right-20 w-60 h-60 bg-yellow-300/20 rounded-full blur-3xl"></div>

        

            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-white/10 rounded-full blur-3xl"></div>

            <motion.div
                className="container mx-auto px-8 lg:px-20 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10 min-h-screen"
                style={{ y: contentY }}
            >
                <div ref={textRef} className="text-white space-y-10 text-center lg:text-left">
                    <motion.p className="reveal-text uppercase tracking-[0.3em] text-sm font-bold opacity-70">
                        WHO WE ARE
                    </motion.p>

                    <motion.h1 className="reveal-text text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight">
                        Because Every Pet Deserves <br />
                        <span className="text-yellow-300">Joy & Care</span>
                    </motion.h1>

                    <motion.p className="reveal-text text-base lg:text-lg leading-relaxed max-w-2xl mx-auto lg:mx-0 opacity-95 font-medium">
                        From nourishing meals to playful toys, <span className="text-pink-200">Poshik</span> is here
                        to bring happiness to pets and peace of mind to their owners. Our mission is to
                        make every pet&apos;s journey full of love, wellness, and joy.
                    </motion.p>

                    <motion.div className="reveal-text flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6 pt-8">
                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                            <Button className="relative bg-white/20 backdrop-blur-lg text-white font-bold px-10 py-6 rounded-full text-lg border border-white/25 shadow-xl hover:bg-yellow-300 hover:text-gray-900 transition-all duration-500 overflow-hidden group">
                                <span className="relative z-10">Get Started</span>
                            </Button>
                        </motion.div>

                        <motion.div className="flex items-center gap-4">
                            <Image
                                src="/icons/ppl.png"
                                alt="Client Avatars"
                                width={130}
                                height={150}
                                className="object-cover rounded-full shadow-lg"
                            />
                            <div className="text-left">
                                <div className="text-lg text-white font-bold">50k+</div>
                                <div className="text-sm opacity-80 font-medium">Happy Pet Parents</div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>

                <div className="relative flex justify-center lg:justify-end">
                    <div className="relative z-10">
                        <Image
                            src="/icons/about2-cutout.png"
                            alt="Happy woman with golden retriever"
                            width={900}
                            height={800}
                            priority
                            quality={100}
                            className="relative w-72 sm:w-96 lg:w-[600px] pb-26"
                            style={{
                                transform: 'translateY(100px)',
                                filter: 'drop-shadow(0 25px 50px rgba(0,0,0,0.2))',
                            }}
                        />

                        <div className="absolute -inset-6 bg-gradient-to-t from-white/10 to-transparent rounded-full blur-xl opacity-60"></div>
                    </div>
                </div>
            </motion.div>

            <div className="absolute bottom-0 left-0 right-0 overflow-hidden leading-[0] z-20">
                <motion.svg
                    viewBox="0 0 500 140"
                    preserveAspectRatio="none"
                    className="w-full h-[140px]"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2.5, ease: 'easeInOut' }}
                >
                    <path
                        d="M0,130 Q250,0 500,130 L500,150 L0,150 Z"
                        className="fill-[#FFF6E9]"
                    />
                </motion.svg>
            </div>
        </section>
    );
}
