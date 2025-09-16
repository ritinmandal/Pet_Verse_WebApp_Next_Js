
"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { Trash2, ShoppingCart, ArrowRight, Minus, Plus } from "lucide-react";
import SpinnerLoader from "@/components/SpinnerLoader";

type CartRow = {
  id: string;
  user_id: string;
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  image_url: string | null;
  inserted_at: string;
};

export default function CartPage() {
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [items, setItems] = useState<CartRow[]>([]);
  const [msg, setMsg] = useState<string>("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      setMsg("");
      const { data: auth } = await supabase.auth.getUser();
      if (!auth?.user) {
        setLoading(false);
        setMsg("Please sign in to view your cart.");
        return;
      }
      setUserId(auth.user.id);

      const { data, error } = await supabase
        .from("cart")
        .select("*")
        .eq("user_id", auth.user.id)
        .order("inserted_at", { ascending: false });

      if (error) {
        console.error(error);
        setMsg("Could not load your cart.");
      } else {
        setItems((data as CartRow[]) ?? []);
      }
      setLoading(false);
    })();
  }, []);

  const subtotal = useMemo(
    () => items.reduce((acc, r) => acc + (Number(r.price) || 0) * r.quantity, 0),
    [items]
  );
  const tax = useMemo(() => Math.round(subtotal * 0.09), [subtotal]); // example
  const total = useMemo(() => subtotal + tax, [subtotal, tax]);

  const updateQty = async (row: CartRow, delta: number) => {
    if (busy) return;
    const next = Math.max(1, row.quantity + delta);
    const prevQty = row.quantity;
    setItems(prev => prev.map(it => (it.id === row.id ? { ...it, quantity: next } : it)));
    const { error } = await supabase.from("cart").update({ quantity: next }).eq("id", row.id).eq("user_id", userId!);
    if (error) {
      setItems(prev => prev.map(it => (it.id === row.id ? { ...it, quantity: prevQty } : it)));
      console.error(error);
      setMsg("Failed to update quantity.");
    }
  };

  const removeLine = async (row: CartRow) => {
    if (busy) return;
    const snapshot = items;
    setItems(items.filter(it => it.id !== row.id));
    const { error } = await supabase.from("cart").delete().eq("id", row.id).eq("user_id", userId!);
    if (error) {
      setItems(snapshot);
      console.error(error);
      setMsg("Failed to remove item.");
    }
  };

  const proceedToCheckout = async () => {
    setBusy(true);
    window.location.href = "/checkout";
  };

  return (
      <Suspense fallback={<SpinnerLoader text="Loading cart…" />}>

    <>
      
      <div className="relative w-full h-48 sm:h-64 md:h-72 lg:h-80 mb-8">
        <Image
          src="/images/statbg6.jpg"
          alt="Cart Banner"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-700/80 via-blue-900/80 to-cyan-600/70 flex flex-col justify-center items-center text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white drop-shadow-md">
            Your Cart
          </h1>
          <p className="text-sm sm:text-base text-gray-100 mt-2">Home / Shop / Cart</p>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-4 py-8 mb-12">
        {loading ? (
          <SpinnerLoader text="Loading your cart…" />
        ) : !userId ? (
          <p className="mt-6 text-blue-600">{msg}</p>
        ) : items.length === 0 ? (
          <EmptyCart />
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
            
            <section className="lg:col-span-2 space-y-4">
              {items.map((row) => (
                <motion.article
                  key={row.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-4 rounded-2xl border bg-white p-4 shadow-sm"
                >
                  <div className="relative h-20 w-20 overflow-hidden rounded-xl bg-gray-100">
                    <Image
                      src={row.image_url || "/images/placeholder.png"}
                      alt={row.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1">
                    <h3 className="font-semibold">{row.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">₹{Number(row.price).toLocaleString()}</p>

                    <div className="mt-3 flex items-center gap-2">
                      <button
                        onClick={() => updateQty(row, -1)}
                        className="rounded-full border p-1 hover:bg-gray-50"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-10 text-center">{row.quantity}</span>
                      <button
                        onClick={() => updateQty(row, +1)}
                        className="rounded-full border p-1 hover:bg-gray-50"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold">
                      ₹{(Number(row.price) * row.quantity).toLocaleString()}
                    </p>
                    <button
                      onClick={() => removeLine(row)}
                      className="mt-3 inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm hover:bg-gray-50"
                    >
                      <Trash2 className="h-4 w-4" /> Remove
                    </button>
                  </div>
                </motion.article>
              ))}
            </section>

            
            <aside className="h-fit rounded-2xl border bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold">Order Summary</h2>
              <div className="mt-4 space-y-2 text-sm">
                <Row label="Subtotal" value={subtotal} />
                <Row label="Tax (9%)" value={tax} />
                <div className="my-2 h-px bg-gray-200" />
                <Row label="Total" value={total} bold />
              </div>

              <button
                onClick={proceedToCheckout}
                disabled={busy || items.length === 0}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-700 to-cyan-500 px-4 py-3 font-semibold text-white hover:opacity-90 disabled:opacity-60 h-[52px]"
              >
                {busy ? (
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Redirecting…
                  </div>
                ) : (
                  <>
                    <ShoppingCart className="h-5 w-5" />
                    Proceed to checkout
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>

              {msg && <p className="mt-3 text-sm text-blue-700">{msg}</p>}
            </aside>
          </div>
        )}
      </main>
    </>
      </Suspense>

  );
}

function Row({ label, value, bold = false }: { label: string; value: number; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={bold ? "font-semibold" : ""}>{label}</span>
      <span className={bold ? "font-semibold" : ""}>
        ₹{Number(value).toLocaleString()}
      </span>
    </div>
  );
}

function EmptyCart() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-10 rounded-2xl border bg-white p-10 text-center shadow-sm"
    >
      <div className="mx-auto mb-4 h-14 w-14 rounded-2xl bg-blue-100 grid place-items-center">
        <ShoppingCart className="h-7 w-7 text-cyan-600" />
      </div>
      <h3 className="text-xl font-semibold">Your cart is empty</h3>
      <p className="mt-1 text-gray-500">Add items to get started.</p>
    </motion.div>
  );
}
