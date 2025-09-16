"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { CheckCircle2, Home, Download, IndianRupee, Sparkles, X } from "lucide-react";

type OrderItem = {
  id: string; name: string; price: number; quantity: number; image_url: string | null;
};
type LastOrder = {
  orderId: string; when: string; items: OrderItem[];
  summary: { subtotal: number; sgst: number; cgst: number; totalTax: number; deliveryFee: number; total: number };
  contact: { email: string; phone: string };
  address: { name: string; line1: string; line2?: string; city: string; state: string; pincode: string };
  delivery: "standard" | "express"; payMode: "card" | "upi" | "netbanking" | "wallet";
};

const prettyPayMode = (mode: LastOrder["payMode"] | undefined) => {
  const modes = { card: "Credit/Debit Card", upi: "UPI Payment", netbanking: "Net Banking", wallet: "Digital Wallet" };
  return modes[mode || "card"] || "â€”";
};

const formatDate = (date: string) => new Date(date).toLocaleDateString();
const formatDateTime = (date: string) => new Date(date).toLocaleString();

const AnimatedParticles = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none">
    {[...Array(12)].map((_, i) => (
      <motion.div key={i} className="absolute w-2 h-2 bg-green-400 rounded-full opacity-30"
        initial={{ x: Math.random() * 1200, y: 800 }}
        animate={{ y: -10, x: Math.random() * 1200 }}
        transition={{ duration: Math.random() * 3 + 2, repeat: Infinity, delay: Math.random() * 2 }} />
    ))}
  </div>
);

const SuccessHeader = ({ order }: { order: LastOrder | null }) => (
  <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} 
    transition={{ duration: 0.6, type: "spring" }} className="text-center">
    <div className="relative inline-block">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, duration: 0.5 }}
        className="absolute -inset-4 rounded-full bg-green-100" />
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.4, duration: 0.5 }} className="relative">
        <CheckCircle2 className="h-24 w-24 text-green-500 mx-auto" />
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6, duration: 0.3 }}
          className="absolute -top-2 -right-2">
          <Sparkles className="h-8 w-8 text-yellow-400" />
        </motion.div>
      </motion.div>
    </div>
    
    <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3, duration: 0.6 }}
      className="mt-6 text-4xl md:text-6xl font-extrabold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
      Payment Successful!
    </motion.h1>
    
    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5, duration: 0.6 }}
      className="mt-4 space-y-2">
      <p className="text-xl text-gray-700 font-medium">Your order has been confirmed and is being processed</p>
      <div className="flex items-center justify-center gap-2 text-green-600">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <span className="text-sm font-medium">Order is being prepared</span>
      </div>
    </motion.div>

    {order?.orderId && (
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.7, duration: 0.6 }}
        className="mt-4 inline-block bg-white/80 backdrop-blur-sm rounded-2xl px-6 py-3 shadow-lg border border-green-200">
        <p className="text-sm text-gray-600">Order ID</p>
        <p className="text-lg font-bold text-green-700">{order.orderId}</p>
      </motion.div>
    )}
  </motion.div>
);

const OrderSummary = ({ order, itemCount }: { order: LastOrder | null; itemCount: number }) => (
  <section className="lg:col-span-2 rounded-3xl border bg-white/80 backdrop-blur-sm shadow-xl p-8">
    <div className="flex items-center justify-between">
      <h2 className="text-2xl font-bold text-gray-900">Order Summary</h2>
      {itemCount > 0 && (
        <span className="rounded-full bg-green-100 px-4 py-2 text-sm font-bold text-green-700">
          {itemCount} item{itemCount > 1 ? "s" : ""}
        </span>
      )}
    </div>

    {!order || order.items.length === 0 ? (
      <div className="mt-8 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 p-8 text-center text-gray-600">
        <p className="text-lg">No order to display</p>
      </div>
    ) : (
      <>
        <div className="mt-6 space-y-6">
          {order.items.map((item, index) => (
            <motion.div key={item.id} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.9 + index * 0.1, duration: 0.5 }}
              className="flex items-center gap-6 bg-gradient-to-r from-gray-50 to-white p-4 rounded-2xl border border-gray-100">
              <div className="relative h-20 w-20 rounded-2xl overflow-hidden bg-gray-100 shadow-md">
                <Image src={item.image_url || "/images/placeholder.png"} alt={item.name} fill className="object-cover" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 text-lg">{item.name}</p>
                <p className="text-gray-600 mt-1">Qty {item.quantity} Rs {Number(item.price).toLocaleString()}</p>
              </div>
              <p className="font-bold text-xl text-green-600">Rs {(Number(item.price) * item.quantity).toLocaleString()}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 bg-gradient-to-r from-gray-50 to-green-50 rounded-2xl p-6 space-y-3">
          {[
            ['Subtotal', order.summary.subtotal],
            ['SGST (9%)', order.summary.sgst],
            ['CGST (9%)', order.summary.cgst],
            [`Delivery (${order.delivery === "standard" ? "Standard" : "Express"})`, order.summary.deliveryFee]
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between text-base">
              <span className="text-gray-700">{label}</span>
              <span className="font-semibold text-gray-900">Rs {Number(value).toLocaleString()}</span>
            </div>
          ))}
          <div className="border-t-2 border-green-200 my-4" />
          <div className="flex items-center justify-between text-base">
            <span className="font-bold text-gray-900">Total Paid</span>
            <span className="font-bold text-2xl text-green-600">Rs {Number(order.summary.total).toLocaleString()}</span>
          </div>
        </div>
      </>
    )}
  </section>
);

const OrderDetails = ({ order }: { order: LastOrder | null }) => (
  <aside className="rounded-3xl border bg-white/80 backdrop-blur-sm shadow-xl p-8 space-y-8 h-fit">
    <motion.section initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 1.0, duration: 0.6 }}>
      <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
        Payment Status
      </h3>
      <div className="mt-4 space-y-3">
        <div className="flex justify-between items-start text-sm">
          <span className="text-gray-600 font-medium">Status</span>
          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold">Rs Paid Successfully</span>
        </div>
        <div className="flex justify-between items-start text-sm">
          <span className="text-gray-600 font-medium">Payment method</span>
          <span className="text-gray-900 font-semibold">{prettyPayMode(order?.payMode)}</span>
        </div>
        <div className="flex justify-between items-start text-sm">
          <span className="text-gray-600 font-medium">Transaction time</span>
          <span className="text-gray-900 font-semibold">{order?.when ? formatDateTime(order.when) : "â€”"}</span>
        </div>
      </div>
    </motion.section>

    <motion.section initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 1.1, duration: 0.6 }}>
      <h3 className="text-xl font-bold text-gray-900">Shipping Address</h3>
      <div className="mt-4 bg-gray-50 rounded-xl p-4 text-sm text-gray-700 leading-relaxed">
        {order?.address ? (
          <>
            <p className="font-semibold text-gray-900">{order.address.name}</p>
            <p>{order.address.line1}</p>
            {order.address.line2 && <p>{order.address.line2}</p>}
            <p className="font-medium">{order.address.city}, {order.address.state} {order.address.pincode}</p>
          </>
        ) : <p>â€”</p>}
      </div>
    </motion.section>

    <motion.section initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 1.2, duration: 0.6 }}>
      <h3 className="text-xl font-bold text-gray-900">Contact Details</h3>
      <div className="mt-4 space-y-2 text-sm">
        {[['Email', order?.contact?.email], ['Phone', order?.contact?.phone]].map(([label, value]) => (
          <div key={label} className="bg-gray-50 rounded-lg p-3">
            <span className="text-gray-600">{label}:</span>
            <p className="font-medium">{value || "â€”"}</p>
          </div>
        ))}
      </div>
    </motion.section>
  </aside>
);

const InvoiceModal = ({ order, onClose }: { order: LastOrder; onClose: () => void }) => {
  const invoiceHTML = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Invoice - Pet Verse</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:Inter,sans-serif;color:#1f2937;background:#f9fafb;padding:20px;min-height:100vh}
@media print{body{padding:0;margin:0;background:#fff!important;-webkit-print-color-adjust:exact;print-color-adjust:exact}}

.invoice{width:100%;max-width:850px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,.1);display:flex;flex-direction:column}
@media print{.invoice{box-shadow:none;border:none;border-radius:0;width:100%;max-width:100%}}

.header{background:linear-gradient(135deg,#0f172a,#06b6d4);color:#fff;padding:30px}
.header-content{display:flex;justify-content:space-between;align-items:start;flex-wrap:wrap;gap:20px}
.company h1{font-size:2.2rem;font-weight:800;margin-bottom:8px}
.tagline{font-size:1rem;opacity:.95;margin-bottom:10px}
.company-details{font-size:.9rem;opacity:.85;line-height:1.5}

.invoice-meta{text-align:right;background:rgba(255,255,255,.15);padding:16px;border-radius:12px;backdrop-filter:blur(8px)}
.invoice-meta h2{font-size:1.5rem;margin-bottom:10px}

.body{padding:30px;flex:1}
.billing{display:grid;grid-template-columns:1fr 1fr;gap:25px;margin-bottom:25px}
.billing-card{background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:20px}
.billing-card h3{color:#06b6d4;font-size:1rem;font-weight:700;margin-bottom:10px;border-bottom:2px solid #06b6d4;padding-bottom:6px}
.billing-details{line-height:1.6;font-size:0.9rem;color:#374151}

.table{width:100%;border-collapse:collapse;margin-bottom:20px;border-radius:12px;overflow:hidden}
.table thead{background:#06b6d4;color:#fff}
.table th{padding:12px;text-align:left;font-weight:600;font-size:0.9rem}
.table th:last-child,.table td:last-child{text-align:right}
.table tbody tr{border-bottom:1px solid #e5e7eb}
.table tbody tr:nth-child(even){background:#f9fafb}
.table td{padding:12px;font-size:0.9rem}
.item-name{font-weight:600;color:#111827}
.qty-badge{background:#e0f2fe;color:#0284c7;padding:3px 10px;border-radius:12px;font-weight:600;font-size:.8rem}
.price{font-weight:600;color:#111827}

.totals{background:#f0fdfa;border:2px solid #06b6d4;border-radius:16px;padding:20px;margin-bottom:20px}
.totals-table{width:100%;max-width:380px;margin-left:auto}
.totals-table tr{border-bottom:1px solid #bae6fd}
.totals-table tr:last-child{border-bottom:3px solid #06b6d4;font-weight:700}
.totals-table td{padding:10px 0;font-size:0.95rem}
.total-amount{color:#06b6d4;font-size:1.3rem;font-weight:800}

.payment-status{background:linear-gradient(135deg,#06b6d4,#0ea5e9);color:#fff;padding:18px;border-radius:12px;text-align:center;margin-bottom:20px;box-shadow:0 4px 12px rgba(0,0,0,.1)}
.payment-status h3{font-size:1.2rem;margin-bottom:6px}

.payment-details{display:grid;grid-template-columns:repeat(4,1fr);gap:15px;margin-bottom:20px}
.payment-detail{background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:12px;text-align:center}
.payment-detail .label{font-size:.75rem;color:#6b7280;margin-bottom:3px}
.payment-detail .value{font-weight:700;font-size:0.9rem;color:#111827}

.footer{background:#f9fafb;padding:18px;text-align:center;border-top:2px solid #06b6d4;margin-top:auto}
.thank-you{font-size:1rem;font-weight:700;color:#06b6d4;margin-bottom:8px}
.support-info{color:#6b7280;font-size:.85rem;line-height:1.5}

.btn{padding:12px 24px;border-radius:10px;font-weight:600;cursor:pointer;border:none;margin:0 10px;transition:all .2s}
.btn-primary{background:#06b6d4;color:#fff}
.btn-primary:hover{background:#0ea5e9}
.btn-secondary{background:#fff;color:#06b6d4;border:2px solid #06b6d4}
.btn-secondary:hover{background:#f0fdfa}
@media print{.btn{display:none}}
@media(max-width:768px){.billing{grid-template-columns:1fr}.payment-details{grid-template-columns:repeat(2,1fr)}}
@page{margin:0.3in;size:A4}
</style>
</head>
<body>
<div class="invoice">
  <div class="header">
    <div class="header-content">
      <div class="company">
        <h1>Pet Verse</h1>
        <div class="tagline">Caring Beyond Companionship</div>
        <div class="company-details">GST: 07AABCP0123A1Z5<br>Phone: +91 7978543313 <br>Email: support@petverse.com</div>
      </div>
      <div class="invoice-meta">
        <h2>INVOICE</h2>
        <div>Invoice No: <strong>${order.orderId}</strong></div>
        <div>Date: <strong>${formatDate(order.when)}</strong></div>
        <div>Payment: <strong>${prettyPayMode(order.payMode)}</strong></div>
      </div>
    </div>
  </div>

  <div class="body">
    <div class="billing">
      <div class="billing-card">
        <h3>Bill To</h3>
        <div class="billing-details">
          <strong>${order.address.name}</strong><br>
          ${order.address.line1}<br>
          ${order.address.line2 ? order.address.line2 + '<br>' : ''}
          ${order.address.city}, ${order.address.state} ${order.address.pincode}<br>
          <strong>Email:</strong> ${order.contact.email}<br>
          <strong>Phone:</strong> ${order.contact.phone}
        </div>
      </div>
      <div class="billing-card">
        <h3>Ship To</h3>
        <div class="billing-details">
          <strong>${order.address.name}</strong><br>
          ${order.address.line1}<br>
          ${order.address.line2 ? order.address.line2 + '<br>' : ''}
          ${order.address.city}, ${order.address.state} ${order.address.pincode}
        </div>
      </div>
    </div>

    <table class="table">
      <thead><tr><th>Item Description</th><th>Qty</th><th>Unit Price</th><th>Amount</th></tr></thead>
      <tbody>
        ${order.items.map(item => `
          <tr>
            <td><div class="item-name">${item.name}</div></td>
            <td><span class="qty-badge">${item.quantity}</span></td>
            <td class="price">Rs ${Number(item.price).toLocaleString()}</td>
            <td class="price">Rs ${(Number(item.price) * item.quantity).toLocaleString()}</td>
          </tr>`).join('')}
      </tbody>
    </table>

    <div class="totals">
      <table class="totals-table">
        ${[
          ['Subtotal', order.summary.subtotal],
          ['SGST (9%)', order.summary.sgst],
          ['CGST (9%)', order.summary.cgst],
          [`Delivery (${order.delivery === 'standard' ? 'Standard' : 'Express'})`, order.summary.deliveryFee]
        ].map(([label, value]) => `<tr><td>${label}:</td><td>Rs ${Number(value).toLocaleString()}</td></tr>`).join('')}
        <tr><td><strong>Total Amount:</strong></td><td class="total-amount">Rs ${order.summary.total.toLocaleString()}</td></tr>
      </table>
    </div>

    <div class="payment-status">
      <h3>Rs Payment Successful</h3>
      <p>Your payment has been processed securely</p>
    </div>

    <div class="payment-details">
      ${[
        ['Transaction ID', order.orderId],
        ['Payment Method', prettyPayMode(order.payMode)],
        ['Transaction Time', formatDateTime(order.when)],
        ['Delivery Type', `${order.delivery === 'standard' ? 'Standard' : 'Express'} Delivery`]
      ].map(([label, value]) => `
        <div class="payment-detail">
          <div class="label">${label}</div>
          <div class="value">${value}</div>
        </div>`).join('')}
    </div>

    <div style="text-align:center;margin:20px 0">
      <button class="btn btn-primary" onclick="window.print()">Print Invoice</button>
      <button class="btn btn-secondary" onclick="window.close()">Close</button>
    </div>
  </div>

  <div class="footer">
    <div class="thank-you">Thank you for trusting Pet Verse!</div>
    <div class="support-info">For queries: <a href="mailto:support@petverse.com">support@petverse.com</a> or +91 7978543313</div>
  </div>
</div>
</body>
</html>`;


  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        <div className="sticky top-0 bg-cyan-700 text-white p-4 flex justify-between items-center">
          <h3 className="text-xl font-semibold mx-auto">Pet Verse Invoice</h3>
          <button onClick={onClose} className="text-white hover:text-gray-200 transition-colors p-2">
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="h-[calc(90vh-80px)] overflow-auto">
          <iframe srcDoc={invoiceHTML} className="w-full h-full border-0" title="Invoice" />
        </div>
      </motion.div>
    </div>
  );
};

export default function SuccessPage() {
  const router = useRouter();
  const [order, setOrder] = useState<LastOrder | null>(null);
  const [showInvoice, setShowInvoice] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("last_order");
    if (raw) {
      try { setOrder(JSON.parse(raw)); } catch {}
    }
  }, []);

  const itemCount = useMemo(() => order?.items?.reduce((s, it) => s + it.quantity, 0) ?? 0, [order]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <AnimatedParticles />
      <main className="relative mx-auto max-w-6xl px-6 py-14">
        <SuccessHeader order={order} />
        <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <OrderSummary order={order} itemCount={itemCount} />
          <OrderDetails order={order} />
        </motion.div>

        <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1.3, duration: 0.6 }}
          className="mt-16 flex flex-wrap items-center justify-center gap-6">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => router.push("/")}
            className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-4 font-bold text-white shadow-lg hover:shadow-xl transition-all duration-300">
            <Home className="h-5 w-5" />Continue Shopping
          </motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowInvoice(true)}
            className="flex items-center gap-3 rounded-2xl border-2 border-green-600 px-8 py-4 font-bold text-green-600 hover:bg-green-50 transition-all duration-300">
            <Download className="h-5 w-5" />View Invoice
          </motion.button>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5, duration: 0.6 }} className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm rounded-full px-6 py-3 text-sm text-gray-600 border border-gray-200">
            <IndianRupee className="h-4 w-4" />
            <span>This is a demo transaction - no real payment was processed</span>
          </div>
        </motion.div>
      </main>

      {showInvoice && order && <InvoiceModal order={order} onClose={() => setShowInvoice(false)} />}
    </div>
  );
}
