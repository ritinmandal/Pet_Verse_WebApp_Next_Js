"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Star, ShoppingCart, Heart } from "lucide-react";

enum Category {
  Toys = "Toys",
  Birds = "Birds",
  Dogs = "Dogs",
  Cats = "Cats",
}

type Product = {
  id: number;
  title: string;
  category: Category;
  price: string;
  oldPrice?: string;
  image1: string;
  image2: string;
  badge?: "SALE" | "HOT SALE" | "LIMITED";
  rating: number;
};

const PRODUCTS: Product[] = [
  {
    id: 1,
    title: "Rubber Dumbbell Toy",
    category: Category.Toys,
    price: "₹210.00",
    oldPrice: "₹240.00",
    image1: "/images/products/rubbertoy1.jpg",
    image2: "/images/products/rubbertoy2.jpg",
    badge: "SALE",
    rating: 4,
  },
  {
    id: 2,
    title: "Pet Tags",
    category: Category.Toys,
    price: "₹630.00",
    oldPrice: "₹680.00",
    image1: "/images/products/tag1.jpg",
    image2: "/images/products/tag3.jpg",
    badge: "LIMITED",
    rating: 4,
  },
  {
    id: 3,
    title: "Collar Belt",
    category: Category.Dogs,
    price: "₹790.00",
    oldPrice: "₹980.00",
    image1: "/images/products/belt1.jpg",
    image2: "/images/products/belt2.jpg",
    rating: 4,
  },
  {
    id: 4,
    title: "Chew Toy",
    category: Category.Toys,
    price: "₹720.00",
    oldPrice: "₹750.00",
    image1: "/images/products/dogtoy1.jpg",
    image2: "/images/products/dogtoy2.jpg",
    badge: "HOT SALE",
    rating: 4,
  },
  {
    id: 5,
    title: "Dog Bone Chicken",
    category: Category.Dogs,
    price: "₹790.00",
    oldPrice: "₹860.00",
    image1: "/images/products/chew1.jpg",
    image2: "/images/products/chew3.jpg",
    rating: 3,
  },
  {
    id: 6,
    title: "Bird Food Mixture",
    category: Category.Birds,
    price: "₹540.00",
    oldPrice: "₹670.00",
    image1: "/images/products/mixseed1.jpg",
    image2: "/images/products/mixseed2.jpg",
    badge: "SALE",
    rating: 5,
  },
  {
    id: 7,
    title: "Cat Food",
    category: Category.Cats,
    price: "₹780.00",
    oldPrice: "₹890.00",
    image1: "/images/products/catfood1.jpg",
    image2: "/images/products/catfood2.jpg",
    badge: "SALE",
    rating: 4,
  },
  {
    id: 8,
    title: "Dog Food",
    category: Category.Dogs,
    price: "₹785.00",
    oldPrice: "₹830.00",
    image1: "/images/products/dogdryfood1.jpg",
    image2: "/images/products/dogdryfood2.jpg",
    rating: 5,
  },
  {
    id: 9,
    title: "Nylon Sofa",
    category: Category.Dogs,
    price: "₹2,100.00",
    oldPrice: "₹2,300.00",
    image1: "/images/products/sofa1.jpg",
    image2: "/images/products/sofa2.jpg",
    badge: "LIMITED",
    rating: 4,
  },
];

const FILTERS = ["All Product", Category.Toys, Category.Birds, Category.Dogs, Category.Cats] as const;

export default function ProductSection() {
  const [active, setActive] = useState<(typeof FILTERS)[number]>("All Product");
  const [hovered, setHovered] = useState<number | null>(null);
  const [liked, setLiked] = useState<number[]>([]);

  const items = active === "All Product" ? PRODUCTS : PRODUCTS.filter((p) => p.category === active);

  return (
    <section className="bg-white py-10 sm:py-12 lg:py-16">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center">
          <p className="text-xs sm:text-sm font-bold text-teal-500 uppercase tracking-wider mb-1">
            PRODUCTS
          </p>
          <h1 className="text-[22px] sm:text-[28px] lg:text-[32px] font-bold text-gray-700">
            Top Rated Items
          </h1>

          
          <div className="mt-6 flex flex-wrap justify-center gap-2 sm:gap-3">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setActive(f)}
                className={[
                  "h-9 rounded-full px-3 sm:px-4 text-sm sm:text-base font-medium transition",
                  active === f
                    ? "bg-cyan-600 text-white"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-cyan-600",
                ].join(" ")}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        
        <motion.div
          className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-7 place-items-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          {items.map((p) => (
            <div
              key={p.id}
              onMouseEnter={() => setHovered(p.id)}
              onMouseLeave={() => setHovered(null)}
              onTouchStart={() => setHovered(p.id)}
              onTouchEnd={() => setHovered(null)}
              className="group relative w-[95%] sm:w-[90%] md:w-[88%] lg:w-[85%] h-[340px] sm:h-[380px] rounded-[20px] sm:rounded-[24px] bg-white text-gray-900 shadow-md overflow-hidden transition-colors duration-500 hover:bg-cyan-600 hover:text-white"
            >
              
              {p.badge && (
                <span className="absolute left-4 top-4 sm:left-6 sm:top-6 z-10 rounded-full bg-blue-500 px-2 sm:px-3 py-0.5 sm:py-1 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-white">
                  {p.badge}
                </span>
              )}

              
              <motion.button
                onClick={() =>
                  setLiked((prev) =>
                    prev.includes(p.id) ? prev.filter((id) => id !== p.id) : [...prev, p.id]
                  )
                }
                whileHover={{ scale: 1.1 }}
                className="absolute right-4 top-4 sm:right-5 sm:top-5 z-10 grid h-8 w-8 sm:h-9 sm:w-9 place-items-center text-blue-500 opacity-0 transition group-hover:opacity-100"
              >
                <Heart
                  size={22}
                  className={liked.includes(p.id) ? "text-blue-500 fill-blue-500" : ""}
                />
              </motion.button>

              
              <div className="relative m-3 sm:m-4 h-44 sm:h-52 lg:h-56 overflow-hidden rounded-xl sm:rounded-2xl">
                <Image
                  src={hovered === p.id ? p.image2 : p.image1}
                  alt={p.title}
                  fill
                  draggable={false}
                  className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              
              <div className="px-4 sm:px-5 pb-6 pt-1 sm:pb-8 text-center transition-colors duration-500 group-hover:text-white">
                <h3 className=" mt-2 mb-1 sm:mb-2 text-lg sm:text-xl md:text-2xl font-bold">
                  {p.title}
                </h3>
                <div className="mb-1 sm:mb-2 flex justify-center gap-0.5 sm:gap-1">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Star
                      key={idx}
                      size={13}
                      className={
                        idx < p.rating
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-slate-300 group-hover:text-white/60"
                      }
                    />
                  ))}
                </div>
                <div className="text-xs sm:text-sm font-semibold">
                  {p.oldPrice && (
                    <span className="line-through opacity-70 mr-1">{p.oldPrice}</span>
                  )}
                  <span className="font-bold">{p.price}</span>
                </div>
              </div>

              
             
             
            </div>
          ))}
        </motion.div>

        
        <div className="mt-8 sm:mt-10 flex justify-center">
          <button className="rounded-lg sm:rounded-xl bg-cyan-600 px-6 sm:px-8 py-2.5 sm:py-3 text-white font-semibold text-base sm:text-lg transition transform duration-200 hover:scale-105 active:scale-95 hover:bg-[#FF5E5E]">
            Browse All Products
          </button>
        </div>
      </div>
    </section>
  );
}
