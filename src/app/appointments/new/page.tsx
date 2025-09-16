'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import { Suspense } from 'react';
import SpinnerLoader from "@/components/SpinnerLoader";

type VetRow = {
  id: string;
  name: string;
  email: string;
  avatar_url?: string | null;
};

export default function BookAppointmentPage() {
  const [vets, setVets] = useState<VetRow[]>([]);
  const [meId, setMeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [appointmentTime, setAppointmentTime] = useState<string>('');

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setMeId(user.id);

      const { data, error } = await supabase
        .from('veterinarian')
        .select('id, name, email, avatar_url')
        .eq('kyc_status', 'approved');

      if (!error && data) setVets(data);
    })();
  }, []);

  async function book(vetId: string) {
    if (!meId) { setMsg('âš ï¸ You must be logged in.'); return; }
    if (!appointmentTime) { setMsg('âš ï¸ Please select an appointment time.'); return; }

    setLoading(true);
    setMsg('');

    const { error } = await supabase
      .from('appointments')
      .insert({
        user_id: meId,
        vet_id: vetId,
        appointment_time: new Date(appointmentTime).toISOString(),
      });

    if (error) {
      console.error('Booking error:', error.message, error.details);
      setMsg('âŒ Booking failed: ' + error.message);
    } else {
      setMsg('âœ… Appointment booked successfully!');
      setAppointmentTime('');
    }

    setLoading(false);
  }

  return (
      <Suspense fallback={<SpinnerLoader text="Loadingâ€¦" />}>

    <main className="bg-[#0f172a] min-h-screen text-gray-100">
      <div className="relative w-full h-56 sm:h-72 md:h-80 mb-10">
        <Image
          src="/images/statbg13.jpg"
          alt="Book Appointment Banner"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-700/50 via-cyan-800/50 to-transparent backdrop-blur-sm flex flex-col justify-center items-center text-center">
          <h1 className="text-3xl md:text-5xl font-extrabold text-white drop-shadow-lg">
            Book Appointment
          </h1>
          <p className="text-sm md:text-lg text-gray-200 mt-2">
            Choose a veterinarian and schedule your visit with Pet Verse
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 pb-20">
        {msg && (
          <p className="mb-6 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-700 px-4 py-3 text-sm font-medium text-white shadow-lg">
            {msg}
          </p>
        )}

        
        <div className="mb-8">
          <label className="block mb-3 font-semibold text-cyan-400">
            Select Appointment Date & Time
          </label>
          <input
            type="datetime-local"
            value={appointmentTime}
            onChange={(e) => setAppointmentTime(e.target.value)}
            className="w-full rounded-lg border border-cyan-500/40 bg-[#1e293b]/60 px-3 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-400 shadow-inner"
          />
        </div>

        <div className="grid gap-6">
          {vets.map(v => (
            <div
              key={v.id}
              className="flex items-center justify-between rounded-2xl bg-[#1e293b]/70 backdrop-blur-md border border-cyan-500/30 p-5 shadow-lg hover:shadow-cyan-500/20 transition"
            >
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 overflow-hidden rounded-full border-2 border-cyan-500/50 shadow-md">
                  <Image
                    src={v.avatar_url || '/images/avatar-placeholder.png'}
                    alt={v.name}
                    width={56}
                    height={56}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-semibold text-white">{v.name}</p>
                  <p className="text-xs text-gray-400">{v.email}</p>
                </div>
              </div>
              <button
                onClick={() => book(v.id)}
                disabled={loading}
                className="rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 px-5 py-2 text-sm font-semibold text-white shadow-md hover:from-cyan-400 hover:to-teal-400 hover:shadow-cyan-500/40 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Bookingâ€¦' : 'Book'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
      </Suspense>

  );
}

