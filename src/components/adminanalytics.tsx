"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import "@/lib/chartjs";
import { Users, Stethoscope, PackageOpen, ShieldCheck, Search, PawPrint } from "lucide-react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/sidebar";

const Line = dynamic(() => import("react-chartjs-2").then((m) => m.Line), { ssr: false });
const Bar = dynamic(() => import("react-chartjs-2").then((m) => m.Bar), { ssr: false });
const Doughnut = dynamic(() => import("react-chartjs-2").then((m) => m.Doughnut), { ssr: false });
const Radar = dynamic(() => import("react-chartjs-2").then((m) => m.Radar), { ssr: false });

export type VetRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  kyc_status: "pending" | "approved" | "rejected" | string;
  created_at: string;
  approved_by: string | null;
  approved_at: string | null;
  medical_doc_url: string | null;
  avatar_path: string | null;
  avatar_url: string | null;
};

export type UserRow = {
  id: string;
  user_id: string | null;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  role: "user" | "admin" | "vet" | string;
  avatar_url: string | null;
  city: string | null;
  state: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
};

export type ProductRow = {
  id: string;
  created_at: string;
  name: string;
  description: string | null;
  old_price: number | null;
  discount_price: number | null;
  img_1: string | null;
  img_2: string | null;
  badge: string | null;
  rating: number | null;
  category: string | null;
  tags: string | null;
};

type MinimalUser = Pick<UserRow, "role" | "first_name" | "avatar_url">;
function isMinimalUser(x: unknown): x is MinimalUser {
  if (typeof x !== "object" || x === null) return false;
  const o = x as Record<string, unknown>;
  return typeof o.role === "string" && typeof o.first_name === "string" && (!("avatar_url" in o) || typeof o.avatar_url === "string" || o.avatar_url === null);
}

function formatDate(d: string | Date) {
  const dt = new Date(d);
  return dt.toLocaleString(undefined, { year: "numeric", month: "short", day: "2-digit" });
}
function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}
function lastNDaysLabels(n: number) {
  return Array.from({ length: n }).map((_, i) => {
    const d = daysAgo(n - 1 - i);
    return d.toLocaleDateString(undefined, { month: "short", day: "2-digit" });
  });
}

export default function AdminAnalyticsPage() {
  const router = useRouter();

  const [meRole, setMeRole] = useState<"admin" | "user" | "vet" | "none" | "loading">("loading");
  const [meName, setMeName] = useState<string>("");
  const [meAvatar, setMeAvatar] = useState<string | null>(null);

  const [users, setUsers] = useState<UserRow[]>([]);
  const [vets, setVets] = useState<VetRow[]>([]);
  const [products, setProducts] = useState<ProductRow[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);

        const { data: auth } = await supabase.auth.getUser();
        const authId = auth?.user?.id ?? null;
        const authEmail = auth?.user?.email ?? null;

        if (!authId) {
          setMeRole("none");
          setLoading(false);
          return;
        }

        let me: MinimalUser | null = null;

        const viaUserId = await supabase
          .from("users")
          .select("role, first_name, avatar_url")
          .eq("user_id", authId)
          .maybeSingle();

        if (isMinimalUser(viaUserId.data)) me = viaUserId.data;

        if (!me) {
          const viaId = await supabase
            .from("users")
            .select("role, first_name, avatar_url")
            .eq("id", authId)
            .maybeSingle();
          if (isMinimalUser(viaId.data)) me = viaId.data;
        }

        if (!me && authEmail) {
          const viaEmail = await supabase
            .from("users")
            .select("role, first_name, avatar_url")
            .eq("email", authEmail)
            .maybeSingle();
          if (isMinimalUser(viaEmail.data)) me = viaEmail.data;
        }

        const role: "admin" | "user" | "vet" =
          me?.role === "admin" || me?.role === "vet" || me?.role === "user" ? (me.role as "admin" | "user" | "vet") : "user";

        setMeRole(role);
        setMeName(me?.first_name ?? "");
        setMeAvatar(me?.avatar_url ?? null);

        if (role !== "admin") {
          setLoading(false);
          return;
        }

        const [usersRes, vetsRes, productsRes] = await Promise.all([
          supabase.from("users").select("*"),
          supabase.from("veterinarian").select("*"),
          supabase.from("products").select("*"),
        ]);

        if (usersRes.error) throw usersRes.error;
        if (vetsRes.error) throw vetsRes.error;
        if (productsRes.error) throw productsRes.error;

        setUsers((usersRes.data ?? []) as unknown as UserRow[]);
        setVets((vetsRes.data ?? []) as unknown as VetRow[]);
        setProducts((productsRes.data ?? []) as unknown as ProductRow[]);
      } catch (e: unknown) {
        const msg =
          typeof e === "object" && e !== null && "message" in e && typeof (e as { message?: unknown }).message === "string"
            ? (e as { message: string }).message
            : "Failed to load dashboard.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    void init();
  }, []);

  const totalUsers = users.length;
  const totalVets = vets.length;
  const totalProducts = products.length;
  const kycPending = vets.filter((v) => (v.kyc_status ?? "").toLowerCase() === "pending").length;
  const kycApproved = vets.filter((v) => (v.kyc_status ?? "").toLowerCase() === "approved").length;
  const kycRejected = vets.filter((v) => (v.kyc_status ?? "").toLowerCase() === "rejected").length;

  const rolesCount = useMemo((): Record<"user" | "vet" | "admin", number> => {
    const map: Record<"user" | "vet" | "admin", number> = { user: 0, vet: 0, admin: 0 };
    for (const u of users) {
      const r = (u.role ?? "user").toLowerCase();
      if (r === "user" || r === "vet" || r === "admin") {
        map[r] += 1;
      } else {
        map.user += 1;
      }
    }
    return map;
  }, [users]);

  const usersLast14 = useMemo(() => {
    const N = 14;
    const labels = lastNDaysLabels(N);
    const buckets = Array.from({ length: N }, () => 0);
    const cutoff = daysAgo(N - 1);
    for (const u of users) {
      const d = new Date(u.created_at);
      if (d >= cutoff) {
        const key = d.toLocaleDateString(undefined, { month: "short", day: "2-digit" });
        const idx = labels.indexOf(key);
        if (idx >= 0) buckets[idx] += 1;
      }
    }
    return { labels, data: buckets };
  }, [users]);

  const kycByMonth = useMemo(() => {
    const months: string[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(d.toLocaleDateString(undefined, { month: "short", year: "2-digit" }));
    }
    type Row = { approved: number; pending: number; rejected: number };
    const makeZeroRow = (): Row => ({ approved: 0, pending: 0, rejected: 0 });
    const rows: Record<string, Row> = Object.fromEntries(months.map((m) => [m, makeZeroRow()])) as Record<string, Row>;

    for (const v of vets) {
      const d = new Date(v.created_at);
      const label = new Date(d.getFullYear(), d.getMonth(), 1).toLocaleDateString(undefined, {
        month: "short",
        year: "2-digit",
      });
      if (label in rows) {
        const key = (v.kyc_status ?? "pending").toLowerCase();
        if (key === "approved" || key === "pending" || key === "rejected") {
          rows[label][key] += 1;
        } else {
          rows[label].pending += 1;
        }
      }
    }
    return {
      labels: months,
      approved: months.map((m) => rows[m].approved),
      pending: months.map((m) => rows[m].pending),
      rejected: months.map((m) => rows[m].rejected),
    };
  }, [vets]);

  const productsByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    for (const p of products) {
      const c = (p.category ?? "Uncategorized").trim() || "Uncategorized";
      map[c] = (map[c] ?? 0) + 1;
    }
    const entries = Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 8);
    return { labels: entries.map((e) => e[0]), data: entries.map((e) => e[1]) };
  }, [products]);

  const ratingBuckets = useMemo(() => {
    const buckets = [0, 0, 0, 0, 0];
    for (const p of products) {
      const r = Math.max(0, Math.min(4.99, p.rating ?? 0));
      const idx = Math.floor(r);
      buckets[idx] += 1;
    }
    return { labels: ["0–1", "1–2", "2–3", "3–4", "4–5"], data: buckets };
  }, [products]);

  const topDiscounts = useMemo(() => {
    type DiscountedProduct = ProductRow & { pct: number };
    const enriched: DiscountedProduct[] = products
      .map((p): DiscountedProduct => {
        const op = p.old_price ?? 0;
        const dp = p.discount_price ?? op;
        const pct = op > 0 ? Math.max(0, (op - dp) / op) : 0;
        return { ...p, pct };
      })
      .sort((a, b) => b.pct - a.pct)
      .slice(0, 6);
    return enriched;
  }, [products]);

  const cCyan = "rgb(34, 197, 194)";
  const cBlue = "rgb(59, 130, 246)";
  const cYellow = "rgb(234, 179, 8)";
  const cCyanA = "rgba(34, 197, 194, 0.2)";
  const cBlueA = "rgba(59, 130, 246, 0.2)";
  const cYellowA = "rgba(234, 179, 8, 0.25)";

  const lineUsersData = {
    labels: usersLast14.labels,
    datasets: [
      {
        label: "New Users (14d)",
        data: usersLast14.data,
        tension: 0.35,
        fill: true,
        borderColor: cCyan,
        backgroundColor: cCyanA,
      },
    ],
  };
  const doughnutRoles = {
    labels: ["User", "Vet", "Admin"],
    datasets: [
      {
        label: "Roles",
        data: [rolesCount.user ?? 0, rolesCount.vet ?? 0, rolesCount.admin ?? 0],
        backgroundColor: [cBlue, cCyan, cYellow],
        borderWidth: 2,
        borderColor: "#0a1420",
      },
    ],
  };
  const barKycMonthly = {
    labels: kycByMonth.labels,
    datasets: [
      { label: "Approved", data: kycByMonth.approved, backgroundColor: cCyan },
      { label: "Pending", data: kycByMonth.pending, backgroundColor: cYellow },
      { label: "Rejected", data: kycByMonth.rejected, backgroundColor: "rgb(250, 82, 82)" },
    ],
  };
  const barProductsByCategory = {
    labels: productsByCategory.labels,
    datasets: [{ label: "Products", data: productsByCategory.data, backgroundColor: cBlue }],
  };
  const radarRatings = {
    labels: ratingBuckets.labels,
    datasets: [
      {
        label: "Rating Distribution",
        data: ratingBuckets.data,
        backgroundColor: cBlueA,
        borderColor: cBlue,
        borderWidth: 2,
        pointBackgroundColor: cYellow,
      },
    ],
  };

  if (loading) {
    return (
      <div className="min-h-screen text-cyan-50 bg-gradient-to-br from-slate-950 via-[#071c2b] to-[#001a1a] flex">
        <div className="w-72 bg-gradient-to-b from-blue-900/60 to-cyan-800/60 backdrop-blur-xl min-h-screen" />
        <div className="flex-1 p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-10 w-64 bg-slate-800 rounded-xl" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-28 bg-slate-800/70 rounded-2xl" />
              ))}
            </div>
            <div className="h-96 bg-slate-800/70 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (meRole !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-[#071c2b] to-[#001a1a] text-cyan-50">
        <div className="p-8 bg-[var(--card-bg,#0B1220)] border border-[var(--card-border,#0A1320)] rounded-3xl shadow-xl text-center max-w-md">
          <PawPrint className="mx-auto mb-3 text-cyan-400" />
          <h2 className="text-2xl font-bold mb-2">Access Restricted</h2>
          <p className="text-cyan-200/80">You need admin privileges to view the Admin Dashboard.</p>
          <button
            onClick={() => router.push("/")}
            className="mt-6 inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-slate-900 bg-gradient-to-r from-blue-400 via-cyan-300 to-yellow-300 hover:brightness-110"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen text-cyan-50 bg-gradient-to-br from-slate-950 via-[#071c2b] to-[#001a1a]
                 [--card-bg:#0B1220] [--card-border:#0A1320] [--card-subtle:#0F1B2A]"
    >
      <section className="relative w-full h-48 sm:h-64 md:h-72 lg:h-80">
        <Image src="/images/banner5.jpg" alt="Analytics Banner" fill priority className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-cyan-900/60 to-yellow-600/30 flex flex-col justify-center items-center text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-white">Admin Analytics</h1>
          <p className="text-sm md:text-base text-cyan-100/90 mt-2">Home / Admin / Analytics</p>
        </div>
      </section>

      <div className="flex">
        <aside className="hidden lg:block w-72 shrink-0 z-10 sticky top-0">
          <Sidebar role="admin" name={meName || "Admin"} avatarUrl={meAvatar || undefined} />
        </aside>

        <div className="flex-1 min-w-0">
          <div className="sticky top-0 z-10 bg-slate-900/60 backdrop-blur border-b border-[var(--card-border)]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-3">
              <div className="relative flex-1">
                <input
                  placeholder="Search users, vets, products..."
                  className="w-full rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] text-cyan-50 placeholder-cyan-200/60 px-4 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-cyan-600/50"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-cyan-400" />
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden sm:block text-sm text-cyan-200/80">
                  Welcome back, <span className="font-semibold text-cyan-100">{meName || "Admin"}</span>
                </div>
                <div className="h-9 w-9 overflow-hidden rounded-full bg-[var(--card-subtle)] border border-[var(--card-border)] flex items-center justify-center">
                  {meAvatar ? (
                    <Image src={meAvatar} alt={meName || "Admin"} width={36} height={36} className="h-full w-full object-cover" />
                  ) : (
                    <PawPrint className="h-5 w-5 text-cyan-400" />
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
            >
              <StatCard icon={<Users />} label="Total Users" value={totalUsers} footer={`Admins ${rolesCount.admin ?? 0} • Vets ${rolesCount.vet ?? 0}`} />
              <StatCard icon={<Stethoscope />} label="Veterinarians" value={totalVets} footer={`Approved ${kycApproved} • Pending ${kycPending}`} />
              <StatCard icon={<ShieldCheck />} label="KYC Pending" value={kycPending} footer={`Approved ${kycApproved} • Rejected ${kycRejected}`} />
              <StatCard icon={<PackageOpen />} label="Products" value={totalProducts} footer={`Top categories: ${productsByCategory.labels[0] ?? "-"}`} />
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <ChartCard title="New Users (last 14 days)" subtitle="Daily sign-ups">
                <Line
                  data={lineUsersData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: true, labels: { color: "#c9fbff" } } },
                    scales: {
                      x: { ticks: { color: "#9bd5e4" }, grid: { color: "rgba(148,163,184,0.15)" } },
                      y: { beginAtZero: true, ticks: { color: "#9bd5e4", precision: 0 }, grid: { color: "rgba(148,163,184,0.15)" } },
                    },
                  }}
                />
              </ChartCard>

              <ChartCard title="User Roles" subtitle="Distribution">
                <Doughnut
                  data={doughnutRoles}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: "bottom", labels: { color: "#c9fbff" } } },
                  }}
                />
              </ChartCard>

              <ChartCard title="Products by Category" subtitle="Top categories">
                <Bar
                  data={barProductsByCategory}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    indexAxis: "y" as const,
                    scales: {
                      x: { beginAtZero: true, ticks: { color: "#9bd5e4", precision: 0 }, grid: { color: "rgba(148,163,184,0.15)" } },
                      y: { ticks: { color: "#9bd5e4" }, grid: { color: "rgba(148,163,184,0.15)" } },
                    },
                  }}
                />
              </ChartCard>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
              <ChartCard title="KYC Activity (6 months)" subtitle="Approved / Pending / Rejected">
                <Bar
                  data={barKycMonthly}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: "bottom", labels: { color: "#c9fbff" } } },
                    scales: {
                      x: { ticks: { color: "#9bd5e4" }, grid: { color: "rgba(148,163,184,0.15)" } },
                      y: { beginAtZero: true, ticks: { color: "#9bd5e4", precision: 0 }, grid: { color: "rgba(148,163,184,0.15)" } },
                    },
                  }}
                />
              </ChartCard>

              <ChartCard title="Product Ratings" subtitle="Bucketed 0–5">
                <Radar
                  data={radarRatings}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: "bottom", labels: { color: "#c9fbff" } } },
                    scales: { r: { angleLines: { color: "rgba(148,163,184,0.15)" }, grid: { color: "rgba(148,163,184,0.15)" }, pointLabels: { color: "#9bd5e4" }, ticks: { display: false } } },
                  }}
                />
              </ChartCard>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-[var(--card-bg)] rounded-3xl shadow-sm border border-[var(--card-border)] p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-cyan-50">Recent Sign-ups</h3>
                    <p className="text-xs text-cyan-300/80">Latest 8 users</p>
                  </div>
                </div>
                <div className="divide-y divide-[var(--card-border)]">
                  {users
                    .slice()
                    .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at))
                    .slice(0, 8)
                    .map((u) => (
                      <div key={u.id} className="py-3 flex items-center gap-3">
                        <div className="h-9 w-9 overflow-hidden rounded-full bg-[var(--card-subtle)] border border-[var(--card-border)] flex items-center justify-center">
                          {u.avatar_url ? (
                            <Image src={u.avatar_url} alt={u.first_name} width={36} height={36} className="h-full w-full object-cover" />
                          ) : (
                            <Users className="h-4 w-4 text-cyan-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-cyan-50">
                            {u.first_name} {u.last_name}
                          </div>
                          <div className="text-xs text-cyan-300/80">{u.email}</div>
                        </div>
                        <div className="text-xs text-cyan-200/80">
                          {u.city ?? "—"}, {u.state ?? "—"}
                        </div>
                        <div className="text-xs text-cyan-300/70">{formatDate(u.created_at)}</div>
                      </div>
                    ))}
                </div>
              </div>

              <div className="bg-[var(--card-bg)] rounded-3xl shadow-sm border border-[var(--card-border)] p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-cyan-50">KYC Pending Vets</h3>
                    <p className="text-xs text-cyan-300/80">Newest 8 pending applications</p>
                  </div>
                </div>
                <div className="divide-y divide-[var(--card-border)]">
                  {vets
                    .filter((v) => (v.kyc_status ?? "").toLowerCase() === "pending")
                    .slice()
                    .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at))
                    .slice(0, 8)
                    .map((v) => (
                      <div key={v.id} className="py-3 flex items-center gap-3">
                        <div className="h-9 w-9 overflow-hidden rounded-full bg-[var(--card-subtle)] border border-[var(--card-border)] flex items-center justify-center">
                          {v.avatar_url ? (
                            <Image src={v.avatar_url} alt={v.name} width={36} height={36} className="h-full w-full object-cover" />
                          ) : (
                            <Stethoscope className="h-4 w-4 text-cyan-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-cyan-50">{v.name}</div>
                          <div className="text-xs text-cyan-300/80">{v.email}</div>
                        </div>
                        <span className="text-[10px] uppercase tracking-wide rounded-full bg-yellow-300/10 text-yellow-300 px-2 py-1 border border-yellow-300/30">
                          Pending
                        </span>
                        <a
                          href={v.medical_doc_url ?? "#"}
                          target="_blank"
                          className="text-xs text-cyan-300 hover:text-cyan-200 underline-offset-2 hover:underline"
                        >
                          Doc
                        </a>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            <div className="mt-6 bg-[var(--card-bg)] rounded-3xl shadow-sm border border-[var(--card-border)] p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-bold text-cyan-50">Top Discounts</h3>
                  <p className="text-xs text-cyan-300/80">Best offers by % off</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {topDiscounts.map((p) => (
                  <div key={p.id} className="rounded-2xl border border-[var(--card-border)] overflow-hidden bg-[var(--card-subtle)]">
                    <div className="h-36 w-full bg-slate-900/40">
                      {p.img_1 ? (
                        <Image src={p.img_1} alt={p.name} width={640} height={240} className="h-36 w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-cyan-700/60">
                          <PackageOpen className="h-12 w-12" />
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <div className="font-semibold truncate text-cyan-50">{p.name}</div>
                      <div className="text-xs text-cyan-300/80">{p.category ?? "Uncategorized"}</div>
                      <div className="mt-1 flex items-center gap-2">
                        {p.old_price ? <span className="text-xs line-through opacity-60 text-cyan-200/80">₹{Number(p.old_price).toFixed(0)}</span> : null}
                        <span className="font-bold text-cyan-100">₹{Number(p.discount_price ?? p.old_price ?? 0).toFixed(0)}</span>
                        <span className="text-[10px] rounded-full bg-cyan-400/10 text-cyan-300 px-2 py-0.5 border border-cyan-400/30">
                          {Math.round(p.pct * 100)}% OFF
                        </span>
                      </div>
                      {typeof p.rating === "number" ? (
                        <div className="mt-1 text-xs text-cyan-200/80">Rating: {p.rating.toFixed(1)}</div>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="py-8 text-center text-xs text-cyan-300/70">
              © {new Date().getFullYear()} Poshik Pet Care — Admin Dashboard
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, footer }: { icon: React.ReactNode; label: string; value: number | string; footer?: string }) {
  return (
    <div className="rounded-3xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-sm p-4">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-blue-600 via-cyan-500 to-yellow-400 text-slate-900 flex items-center justify-center">
          <div className="text-white">{icon}</div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wide text-cyan-300/80">{label}</div>
          <div className="text-2xl font-extrabold text-cyan-50">{value}</div>
        </div>
      </div>
      {footer ? <div className="mt-2 text-xs text-cyan-300/80">{footer}</div> : null}
    </div>
  );
}

function ChartCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="bg-[var(--card-bg)] rounded-3xl shadow-sm border border-[var(--card-border)] p-4">
      <div className="mb-2">
        <h3 className="font-bold text-cyan-50">{title}</h3>
        {subtitle ? <p className="text-xs text-cyan-300/80">{subtitle}</p> : null}
      </div>
      <div className="h-72">{children}</div>
    </div>
  );
}
