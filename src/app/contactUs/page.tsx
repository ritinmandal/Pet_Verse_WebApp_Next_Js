'use client';

import React, { useRef, useState } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import {
  ChevronDown,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  Clock3,
  ArrowRight,
  PawPrint,
  Sparkles,
  CircleHelp,
  Instagram,
  Twitter,
  Facebook,
} from 'lucide-react';
import Image from 'next/image';


const theme = {
  bgFrom: '#f8fafc', // slate-50-ish
  bgTo: '#ffffff',
  cyan: '#06b6d4',
  blue: '#2563eb',
  yellow: '#facc15',
  text: 'text-slate-900',
  textSoft: 'text-slate-600',
  card: 'bg-white border border-slate-200 shadow-sm',
  ring: 'focus:ring-4 focus:ring-cyan-200 focus:outline-none',
};


interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  { id: 'vet', question: 'Could you suggest a trustworthy veterinarian?', answer: 'We recommend certified local veterinarians with proven track records in pet care. You can also check our partner directory for trusted professionals near you.' },
  { id: 'service', question: 'Are there affordable yet reliable service options?', answer: 'Yes, we provide budget-friendly packages covering checkups, grooming, vaccinations, and preventive care without compromising quality.' },
  { id: 'products', question: 'Which products help control odors and shedding?', answer: 'Use high-quality grooming products such as deshedding tools, enzymatic cleaners, and specialized shampoos designed to minimize odors and reduce shedding.' },
  { id: 'training', question: 'Do you offer specialized training for pets?', answer: 'Yes, our certified trainers provide personalized programs ranging from basic obedience to advanced behavior training.' },
  { id: 'adoption', question: 'Are there any adoption events this week?', answer: 'Check our events calendar for adoption drives, meet-and-greets, and workshops that help pets find loving homes.' },
  { id: 'toys', question: 'Which toys are safest for puppies and kittens?', answer: 'Opt for non-toxic, durable toys without small parts. Puzzle feeders, rubber chews, and rope toys are great choices.' },
  { id: 'immunization', question: 'Are pet immunization services available?', answer: 'Yes, we provide vaccinations for cats, dogs, and other pets based on veterinary guidelines and local requirements.' },
  { id: 'grooming', question: 'Can I book grooming appointments online?', answer: 'Absolutely! Our online booking system lets you choose services, time slots, and preferences at your convenience.' },
  { id: 'food', question: 'Do you offer organic cat food?', answer: 'Yes, we stock certified organic cat foods made with natural ingredients and free from artificial additives.' },
  { id: 'supplies', question: 'Do you provide pet supplies immediately?', answer: 'Yes, essential supplies such as food, toys, bedding, and health products are available in-store and online.' },
];


const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, ease: 'easeOut' },
};
const fadeInLeft = {
  initial: { opacity: 0, x: -40 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.45, ease: 'easeOut' },
};
const fadeInRight = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.45, ease: 'easeOut' },
};
const staggerContainer = { initial: {}, animate: { transition: { staggerChildren: 0.08 } } };


const GradientRing: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div
    className="absolute inset-0 rounded-2xl p-[1px]
      [background:linear-gradient(135deg,rgba(6,182,212,.35),rgba(37,99,235,.35),rgba(250,204,21,.35))]"
  >
    <div className={`h-full w-full rounded-[15px] ${theme.card} ${className}`} />
  </div>
);


const Chip = ({ icon: Icon, label }: { icon?: any; label: string }) => (
  <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700">
    {Icon && <Icon className="h-4 w-4 text-cyan-600" />}
    {label}
  </div>
);


const FAQSection: React.FC = () => {
  const [openId, setOpenId] = useState<string | null>(null);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-10%' });

  const toggleFAQ = (id: string) => setOpenId(openId === id ? null : id);

  const leftFAQs = faqData.filter((_, i) => i % 2 === 0);
  const rightFAQs = faqData.filter((_, i) => i % 2 === 1);

  const renderFAQ = (faq: FAQItem, index: number) => (
    <motion.div key={faq.id} variants={fadeInUp} transition={{ delay: index * 0.05 }} className="relative rounded-2xl">
      <GradientRing />
      <button
        onClick={() => toggleFAQ(faq.id)}
        className={`relative flex w-full items-start gap-4 rounded-2xl px-6 py-5 text-left ${theme.card} transition-colors ${
          openId === faq.id ? 'bg-cyan-50' : 'hover:bg-slate-50'
        }`}
        aria-expanded={openId === faq.id}
        aria-controls={`faq-answer-${faq.id}`}
      >
        <span className="mt-1 inline-flex h-8 w-8 flex-none items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-white">
          <CircleHelp className="h-4 w-4" />
        </span>
        <div className="flex-1">
          <h3 className={`text-base lg:text-lg font-semibold ${theme.text}`}>{faq.question}</h3>
          <AnimatePresence>
            {openId === faq.id && (
              <motion.p
                id={`faq-answer-${faq.id}`}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden pt-2 text-sm text-slate-600"
              >
                {faq.answer}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
        <motion.div animate={{ rotate: openId === faq.id ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="h-5 w-5 text-cyan-600" />
        </motion.div>
      </button>
    </motion.div>
  );

  return (
    <section ref={ref} className="w-full bg-white py-16 px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1">
            <Sparkles className="h-4 w-4 text-yellow-500" />
            <span className="text-xs font-semibold tracking-wider text-cyan-600">FAQ</span>
          </div>
          <h2 className="mt-3 text-3xl font-bold text-slate-900 md:text-4xl">Answers at a Glance</h2>
          <p className="mx-auto mt-2 max-w-2xl text-slate-600">
            Quick help for common pet-care questions. Canâ€™t find it? Ping our support.
          </p>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate={isInView ? 'animate' : 'initial'}
          className="grid grid-cols-1 gap-6 lg:grid-cols-2"
        >
          <div className="space-y-4">{leftFAQs.map(renderFAQ)}</div>
          <div className="space-y-4">{rightFAQs.map(renderFAQ)}</div>
        </motion.div>
      </div>
    </section>
  );
};


export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '', agree: false });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(form);
  };

  const mainRef = useRef(null);
  const mapRef = useRef(null);
  const mainInView = useInView(mainRef, { once: true, margin: '-10%' });
  const mapInView = useInView(mapRef, { once: true, margin: '-10%' });

  return (
    <div className={`relative min-h-screen bg-gradient-to-b from-[${theme.bgFrom}] to-[${theme.bgTo}]`}>
  
      
      <div className="relative w-full h-48 sm:h-64 md:h-72 lg:h-80 mb-12">
        <Image
          src="/images/offerbanner.jpg"
          alt="Products Banner"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/60 via-cyan-700/50 to-blue-900/60 flex flex-col justify-center items-center text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-white">Contact Us</h1>
          <p className="text-sm md:text-base text-blue-50 mt-2">Home / Contact</p>
        </div>
      </div>

      
      <section ref={mainRef} className="px-6 pb-10 pt-4 lg:px-8">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 xl:grid-cols-3">
          
          <motion.div variants={fadeInLeft} initial="initial" animate={mainInView ? 'animate' : 'initial'} className="xl:col-span-1">
            <div className="relative">
              <div className="relative overflow-hidden rounded-3xl border border-slate-200">
                <Image
                  src="/images/contactpg.jpg"
                  alt="Happy family with pet"
                  width={1200}
                  height={800}
                  className="h-80 w-full object-cover"
                />
              </div>

              
              <div className="mt-4 flex flex-wrap gap-2">
                <Chip icon={ShieldCheck} label="Verified vets" />
                <Chip icon={Clock3} label="24Ã—7 support" />
                <Chip icon={PawPrint} label="Pet-first care" />
              </div>

              
              <motion.div
                variants={staggerContainer}
                initial="initial"
                animate={mainInView ? 'animate' : 'initial'}
                className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2"
              >
                {[
                  { Icon: Mail, title: 'Email', value: 'Sweetheart@example.com' },
                  { Icon: Phone, title: 'Phone', value: '7890 456 123 (02+)' },
                  { Icon: MapPin, title: 'Location', value: 'Neville Street, New Albany' },
                  { Icon: Clock3, title: 'Hours', value: 'Monâ€“Sat Â· 9:00â€“18:00' },
                ].map(({ Icon, title, value }) => (
                  <motion.div key={title} variants={fadeInUp} className={`relative rounded-2xl ${theme.card} p-4`}>
                    <div className="flex items-start gap-3">
                      <div className="rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 p-3 text-white">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs uppercase tracking-wider text-slate-500">{title}</p>
                        <p className="truncate text-sm font-semibold text-slate-900">{value}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              
              <div className="mt-6 flex items-center gap-3">
                <a className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50" href="#" aria-label="Instagram">
                  <Instagram className="h-5 w-5" />
                </a>
                <a className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50" href="#" aria-label="Twitter">
                  <Twitter className="h-5 w-5" />
                </a>
                <a className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50" href="#" aria-label="Facebook">
                  <Facebook className="h-5 w-5" />
                </a>
              </div>
            </div>
          </motion.div>

          
          <motion.div variants={fadeInRight} initial="initial" animate={mainInView ? 'animate' : 'initial'} className="xl:col-span-2">
            <div id="contact-form" className={`relative overflow-hidden rounded-3xl ${theme.card}`}>
              <div className="relative grid grid-cols-1 gap-8 p-6 md:p-10 lg:grid-cols-5">
                
                <div className="lg:col-span-3">
                  <h2 className="mb-2 text-2xl font-bold text-slate-900">Need help? Send us a message</h2>
                  <p className="mb-6 text-sm text-slate-600">We usually respond within a few hours.</p>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <label className="group relative block">
                        <span className="sr-only">Name</span>
                        <input
                          type="text"
                          name="name"
                          placeholder="*Enter Name"
                          className={`w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 ${theme.ring}`}
                          value={form.name}
                          onChange={handleChange}
                        />
                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                          <PawPrint className="h-4 w-4" />
                        </span>
                      </label>

                      <label className="group relative block">
                        <span className="sr-only">Email</span>
                        <input
                          type="email"
                          name="email"
                          placeholder="*Enter Email"
                          className={`w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 ${theme.ring}`}
                          value={form.email}
                          onChange={handleChange}
                        />
                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                          <Mail className="h-4 w-4" />
                        </span>
                      </label>

                      <label className="group relative block md:col-span-2">
                        <span className="sr-only">Phone</span>
                        <input
                          type="tel"
                          name="phone"
                          placeholder="*Phone Number"
                          className={`w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 ${theme.ring}`}
                          value={form.phone}
                          onChange={handleChange}
                        />
                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                          <Phone className="h-4 w-4" />
                        </span>
                      </label>

                      <label className="group relative block md:col-span-2">
                        <span className="sr-only">Message</span>
                        <textarea
                          name="message"
                          placeholder="Additional Message"
                          rows={5}
                          className={`w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 ${theme.ring}`}
                          value={form.message}
                          onChange={handleChange}
                        />
                      </label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        name="agree"
                        checked={form.agree as boolean}
                        onChange={handleChange}
                        className="mt-1 h-5 w-5 rounded border-slate-300 text-cyan-600 focus:ring-cyan-400"
                      />
                      <label className="text-sm text-slate-600">
                        I Agree To Our Friendly{' '}
                        <a href="#" className="text-cyan-700 underline hover:text-cyan-800">
                          Privacy Policy
                        </a>
                      </label>
                    </div>

                    <button
                      type="submit"
                      className="group inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 font-semibold text-white hover:from-cyan-600 hover:to-blue-700"
                    >
                      Send Message
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  </form>
                </div>

                
                <div className="lg:col-span-2">
                  <div className="space-y-4">
                    <div className={`relative overflow-hidden rounded-2xl ${theme.card} p-4`}>
                      <div className="mb-2 flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5 text-cyan-600" />
                        <p className="text-sm font-semibold text-slate-900">Why trust us</p>
                      </div>
                      <ul className="list-inside list-disc text-sm text-slate-600">
                        <li>Vetted veterinarians and trainers</li>
                        <li>Transparent pricingâ€”no surprises</li>
                        <li>Secure bookings and easy cancellations</li>
                      </ul>
                    </div>

                    <div className={`relative overflow-hidden rounded-2xl ${theme.card} p-4`}>
                      <div className="mb-3 flex items-center gap-2">
                        <Clock3 className="h-5 w-5 text-yellow-500" />
                        <p className="text-sm font-semibold text-slate-900">How it works</p>
                      </div>
                      <ol className="space-y-2 text-sm text-slate-600">
                        <li>Share your query</li>
                        <li>We match you to the right expert</li>
                        <li>Get a response within hours</li>
                      </ol>
                    </div>

                    
                    <div className={`relative overflow-hidden rounded-2xl ${theme.card} p-4`}>
                      <p className="mb-2 text-sm font-semibold text-slate-900">Follow us</p>
                      <div className="flex items-center gap-3">
                        <a className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50" href="#" aria-label="Instagram">
                          <Instagram className="h-5 w-5" />
                        </a>
                        <a className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50" href="#" aria-label="Twitter">
                          <Twitter className="h-5 w-5" />
                        </a>
                        <a className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50" href="#" aria-label="Facebook">
                          <Facebook className="h-5 w-5" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
                
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      
      <FAQSection />

      
      <section ref={mapRef} className="px-6 pb-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate={mapInView ? 'animate' : 'initial'}
            className="relative overflow-hidden rounded-3xl border border-slate-200"
          >
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3689.017013408831!2d88.34796067493606!3d22.572646185258867!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a027b03e5f0a0cd%3A0xf2f2b3d7a5e2f5a!2sKolkata%2C%20West%20Bengal%2C%20India!5e0!3m2!1sen!2sin!4v1693555200000!5m2!1sen!2sin"
              width="100%"
              height="600"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-72 w-full md:h-96 lg:h-[28rem]"
              title="Our Location - Kolkata, West Bengal, India"
            />
            <div className="flex items-center justify-between gap-4 border-t border-slate-200 bg-white/80 p-4">
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-cyan-700" />
                <p className="text-sm text-slate-700">Neville Street, New Albany</p>
              </div>
              <a
                href="#contact-form"
                className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                Get directions
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

