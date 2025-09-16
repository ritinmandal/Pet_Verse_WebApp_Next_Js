"use client";

import { motion } from "framer-motion";
import ProductCard from "./ProductCard";
import { Product } from "@/types/product";


const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function ProductGrid({ products }: { products: Product[] }) {
  if (!products || products.length === 0) {
    return (
      <div className="text-center text-gray-500 py-12">
        <p className="text-lg">No products to display.</p>
      </div>
    );
  }

  return (
    <motion.div
      className="
        grid gap-3
        grid-cols-1        
        sm:grid-cols-2     
        md:grid-cols-3     
        lg:grid-cols-3     
      "
      whileInView="visible"
      variants={containerVariants}
    >
      {products.map((p) => (
        <motion.div
          key={p.id ?? `${p.name}-${Math.random()}`}
          variants={itemVariants}
          transition={{ duration: 0.4 }}
        >
          <ProductCard product={p} />
        </motion.div>
      ))}
    </motion.div>
  );
}
