"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ShoppingCart, Star, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Product } from "@/types/product";
import { supabase } from "@/lib/supabase";

const TABLE_NAME = "cart";


const DEEP_BLUE = "#0B2A45";   // deep blue for text / borders
const CYAN = "#06B6D4";        // primary accent
const CYAN_DARK = "#0891B2";   // hover/active
const CYAN_TINT = "rgba(6,182,212,0.12)"; // subtle bg tint

export default function ProductCard({ product }: { product: Product }) {
  const router = useRouter();
  const [hover, setHover] = useState(false);
  const [liked, setLiked] = useState(false);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const {
    id: product_id,
    name,
    badge,
    img_1,
    img_2,
    rating = 0,
    discount_price,
    old_price,
  } = product;

  const closeDrawer = useCallback(() => setOpen(false), []);
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && closeDrawer();
    if (open) window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [open, closeDrawer]);

  const goToCart = () => router.push("/cart");

  const addToCart = async () => {
    try {
      setBusy(true);
      setMsg(null);

      const { data: userData, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userData?.user) {
        setMsg("Please sign in to add items to your cart.");
        return;
      }

      const user_id = userData.user.id;

      const { data: existing, error: fetchErr } = await supabase
        .from(TABLE_NAME)
        .select("id, quantity")
        .eq("user_id", user_id)
        .eq("product_id", product_id)
        .single();

      if (fetchErr && fetchErr.code !== "PGRST116") {
        throw fetchErr;
      }

      if (existing) {
        const { error: updateErr } = await supabase
          .from(TABLE_NAME)
          .update({ quantity: existing.quantity + 1 })
          .eq("id", existing.id)
          .eq("user_id", user_id);

        if (updateErr) throw updateErr;
        setMsg("Updated quantity in cart");
      } else {
        const payload = {
          user_id,
          product_id,
          name,
          price: Number(discount_price ?? 0),
          quantity: 1,
          image_url: img_1 ?? null,
          inserted_at: new Date().toISOString(),
        };

        const { error: insertErr } = await supabase.from(TABLE_NAME).insert(payload);
        if (insertErr) throw insertErr;
        setMsg("Added to cart");
      }
    } catch (e: any) {
      setMsg(e?.message || "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      
      <motion.div
        viewport={{ once: false }}
        transition={{ duration: 0.4 }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        className="
          group relative
          w-full sm:w-[90%] md:w-[88%] lg:w-[89%]
          h-[300px] sm:h-[300px] md:h-[380px] lg:h-[390px]
          rounded-[18px] sm:rounded-[20px] md:rounded-[22px] lg:rounded-[24px]
          bg-white text-[var(--deep)]
          border border-[color:var(--deep-8)]
          shadow-sm overflow-hidden
          transition-all duration-300
          hover:shadow-lg
        "
        style={
          {

            ["--deep" as any]: DEEP_BLUE,
            ["--deep-8" as any]: "rgba(11,42,69,0.12)",
          } as React.CSSProperties
        }
      >
        
        <div
          className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-300 opacity-0 group-hover:opacity-100"
          style={{ boxShadow: `0 0 0 2px ${CYAN_TINT} inset` }}
        />

        
        {badge && (
          <span
            className="
              absolute left-3 top-3 sm:left-5 sm:top-5
              z-10 rounded-full
              px-2 sm:px-3 py-0.5 sm:py-1
              text-[9px] sm:text-[10px] md:text-xs font-bold uppercase tracking-wider
              transition-colors duration-300
            "
            style={{
              background: CYAN_TINT,
              color: DEEP_BLUE,
              border: `1px solid ${CYAN}`,
            }}
          >
            {badge}
          </span>
        )}

        
        <motion.button
          aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}
          onClick={() => setLiked((p) => !p)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="
            absolute right-3 top-3 sm:right-5 sm:top-5
            z-10 grid h-8 w-8 sm:h-9 sm:w-9
            place-items-center
            opacity-0 group-hover:opacity-100 transition
          "
          style={{ color: CYAN }}
        >
          <Heart
            size={20}
            className={liked ? "fill-current" : ""}
            style={liked ? { color: CYAN } : undefined}
          />
        </motion.button>

        
        <div
          className="
            relative m-3 sm:m-4 h-40 sm:h-48 md:h-52 lg:h-56
            overflow-hidden rounded-lg sm:rounded-xl lg:rounded-2xl
            bg-white
          "
        >
          <Image
            src={hover ? img_2 || img_1 || "/images/placeholder.png" : img_1 || "/images/placeholder.png"}
            alt={name || "Product"}
            fill
            draggable={false}
            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
        </div>

        
        <div className="px-3 sm:px-4 md:px-5 pb-5 pt-1 text-center">
          <h3 className="mt-2 mb-1 sm:mb-2 text-base sm:text-lg md:text-xl lg:text-2xl font-bold truncate">
            {name}
          </h3>

          
          <div className="mb-1 sm:mb-2 flex justify-center gap-0.5 sm:gap-1">
            {Array.from({ length: 5 }).map((_, idx) => (
              <Star
                key={idx}
                size={12}
                className={
                  idx < Math.round(rating)
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-slate-300"
                }
              />
            ))}
          </div>

          
          <div className="text-xs sm:text-sm md:text-base font-semibold">
            {!!old_price && (
              <span className="line-through opacity-60 mr-1">
                ₹{Number(old_price).toLocaleString()}
              </span>
            )}
            <span className="font-bold" style={{ color: DEEP_BLUE }}>
              ₹{Number(discount_price ?? 0).toLocaleString()}
            </span>
          </div>
        </div>

        
        <motion.button
          aria-label="Add to cart"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setOpen(true)}
          className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 grid h-9 w-9 sm:h-10 sm:w-10 md:h-11 md:w-11 place-items-center rounded-full text-white font-bold transition"
          style={{
            background: CYAN,
            boxShadow: `0 0 0 3px ${CYAN_TINT}`,
          }}
        >
          <ShoppingCart size={20} className="sm:size-5 md:size-6" />
        </motion.button>
      </motion.div>

      
      <AnimatePresence>
        {open && (
          <>
            
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={closeDrawer}
              className="fixed inset-0 z-[70] bg-black"
            />

            
            <motion.aside
              key="drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.28 }}
              className="
                fixed right-0 top-0 z-[80] h-full
                w-full sm:w-[80%] md:w-[420px]
                bg-white
                shadow-2xl rounded-l-2xl
                border-l
              "
              role="dialog"
              aria-modal="true"
              style={{ borderColor: "rgba(11,42,69,0.12)" }}
            >
              
              <div className="relative flex items-center p-3 sm:p-4 border-b" style={{ borderColor: "rgba(11,42,69,0.12)" }}>
                <h2 className="flex-1 text-center text-base sm:text-lg md:text-xl font-semibold" style={{ color: DEEP_BLUE }}>
                  Add to cart
                </h2>
                <button
                  onClick={closeDrawer}
                  className="p-2 rounded-full hover:bg-slate-100"
                  aria-label="Close"
                  style={{ color: DEEP_BLUE }}
                >
                  <X size={18} />
                </button>
              </div>

              
              <div className="p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-slate-100 mx-auto sm:mx-0">
                    <Image
                      src={img_1 || "/images/placeholder.png"}
                      alt={name || "Product"}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <p className="font-semibold" style={{ color: DEEP_BLUE }}>{name}</p>
                    <div className="mt-1 flex items-center justify-center sm:justify-start gap-2 text-sm">
                      {!!old_price && (
                        <span className="line-through text-slate-500">
                          ₹{Number(old_price).toLocaleString()}
                        </span>
                      )}
                      <span className="font-bold" style={{ color: DEEP_BLUE }}>
                        ₹{Number(discount_price ?? 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                
                <div className="mt-6 space-y-3">
                  <button
                    onClick={addToCart}
                    disabled={busy}
                    className="w-full rounded-2xl text-white font-semibold py-3 shadow transition-colors disabled:opacity-60"
                    style={{ background: CYAN }}
                  >
                    {busy ? "Adding..." : "Add to cart"}
                  </button>

                  <button
                    onClick={goToCart}
                    className="w-full rounded-xl font-semibold py-3 border transition-colors"
                    style={{
                      color: DEEP_BLUE,
                      background: "white",
                      borderColor: CYAN,
                    }}
                  >
                    Go to cart
                  </button>

                  <button
                    onClick={closeDrawer}
                    className="w-full rounded-xl font-semibold py-3 border hover:bg-slate-50"
                    style={{ color: DEEP_BLUE, borderColor: "rgba(11,42,69,0.12)", background: "white" }}
                  >
                    Keep browsing
                  </button>
                </div>

                {msg && (
                  <p className="mt-3 text-sm text-center" style={{ color: CYAN_DARK }}>
                    {msg}
                  </p>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
