﻿'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Eye, EyeOff } from 'lucide-react';

type Mode = 'signup' | 'signin';
type Role = 'user' | 'vet';

type UserSignup = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  password: string;
  location_city: string;
  location_state: string;
  location_country: string;
};


async function geocodeCityState(
  city: string,
  state: string,
  country?: string
): Promise<{ lat: number; lng: number } | null> {
  const q = `${city}, ${state}${country ? `, ${country}` : ''}`;
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`;
  try {
    const res = await fetch(url, { cache: 'no-store' });
    const arr = await res.json();
    if (Array.isArray(arr) && arr.length) {
      return { lat: parseFloat(arr[0].lat), lng: parseFloat(arr[0].lon) };
    }
    return null;
  } catch {
    return null;
  }
}

export default function PoshikAuth() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('signup');
  const [role, setRole] = useState<Role>('user');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string>('');
  const fileRef = useRef<HTMLInputElement>(null) as React.RefObject<HTMLInputElement>;

  

  async function onLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg('');
    setBusy(true);

    const fd = new FormData(e.currentTarget);
    const email = String(fd.get('email') || '');
    const password = String(fd.get('password') || '');

    const { error, data } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) return setMsg(error.message);

    const user = data.user;
    const userRole = (user?.user_metadata as any)?.role;
    if (userRole === 'vet') {
      const { data: vet } = await supabase
        .from('veterinarian')
        .select('kyc_status')
        .eq('id', user!.id)
        .single();
      if (vet?.kyc_status === 'approved') router.replace('/dashboard');
      else router.replace('/kyc-pending');
    } else {
      router.replace('/dashboard');
    }
  }

  async function onSignupUser(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg('');
    setBusy(true);

    const fd = new FormData(e.currentTarget);
    const payload: UserSignup = {
      first_name: String(fd.get('first_name') || ''),
      last_name: String(fd.get('last_name') || ''),
      email: String(fd.get('email') || ''),
      phone: String(fd.get('phone') || ''), // optional in UI; fine if empty
      password: String(fd.get('password') || ''),
      location_city: String(fd.get('location_city') || ''),
      location_state: String(fd.get('location_state') || ''),
      location_country: String(fd.get('location_country') || ''),
    };

    const { data: sign, error: signErr } = await supabase.auth.signUp({
      email: payload.email,
      password: payload.password,
      options: { data: { role: 'user', first_name: payload.first_name, last_name: payload.last_name } },
    });
    if (signErr) { setBusy(false); return setMsg(signErr.message); }

    const geo = await geocodeCityState(
      payload.location_city,
      payload.location_state,
      payload.location_country || 'India'
    );
    if (!geo) { setBusy(false); return setMsg('Could not locate that city/state. Please check the spelling.'); }

    const uid = sign.user?.id;
    if (uid) {
      const { error: upErr } = await supabase
        .from('users')
        .upsert(
          {
            id: uid,
            first_name: payload.first_name,
            last_name: payload.last_name,
            email: payload.email,
            phone: payload.phone || null,
            city: payload.location_city,
            state: payload.location_state,
            latitude: geo.lat,
            longitude: geo.lng,
            role: 'user',
          },
          { onConflict: 'id' }
        );

      if (upErr) { setBusy(false); return setMsg(upErr.message); }
    }

    setBusy(false);
    setMsg('User account created! Please confirm your email.');
    setMode('signin');
  }

  async function onSignupVet(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setMsg('');

    const fd = new FormData(e.currentTarget);
    const name = String(fd.get('name') || '');
    const email = String(fd.get('email') || '');
    const phone = String(fd.get('phone') || '');
    const password = String(fd.get('password') || '');
    const file = (fd.get('medical_pdf') as File) ?? null;

    const { data: sign, error: signErr } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { role: 'vet', display_name: name } },
    });
    if (signErr) { setBusy(false); return setMsg(signErr.message); }

    const uid = sign.user?.id;
    if (!uid) { setBusy(false); return setMsg('Signup succeeded but no UID found.'); }



    const { error: dbErr } = await supabase.from('veterinarian').insert([{
      id: uid,
      name,
      email,
      phone,
      medical_doc_url: file && file.size > 0 ? file.name : null, // or use medicalPath if you enable upload above
      kyc_status: 'pending',
    }]);
    if (dbErr) { setBusy(false); return setMsg(`Vet insert failed: ${dbErr.message}`); }

    setBusy(false);
    setMsg('Vet account created! Please confirm your email. KYC is pending.');
    setMode('signin');
  }

  const isSignup = mode === 'signup';

  return (
    <main className="min-h-[100dvh] w-full bg-gradient-to-b from-blue-950 via-cyan-900 to-cyan-950 pb-10">
      
      <div className="relative w-full h-48 sm:h-64 md:h-72 lg:h-80 mb-8">
        <Image
          src="/images/banner4.jpg"
          alt="Auth Banner"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/40 flex flex-col justify-center items-center text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">
            {isSignup ? 'Register' : 'Login'}
          </h1>
          <p className="text-sm sm:text-base text-gray-200 mt-2">
            Home / {isSignup ? 'Register' : 'Login'}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-[1100px] mb-10 px-4 my-20">
        <div className="rounded-[24px] bg-gradient-to-tl from-cyan-500 via-cyan-700 to-cyan-600 backdrop-blur-xl shadow-lg p-4 sm:p-6 md:p-8 shadow-xl">
          
          <div className="mb-6 flex justify-center">
            <div className="relative inline-flex rounded-full bg-white/20 p-1">
              <button
                onClick={() => setMode('signup')}
                className={`relative z-10 rounded-full px-5 py-2 text-sm font-semibold text-gray-600 ${isSignup ? '' : 'opacity-80'}`}
              >
                Register
              </button>
              <button
                onClick={() => setMode('signin')}
                className={`relative z-10 rounded-full px-5 py-2 text-sm font-semibold text-gray-600 ${!isSignup ? '' : 'opacity-80'}`}
              >
                Signin
              </button>
              <motion.span
                layout
                className="absolute inset-y-1 w-1/2 rounded-full bg-white"
                initial={false}
                animate={{ x: isSignup ? 0 : '100%' }}
                transition={{ type: 'spring', stiffness: 420, damping: 32 }}
              />
            </div>
          </div>

          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="order-1">
              <AnimatePresence mode="wait">
                {isSignup ? (
                  <motion.div
                    key="signup-form"
                    initial={{ x: -40, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -20, opacity: 0 }}
                    transition={{ duration: 0.35, ease: 'easeIn' }}
                  >
                    <RegisterCard
                      role={role}
                      setRole={setRole}
                      busy={busy}
                      onSubmitUser={onSignupUser}
                      onSubmitVet={onSignupVet}
                      fileRef={fileRef}
                      onSwap={() => setMode('signin')}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="signin-video"
                    className="h-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <VideoCard mode="signin" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="order-2">
              <AnimatePresence mode="wait">
                {isSignup ? (
                  <motion.div
                    key="signup-video"
                    className="h-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <VideoCard mode="signup" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="signin-form"
                    initial={{ x: 40, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 20, opacity: 0 }}
                    transition={{ duration: 0.35, ease: 'easeIn' }}
                  >
                    <LoginCard busy={busy} onSubmit={onLogin} onSwap={() => setMode('signup')} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {msg && (
            <p className="mt-6 rounded-xl bg-white/90 px-4 py-3 text-sm font-medium text-[#7a2f00] text-center">
              {msg}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}



function VideoCard({ mode }: { mode: 'signup' | 'signin' }) {
  return (
    <div className="relative mx-auto max-w-[500px] overflow-hidden rounded-[10px] shadow-lg">
      <div className="relative aspect-[4/5] w-full">
        <img
          key={mode}
          src={mode === 'signup' ? '/images/sign1.jpg' : '/images/sign2.jpg'}
          className="h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
        />
      </div>
    </div>
  );
}

function LoginCard({
  busy,
  onSubmit,
  onSwap,
}: {
  busy: boolean;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  onSwap: () => void;
}) {
  return (
    <div className="mx-auto w-full max-w-[520px] text-white">
      <h2 className="mb-2 text-center text-[40px] font-extrabold leading-none drop-shadow-sm">Login</h2>
      <p className="mb-6 text-center text-[14px] opacity-90">Welcome back</p>
      <form onSubmit={onSubmit} className="space-y-4">
        <Input name="email" type="email" placeholder="Email Id *" />
        <Input name="password" type="password" placeholder="Password *" />
        <button
          disabled={busy}
          className="w-full rounded-full bg-[#0e2a36] py-4 text-[16px] font-semibold text-white shadow-md hover:opacity-95 disabled:opacity-60"
        >
          {busy ? 'Signing inâ€¦' : 'Login'}
        </button>
      </form>
      <p className="mt-4 text-center text-sm">
        New here?{' '}
        <button type="button" onClick={onSwap} className="underline decoration-white/60 underline-offset-2 hover:opacity-90">
          Create account
        </button>
      </p>
    </div>
  );
}

function RegisterCard({
  role,
  setRole,
  busy,
  onSubmitUser,
  onSubmitVet,
  fileRef,
  onSwap,
}: {
  role: Role;
  setRole: (r: Role) => void;
  busy: boolean;
  onSubmitUser: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  onSubmitVet: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  fileRef: React.RefObject<HTMLInputElement>;
  onSwap: () => void;
}) {
  return (
    <div className="mx-auto w-full max-w-[520px] text-white">
      <h2 className="mb-2 text-center text-[40px] font-extrabold leading-none drop-shadow-sm">Signup</h2>
      <p className="mb-6 text-center text-[14px] opacity-90">Create account to start your exciting journey with Poshik</p>

      
      <div className="mb-5 flex justify-center">
        <div className="relative inline-flex rounded-full bg-white/55 p-1">
          <button
            onClick={() => setRole('user')}
            className={`z-10 rounded-full px-4 py-2 text-sm font-semibold ${role === 'user' ? 'text-blue-900' : 'text-white'}`}
          >
            Pet Owner
          </button>
          <button
            onClick={() => setRole('vet')}
            className={`z-12 rounded-full px-3 py-2 text-sm font-semibold ${role === 'vet' ? 'text-blue-900' : 'text-white'}`}
          >
            Veterinarian
          </button>
          <motion.span
            layout
            className="absolute inset-y-1 w-1/2 rounded-full bg-white"
            initial={false}
            animate={{ x: role === 'user' ? 0 : '90%' }}
            transition={{ type: 'spring', stiffness: 420, damping: 20 }}
          />
        </div>
      </div>

      {role === 'user' ? (
        <form onSubmit={onSubmitUser} className="space-y-4">
          <Input name="first_name"  placeholder="First Name *" />
          <Input name="last_name" placeholder="Last Name *" />
          <Input name="email" type="email" placeholder="Email Id *" />
          
          <Input name="location_city" placeholder="City *" />
          <Input name="location_state" placeholder="State *" />
          <Input name="password" type="password" placeholder="Password *" />
          <button
            disabled={busy}
            className="w-full rounded-full bg-[#0e2a36] py-4 text-[16px] font-semibold text-white shadow-md hover:opacity-95 disabled:opacity-60"
          >
            {busy ? 'Creatingâ€¦' : 'Register'}
          </button>
          <p className="text-center text-sm">
            Already have an account?{' '}
            <button type="button" onClick={onSwap} className="underline decoration-white/60 underline-offset-2 hover:opacity-90">
              Login
            </button>
          </p>
        </form>
      ) : (
        <form onSubmit={onSubmitVet} className="space-y-4">
          <Input name="name" placeholder="Full Name *" />
          <Input name="email" type="email" placeholder="Email Id *" />
          <Input name="phone" placeholder="Phone Number *" />
          <Input name="password" type="password" placeholder="Password *" />
          <div>
            <label className="mb-1 block text-sm font-medium text-white/90">Medical Document (PDF)*</label>
            <input
              ref={fileRef}
              name="medical_pdf"
              type="file"
              accept="application/pdf"
              className="w-full rounded-full border-0 bg-white/95 px-4 py-4 text-[14px] text-gray-600 shadow"
            />
          </div>
          <button
            disabled={busy}
            className="w-full rounded-full bg-[#0e2a36] py-4 text-[16px] font-semibold text-white shadow-md hover:opacity-95 disabled:opacity-60"
          >
            {busy ? 'Creatingâ€¦' : 'Register as Vet'}
          </button>
          <p className="text-center text-sm">
            Already have an account?{' '}
            <button type="button" onClick={onSwap} className="underline decoration-white/60 underline-offset-2 hover:opacity-90">
              Login
            </button>
          </p>
        </form>
      )}
    </div>
  );
}

function Input({
  name,
  placeholder,
  type = 'text',
}: {
  name: string;
  placeholder: string;
  type?: string;
}) {
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';

  return (
    <div className="relative">
      <input
        name={name}
        type={isPassword && show ? 'text' : type}
        placeholder={placeholder}
        className="w-full rounded-full border-0 bg-white px-5 py-4 text-[14px] text-[#1b2b34] placeholder-[#9aa6ad]"
        required
      />
      {isPassword && (
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          <span className="sr-only">{show ? 'Hide password' : 'Show password'}</span>
          {show ? <EyeOff className="h-6 w-6" /> : <Eye className="h-6 w-6" />}
        </button>
      )}
    </div>
  );
}

