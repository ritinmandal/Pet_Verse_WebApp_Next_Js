'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  Mail,
  Phone,
  MapPin,
  Instagram,
  Facebook,
  Twitter,
  Youtube,
} from 'lucide-react';


import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';

export default function Footer() {
  const gallery = [
    '/images/banner14.jpg',
    '/images/footerimg2.jpg',
    '/images/footerimg3.jpg',
    '/images/vet2.jpg',
    '/images/footerimg5.jpg',
    '/images/vet6.jpg',
    '/images/footerimg7.jpg',
    '/images/footerimg10.jpg',
    '/images/sign4.jpg',
  ];

  return (
    <footer className="relative bg-gradient-to-b from-teal-950 via-blue-950 to-black text-white overflow-hidden">
      
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(6,182,212,0.08),transparent_70%)] pointer-events-none" />

      
      <div className="mx-auto w-full max-w-[1400px] px-4">
        <div className="py-12">
          <Swiper
            modules={[Autoplay]}
            loop
            autoplay={{
              delay: 2200,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            speed={1000}
            spaceBetween={20}
            breakpoints={{
              0: { slidesPerView: 2 },
              640: { slidesPerView: 3 },
              1024: { slidesPerView: 5 },
              1400: { slidesPerView: 7 },
            }}
            className="overflow-hidden"
          >
            {gallery.map((src, i) => (
              <SwiperSlide key={i}>
                <div className="w-full h-28 sm:h-40 md:h-44 lg:h-52 rounded-xl overflow-hidden shadow-lg shadow-black/40 relative group">
                  <Image
                    src={src}
                    alt={`petverse-gallery-${i}`}
                    width={300}
                    height={200}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    priority={i < 4}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>

      
      <div className="mx-auto w-full max-w-[1400px] px-4">
        <div className="h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />
      </div>

      
      <div className="relative mx-auto w-full max-w-[1400px] px-4 py-20">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4 relative z-10">
          
          <div>
            <h3 className="mb-5 text-lg font-extrabold text-cyan-400 uppercase tracking-widest">
              Contact Us
            </h3>
            <ul className="space-y-3 text-[15px] text-gray-300">
              <li className="flex items-center gap-2">
                <Phone size={18} className="text-cyan-400" />
                <a href="tel:+917978543313" className="hover:text-white transition">
                  +91-7978543313
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin size={18} className="text-cyan-400" />
                Kolkata, India
              </li>
              <li className="flex items-center gap-2">
                <Mail size={18} className="text-cyan-400" />
                <a href="mailto:petverse@example.com" className="hover:text-white transition">
                  petverse@example.com
                </a>
              </li>
            </ul>
            <div className="mt-6 flex items-center gap-6">
              <Link href="#" aria-label="Instagram">
                <Instagram className="hover:scale-110 transition-transform text-pink-400" />
              </Link>
              <Link href="#" aria-label="Facebook">
                <Facebook className="hover:scale-110 transition-transform text-blue-500" />
              </Link>
              <Link href="#" aria-label="Twitter">
                <Twitter className="hover:scale-110 transition-transform text-sky-400" />
              </Link>
              <Link href="#" aria-label="YouTube">
                <Youtube className="hover:scale-110 transition-transform text-red-500" />
              </Link>
            </div>
          </div>

          
          <div>
            <div className="text-3xl font-extrabold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              PETVERSE
            </div>
            <p className="mt-5 max-w-[420px] text-[15px] text-gray-300 leading-relaxed">
              The ultimate hub for pets and their humans. Share, shop, and
              discover — all in one pet-loving universe.
            </p>

            
            <div className="mt-8">
              <p className="mb-3 text-sm font-semibold text-gray-200 uppercase">
                Get the App
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <Image
                  src="/icons/playstore.png"
                  alt="Google Play"
                  width={140}
                  height={44}
                  className="drop-shadow-lg hover:scale-105 transition-transform"
                />
                <Image
                  src="/icons/applestore.png"
                  alt="App Store"
                  width={140}
                  height={44}
                  className="drop-shadow-lg hover:scale-105 transition-transform"
                />
              </div>
            </div>
          </div>

          
          <div>
            <h3 className="mb-5 text-lg font-extrabold text-cyan-400 uppercase tracking-widest">
              Quick Links
            </h3>
            <ul className="space-y-3 text-[15px] text-gray-300">
              {['About Us', 'Services', 'Marketplace', 'Careers', 'Blog', 'FAQs'].map(
                (link, i) => (
                  <li key={i}>
                    <Link
                      href="#"
                      className="hover:text-white transition-colors flex items-center gap-2"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      {link}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>

          
          <div>
            <h3 className="mb-5 text-lg font-extrabold text-cyan-400 uppercase tracking-widest">
              Stay Updated
            </h3>
            <p className="text-gray-300 text-[15px] mb-5">
              Subscribe to get the latest pet care tips, offers, and updates
              from Petverse.
            </p>
            <form className="flex flex-col sm:flex-row  bg-gradient-to-r from-cyan-500/10 to-blue-500/10 p-2 rounded-xl border border-cyan-400/30 shadow-lg">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-0 rounded-md py-2 bg-transparent text-white placeholder-gray-400 focus:outline-none"
              />
              <button
                type="submit"
                className="bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2 rounded-md font-semibold hover:opacity-90 transition"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        
        <div className="mt-16 flex flex-col md:flex-row items-center justify-between gap-5 border-t border-white/10 pt-6 text-sm text-gray-400">
          <div className="flex items-center gap-6">
            <Link href="#" className="hover:text-cyan-300 transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-cyan-300 transition-colors">
              Terms of Service
            </Link>
            <Link href="#" className="hover:text-cyan-300 transition-colors">
              Cookie Settings
            </Link>
          </div>
          <p>
            © {new Date().getFullYear()} Petverse. Crafted with ❤️ by{' '}
            <Link
              href="https://github.com/ritinmandal"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-cyan-300 transition-colors"
            >
              Ritin Mandal
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
