"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2, Lock, MapPin, Phone, Mail, CreditCard, Truck, Wallet, Landmark, IndianRupee } from "lucide-react";
import { supabase } from "@/lib/supabase";
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

type PayMode = "card" | "upi" | "netbanking" | "wallet";

export default function CheckoutPage() {
  const router = useRouter();

  const [userId, setUserId] = useState<string | null>(null);
  const [items, setItems] = useState<CartRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string>("");

  const [contact, setContact] = useState<{ email: string; phone: string }>({ email: "", phone: "" });
  const [addr, setAddr] = useState<{ name: string; line1: string; line2: string; city: string; state: string; pincode: string }>({
    name: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [delivery, setDelivery] = useState<"standard" | "express">("standard");
  const [payMode, setPayMode] = useState<PayMode>("card");

  useEffect(() => {
    (async () => {
      setLoading(true);
      setMsg("");
      const { data: auth } = await supabase.auth.getUser();
      if (!auth?.user) {
        setLoading(false);
        setMsg("Please sign in to continue.");
        return;
      }
      setUserId(auth.user.id);

      const { data, error } = await supabase
        .from("cart")
        .select("*")
        .eq("user_id", auth.user.id)
        .order("inserted_at", { ascending: false });

      if (error) {
        setMsg("Could not load your cart.");
      } else {
        setItems((data as CartRow[]) ?? []);
      }
      setLoading(false);
    })();
  }, []);

  const subtotal = useMemo(() => items.reduce((s, r) => s + Number(r.price) * r.quantity, 0), [items]);
  const deliveryFee = delivery === "standard" ? 0 : 90;

  const sgst = Math.round(subtotal * 0.09);
  const cgst = Math.round(subtotal * 0.09);
  const totalTax = sgst + cgst;
  const total = subtotal + totalTax + deliveryFee;

  const validForm =
    contact.email.trim().includes("@") &&
    contact.phone.trim().length >= 8 &&
    addr.name.trim().length >= 2 &&
    addr.line1.trim().length >= 3 &&
    addr.city.trim().length >= 2 &&
    addr.state.trim().length >= 2 &&
    addr.pincode.trim().length >= 4;

  const placeOrder = async () => {
    if (!userId || items.length === 0) return;
    if (!validForm) return;
    setBusy(true);
    setMsg("");
    try {
      const snapshot = {
        orderId: `BM-${Date.now().toString(36).toUpperCase()}`,
        when: new Date().toISOString(),
        items: items.map((r) => ({
          id: r.id,
          name: r.name,
          price: Number(r.price),
          quantity: r.quantity,
          image_url: r.image_url,
        })),
        summary: { subtotal, sgst, cgst, totalTax, deliveryFee, total },
        contact,
        address: addr,
        delivery,
        payMode,
      };

      localStorage.setItem("last_order", JSON.stringify(snapshot));

      const { error } = await supabase.from("cart").delete().eq("user_id", userId);
      if (error) throw error;

      window.location.href = "/checkout/success";
    } catch (e: unknown) {
      const message =
        typeof e === "object" && e !== null && "message" in e && typeof (e as { message?: unknown }).message === "string"
          ? (e as { message: string }).message
          : "Could not place order.";
      setMsg(message);
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <SpinnerLoader text="Loading checkout…" />;
  if (busy) return <SpinnerLoader text="Placing your order…" />;

  return (
    <>
      <div className="relative w-full h-48 sm:h-64 md:h-72 lg:h-80 mb-8">
        <Image src="/images/statbg4.jpg" alt="Checkout Banner" fill priority className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-700/80 via-blue-900/80 to-cyan-600/70 flex flex-col justify-center items-center text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-white drop-shadow-md">Checkout</h1>
          <p className="text-sm md:text-base text-gray-100 mt-2">Home / Shop / Cart / Checkout</p>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-4 py-10">
        {!userId ? (
          <p className="mt-6 text-blue-600">{msg}</p>
        ) : items.length === 0 ? (
          <Empty />
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <section className="lg:col-span-2 space-y-6">
              <Card>
                <SectionTitle icon={<CreditCard className="h-5 w-5" />} title="Payment method" />
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <PayTile checked={payMode === "card"} onClick={() => setPayMode("card")} title="Card" subtitle="Visa, Mastercard, RuPay" icons={<CardIcons />} />
                  <PayTile checked={payMode === "upi"} onClick={() => setPayMode("upi")} title="UPI" subtitle="Google Pay, PhonePe, Paytm" icons={<UpiBadge />} />
                  <PayTile checked={payMode === "netbanking"} onClick={() => setPayMode("netbanking")} title="Netbanking" subtitle="All major banks" icons={<Landmark className="h-5 w-5 text-blue-600" />} />
                  <PayTile checked={payMode === "wallet"} onClick={() => setPayMode("wallet")} title="Wallets" subtitle="Popular wallets supported" icons={<Wallet className="h-5 w-5 text-cyan-600" />} />
                </div>
                <p className="mt-3 text-xs text-gray-500 flex items-center gap-1">
                  <IndianRupee className="h-4 w-4" /> Demo checkout — no real money is charged.
                </p>
              </Card>

              <Card>
                <SectionTitle icon={<Mail className="h-5 w-5" />} title="Contact details" />
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input label="Email" placeholder="you@example.com" value={contact.email} onChange={(v) => setContact({ ...contact, email: v })} />
                  <Input label="Phone" placeholder="+91 9xxxxxxxxx" value={contact.phone} onChange={(v) => setContact({ ...contact, phone: v })} icon={<Phone className="h-4 w-4 text-gray-400" />} />
                </div>
              </Card>

              <Card>
                <SectionTitle icon={<MapPin className="h-5 w-5" />} title="Shipping address" />
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input label="Full name" value={addr.name} onChange={(v) => setAddr({ ...addr, name: v })} />
                  <Input label="Address line 1" value={addr.line1} onChange={(v) => setAddr({ ...addr, line1: v })} />
                  <Input label="Address line 2 (optional)" value={addr.line2} onChange={(v) => setAddr({ ...addr, line2: v })} />
                  <Input label="City" value={addr.city} onChange={(v) => setAddr({ ...addr, city: v })} />
                  <Input label="State" value={addr.state} onChange={(v) => setAddr({ ...addr, state: v })} />
                  <Input label="Pincode" value={addr.pincode} onChange={(v) => setAddr({ ...addr, pincode: v })} />
                </div>
              </Card>

              <Card>
                <SectionTitle icon={<Truck className="h-5 w-5" />} title="Delivery method" />
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <RadioTile checked={delivery === "standard"} onClick={() => setDelivery("standard")} title="Standard" subtitle="3-5 business days" price={0} />
                  <RadioTile checked={delivery === "express"} onClick={() => setDelivery("express")} title="Express" subtitle="1-2 business days" price={50} />
                </div>
              </Card>
            </section>

            <aside className="h-fit w-100 rounded-2xl border bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold">Order Summary</h2>
              <div className="mt-4 space-y-3">
                {items.map((r) => (
                  <div key={r.id} className="flex items-center gap-3">
                    <div className="relative h-14 w-14 overflow-hidden rounded-xl bg-gray-100">
                      <Image src={r.image_url || "/images/placeholder.png"} alt={r.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium truncate">{r.name}</p>
                        <span className="text-sm">₹{(Number(r.price) * r.quantity).toLocaleString()}</span>
                      </div>
                      <p className="text-xs text-gray-500">
                        Qty {r.quantity} • ₹{Number(r.price).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="my-4 h-px bg-gray-200" />

              <Row label="Subtotal" value={subtotal} />
              <Row label="SGST (9%)" value={sgst} />
              <Row label="CGST (9%)" value={cgst} />
              <Row label={`Delivery (${delivery === "standard" ? "Standard" : "Express"})`} value={deliveryFee} />
              <div className="my-2 h-px bg-gray-200" />
              <Row label="Total" value={total} bold />

              <button
                onClick={placeOrder}
                disabled={busy || !validForm}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-cyan-600 disabled:opacity-60"
              >
                {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Lock className="h-5 w-5" />}
                Place order
              </button>

              {!validForm && <p className="mt-3 text-xs text-blue-600">Fill contact & shipping details to enable the button.</p>}
              {msg && <p className="mt-3 text-sm text-blue-700">{msg}</p>}
            </aside>
          </div>
        )}
      </main>
    </>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl border bg-white p-6 shadow-sm">{children}</div>;
}

function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="grid h-9 w-9 place-items-center rounded-xl bg-blue-50 text-cyan-600">{icon}</div>
      <h3 className="text-lg font-semibold">{title}</h3>
    </div>
  );
}

function Input({
  label,
  placeholder,
  value,
  onChange,
  icon,
}: {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (val: string) => void;
  icon?: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <div className="mt-1 flex items-center gap-2 rounded-xl border bg-white px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500">
        {icon}
        <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full rounded-md outline-none" />
      </div>
    </label>
  );
}

function RadioTile({
  checked,
  onClick,
  title,
  subtitle,
  price,
}: {
  checked: boolean;
  onClick: () => void;
  title: string;
  subtitle: string;
  price: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center justify-between rounded-2xl border p-4 text-left transition hover:bg-gray-50 ${
        checked ? "border-blue-500 ring-2 ring-cyan-200" : "border-gray-200"
      }`}
    >
      <div>
        <p className="font-semibold">{title}</p>
        <p className="text-sm text-gray-500">{subtitle}</p>
      </div>
      <div className="text-right">
        <p className="font-medium">{price === 0 ? "Free" : `₹${price}`}</p>
      </div>
    </button>
  );
}

function PayTile({
  checked,
  onClick,
  title,
  subtitle,
  icons,
}: {
  checked: boolean;
  onClick: () => void;
  title: string;
  subtitle: string;
  icons: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center justify-between rounded-2xl border p-4 text-left transition hover:bg-gray-50 ${
        checked ? "border-blue-500 ring-2 ring-cyan-200" : "border-gray-200"
      }`}
    >
      <div>
        <p className="font-semibold">{title}</p>
        <p className="text-sm text-gray-500">{subtitle}</p>
      </div>
      <div className="flex items-center gap-2">{icons}</div>
    </button>
  );
}

function CardIcons() {
  return (
    <div className="flex items-center gap-2">
      <span className="rounded-md border px-2 py-1 text-[10px] font-bold text-blue-700 bg-white">VISA</span>
      <span className="rounded-md border px-2 py-1 text-[10px] font-bold text-black bg-white">Mastercard</span>
      <span className="rounded-md border px-2 py-1 text-[10px] font-bold text-cyan-700 bg-white">RuPay</span>
    </div>
  );
}

function UpiBadge() {
  return <span className="rounded-md border px-2 py-1 text-[10px] font-bold text-cyan-700 bg-white">UPI</span>;
}

function Row({ label, value, bold = false }: { label: string; value: number; bold?: boolean }) {
  return (
    <div className="mt-1 flex items-center justify-between">
      <span className={bold ? "font-semibold" : ""}>{label}</span>
      <span className={bold ? "font-semibold" : ""}>{value === 0 ? "Free" : `₹${Number(value).toLocaleString()}`}</span>
    </div>
  );
}

function Empty() {
  return (
    <div className="mt-10 rounded-2xl border bg-white p-10 text-center shadow-sm">
      <h3 className="text-xl font-semibold">Your cart is empty</h3>
      <p className="mt-1 text-gray-500">Add items and try again.</p>
    </div>
  );
}
