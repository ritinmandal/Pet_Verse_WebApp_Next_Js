"use client";

import { useEffect, useState } from "react";
import { Search, PawPrint } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Props = {
  search: string;
  setSearch: (s: string) => void;
  category: string;
  setCategory: (c: string) => void;
  priceRange: [number, number];
  setPriceRange: (r: [number, number]) => void;
  tags: string[];
  setTags: (t: string[]) => void;
};

type ProductRow = {
  category: string | null;
  tags: string | null;
};

export default function Sidebar({
  search,
  setSearch,
  category,
  setCategory,
  priceRange,
  setPriceRange,
  tags,
  setTags,
}: Props) {
  const [categories, setCategories] = useState<{ name: string; count: number }[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        setLoading(true);

        const { data, error } = (await supabase
          .from("products")
          .select("category, tags")) as { data: ProductRow[] | null; error: any };

        if (error) throw error;

        if (data) {
          const categoryCounts: Record<string, number> = {};
          const tagSet: Set<string> = new Set();

          data.forEach((item) => {
            if (item.category) {
              const cleanCategory = item.category.trim().toLowerCase();
              categoryCounts[cleanCategory] = (categoryCounts[cleanCategory] || 0) + 1;
            }
            if (item.tags) {
              item.tags.split(",").forEach((tag) => {
                const t = tag.trim();
                if (t) tagSet.add(t);
              });
            }
          });

          const formattedCategories = Object.entries(categoryCounts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => a.name.localeCompare(b.name));

          setCategories(formattedCategories);
          setAllTags(Array.from(tagSet).sort());
        }
      } catch (err) {
        console.error("Error fetching filters:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFilters();
  }, []);

  const toggleTag = (tag: string) => {
    if (tags.includes(tag)) {
      setTags([]);
    } else {
      setTags([tag]); // single-select behavior (as in your original)
    }
  };

  const resetTags = () => setTags([]);

  return (
    <div className="w-full p-4 space-y-6">
      
      <div className="relative">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-3 rounded-full border border-slate-300/50 bg-white/80 backdrop-blur
                     text-slate-800 placeholder-slate-500 shadow-inner
                     focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition"
        />
        <button
          type="button"
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full
                     bg-gradient-to-r from-blue-700 to-cyan-500 text-white
                     hover:from-blue-800 hover:to-cyan-600 active:scale-95 hover:scale-105
                     transition-transform duration-200 shadow"
        >
          <Search size={18} />
        </button>
      </div>

      
      <div>
        <h3 className="font-bold text-lg mb-4 bg-gradient-to-r from-blue-900 to-cyan-600 bg-clip-text text-transparent">
          Shop by Categories
        </h3>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-6 w-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-2">
            
            <div
              className={`flex justify-between items-center p-3 rounded-2xl cursor-pointer transition-all duration-200 transform
                ${
                  category === "all"
                    ? "bg-gradient-to-r from-blue-800 to-cyan-600 text-white shadow-md scale-[1.02]"
                    : "bg-white/70 hover:bg-white text-slate-700 hover:shadow active:scale-95"
                }`}
              onClick={() => setCategory("all")}
            >
              <span className="flex items-center gap-3">
                <PawPrint
                  size={18}
                  className={`${
                    category === "all" ? "text-white" : "text-cyan-600"
                  }`}
                />
                <span className="font-medium">All Products</span>
              </span>
            </div>

            
            {categories.map((c) => {
              const displayName = c.name.charAt(0).toUpperCase() + c.name.slice(1);
              const isSelected = category === c.name;

              return (
                <div
                  key={c.name}
                  className={`flex justify-between items-center p-3 rounded-2xl cursor-pointer transition-all duration-200 transform
                    ${
                      isSelected
                        ? "bg-gradient-to-r from-blue-800 to-cyan-600 text-white shadow-md scale-[1.02]"
                        : "bg-white/70 hover:bg-white text-slate-700 hover:shadow active:scale-95"
                    }`}
                  onClick={() => setCategory(c.name)}
                >
                  <span className="flex items-center gap-3">
                    <PawPrint size={18} className={isSelected ? "text-white" : "text-cyan-600"} />
                    <span className="font-medium">{displayName}</span>
                  </span>
                  <span
                    className={`text-sm px-2 py-1 rounded-full backdrop-blur-sm
                      ${
                        isSelected
                          ? "bg-white/25 text-white"
                          : "bg-slate-100 text-slate-700 border border-slate-200"
                      }`}
                  >
                    {c.count}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      
      <div>
        <h3 className="font-bold text-lg mb-4 bg-gradient-to-r from-blue-900 to-cyan-600 bg-clip-text text-transparent">
          Price Range
        </h3>

        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-slate-600">0</span>

            <input
              type="range"
              min="0"
              max="10000"
              step="100"
              value={priceRange[1]}
              onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer
                         bg-gradient-to-r from-blue-200 to-cyan-200 accent-cyan-500"
            />

            <span className="text-sm font-medium text-slate-600">10000</span>
          </div>

          <div className="text-center">
            <p className="text-slate-800 font-semibold">
              Price: ₹{priceRange[0]} — ₹{priceRange[1]}
            </p>
          </div>
        </div>
      </div>

      
      <div>
        <h3 className="font-bold text-lg mb-4 bg-gradient-to-r from-blue-900 to-cyan-600 bg-clip-text text-transparent">
          Filter By Tags
        </h3>

        <div className="flex flex-wrap gap-2">
          {allTags.map((tag) => {
            const isActive = tags.includes(tag);
            return (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1 rounded-full text-sm transition-all transform border
                  ${
                    isActive
                      ? "text-white border-transparent scale-105 shadow-sm bg-gradient-to-r from-blue-700 to-cyan-500"
                      : "bg-white/70 text-slate-700 border-slate-300 hover:bg-white hover:scale-105 active:scale-95"
                  }`}
              >
                {tag}
              </button>
            );
          })}
        </div>

        {tags.length > 0 && (
          <div className="mt-4">
            <button
              onClick={resetTags}
              className="w-full py-2 px-4 rounded-full font-medium transition-transform duration-200
                         bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700
                         hover:from-slate-200 hover:to-slate-300 hover:scale-[1.01] active:scale-95"
            >
              Reset Tags
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
