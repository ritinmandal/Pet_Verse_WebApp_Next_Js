'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarDays, Mail, PawPrint, Clock, User as UserIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';


const PV = {
  from: 'from-[#0b2a66]', // deep navy-blue
  via: 'via-[#0e4aa3]',   // vivid blue
  to:   'to-[#1ec9e2]',   // cyan
  ring: 'ring-white/10',
  card: 'bg-white/70 dark:bg-white/5',
  border: 'border-white/20',
  softText: 'text-white/80',
  hardText: 'text-white',
  ink: 'text-slate-800 dark:text-slate-100',
  subInk: 'text-slate-600 dark:text-slate-300',
};


type Vet = {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
};

type Appointment = {
  id: string;
  user_id: string;
  vet_id: string;
  appointment_time: string; // ISO
  status: 'pending' | 'accepted' | 'rejected';
  notes: string | null;
  created_at: string;
  updated_at: string;
  vet?: Vet | null;
};

export default function AppointmentsPage() {
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [items, setItems] = useState<Appointment[]>([]);
  const [error, setError] = useState<string | null>(null);

  
  const fmtDate = useCallback((iso: string) => {
    try {
      return new Intl.DateTimeFormat('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'Asia/Kolkata',
      }).format(new Date(iso));
    } catch {
      return iso;
    }
  }, []);

  const statusStyles = useCallback((status: Appointment['status']) => {
    const base =
      'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ring-1';
    if (status === 'accepted')
      return `${base} bg-emerald-500/10 ring-emerald-400/30 text-emerald-300`;
    if (status === 'rejected')
      return `${base} bg-rose-500/10 ring-rose-400/30 text-rose-300`;
    return `${base} bg-cyan-500/10 ring-cyan-400/30 text-cyan-300`;
  }, []);

  const fetchAppointments = useCallback(
    async (uid: string) => {
      setError(null);
      const { data, error } = await supabase
        .from('appointments')
        .select(
          `
          id,
          user_id,
          vet_id,
          appointment_time,
          status,
          notes,
          created_at,
          updated_at,
          vet:veterinarian (
            id,
            name,
            email,
            phone,
            avatar_url
          )
        `
        )
        .eq('user_id', uid)
        .order('appointment_time', { ascending: false });

      if (error) {
        setError(error.message);
        return;
      }
      setItems((data as unknown as Appointment[]) ?? []);
    },
    []
  );

  
  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoading(true);
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth.user?.id ?? null;
      if (!mounted) return;

      setUserId(uid);
      if (!uid) {
        setLoading(false);
        return;
      }
      await fetchAppointments(uid);
      setLoading(false);

      const channel = supabase
        .channel(`appointments-user-${uid}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'appointments',
            filter: `user_id=eq.${uid}`,
          },
          async () => {
            await fetchAppointments(uid);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    })();

    return () => {
      mounted = false;
    };
  }, [fetchAppointments]);

  const { upcoming, past } = useMemo(() => {
    const now = Date.now();
    const up: Appointment[] = [];
    const pa: Appointment[] = [];
    for (const a of items) {
      const t = new Date(a.appointment_time).getTime();
      if (t >= now) up.push(a);
      else pa.push(a);
    }
    return { upcoming: up, past: pa };
  }, [items]);

  
  return (
    <div
      className={`min-h-[100dvh] bg-gradient-to-b from-blue-800 to-cyan-100 selection:text-white`}
    >
      
      <header className="relative mx-auto max-w-5xl px-4 pt-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`overflow-hidden mt-20 rounded-2xl ${PV.card} backdrop-blur-xxl bg-gradient-to-r from-blue-600 to-cyan-600 ring-1 ${PV.ring}`}
        >
          <div className="relative isolate p-6 sm:p-8">
            
            <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-cyan-300/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-blue-300/20 blur-3xl" />

            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-tr from-cyan-400/60 to-blue-500/60 ring-1 ring-white/20">
                <PawPrint className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-semibold ${PV.hardText}`}>My Appointments</h1>
                <p className={`text-sm ${PV.softText}`}>
                  Track your vet visits, status, and notes â€” the PetVerse way.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </header>

      
      <main className="mx-auto max-w-5xl px-4 py-8">
        {error && (
          <div className="mb-4 rounded-xl border border-rose-300/50 bg-rose-500/10 p-3 text-rose-100">
            {error}
          </div>
        )}

        {!userId ? (
          <EmptyState
            title="Youâ€™re not signed in"
            subtitle="Sign in to view your appointments."
            icon={<UserIcon className="h-6 w-6" />}
          />
        ) : loading ? (
          <SkeletonList />
        ) : (
          <>
            
            <Section
            
              title="Upcoming"
              subtitle="Your scheduled sessions that are yet to happen."
            >
              {upcoming.length === 0 ? (
                <EmptyState
                  title="No upcoming appointments"
                  subtitle="When you book one, itâ€™ll appear here."
                  icon={<CalendarDays className="h-6 w-6" />}
                />
              ) : (
                <AnimatedList>
                  {upcoming.map((a) => (
                    <AppointmentCard
                      key={a.id}
                      appt={a}
                      fmtDate={fmtDate}
                      statusStyles={statusStyles}
                    />
                  ))}
                </AnimatedList>
              )}
            </Section>

            
            <Section title="Past" subtitle="Completed or older sessions.">
              {past.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/80">
                  Nothing in the past yet.
                </div>
              ) : (
                <AnimatedList>
                  {past.map((a) => (
                    <AppointmentCard
                      key={a.id}
                      appt={a}
                      fmtDate={fmtDate}
                      statusStyles={statusStyles}
                      dim
                    />
                  ))}
                </AnimatedList>
              )}
            </Section>
          </>
        )}
      </main>
    </div>
  );
}



function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-8">
      <div className="mb-3 flex items-end justify-between">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        {subtitle ? <p className="text-xs text-white/70">{subtitle}</p> : null}
      </div>
      {children}
    </section>
  );
}

function AnimatedList({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <AnimatePresence initial={false}>
        {Array.isArray(children) ? children : <>{children}</>}
      </AnimatePresence>
    </div>
  );
}

function AppointmentCard({
  appt,
  fmtDate,
  statusStyles,
  dim = false,
}: {
  appt: Appointment;
  fmtDate: (iso: string) => string;
  statusStyles: (s: Appointment['status']) => string;
  dim?: boolean;
}) {
  const vet = appt.vet;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className={`overflow-hidden rounded-2xl  ${PV.border} ${PV.card} backdrop-blur-xl ring-1 ${PV.ring} ${dim ? 'opacity-90' : ''}`}
    >
      <div className="relative isolate p-4 bg-gradient-to-tr from-blue-600 to-cyan-500 sm:p-5">
        
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-cyan-400/50 via-white/40 to-blue-400/50" />

        <div className="flex items-center gap-4">
          
          <div className="h-12 w-12 shrink-0  overflow-hidden rounded-full ring-1 ring-white/20">
            {vet?.avatar_url ? (
              <Image
                src={vet.avatar_url}
                alt={vet?.name ?? 'Veterinarian'}
                width={48}
                height={48}
                className="h-12 w-12 object-cover"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center bg-gradient-to-br from-blue-500/30 to-cyan-400/30 text-white">
                <span className="text-sm font-semibold">{initials(vet?.name)}</span>
              </div>
            )}
          </div>

          
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <div className="truncate font-medium text-white">
                {vet?.name ?? 'Veterinarian'}
              </div>
              <span className={statusStyles(appt.status)}>{appt.status}</span>
            </div>

            <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-white/80">
              <span className="inline-flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {fmtDate(appt.appointment_time)}
              </span>
              {vet?.email ? (
                <a
                  href={`mailto:${vet.email}`}
                  className="group inline-flex items-center gap-1 rounded-lg border border-white/10 px-2 py-1 text-xs text-white/80 transition hover:bg-white/10"
                >
                  <Mail className="h-4 w-4" />
                  Email vet
                </a>
              ) : null}
            </div>

            {appt.notes ? (
              <p className="mt-2 line-clamp-2 text-sm text-white/90">{appt.notes}</p>
            ) : null}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function SkeletonList() {
  return (
    <div className="space-y-3">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="h-24 w-full animate-pulse rounded-2xl border border-white/15 bg-white/10 backdrop-blur-xl"
        />
      ))}
    </div>
  );
}

function EmptyState({
  title,
  subtitle,
  icon,
}: {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div
      className={`mt-6 grid place-items-center rounded-2xl border ${PV.border} ${PV.card} p-8 text-center backdrop-blur-xl ring-1 ${PV.ring}`}
    >
      <div className="mb-3 grid h-12 w-12 place-items-center rounded-full bg-gradient-to-tr from-cyan-400/40 to-blue-500/40 text-white">
        {icon ?? <CalendarDays className="h-6 w-6" />}
      </div>
      <h3 className="text-base font-semibold text-white">{title}</h3>
      {subtitle ? <p className="mt-1 text-sm text-white/80">{subtitle}</p> : null}
    </div>
  );
}

function initials(name?: string | null) {
  if (!name) return 'V';
  const parts = name.trim().split(/\s+/);
  return (
    (parts[0]?.[0] ?? 'V').toUpperCase() + (parts[1]?.[0] ?? '').toUpperCase()
  );
}

