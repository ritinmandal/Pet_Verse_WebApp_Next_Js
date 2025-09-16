'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { Plus, Loader2 } from 'lucide-react';

type Species = 'Dog' | 'Cat' | 'Bird' | 'Rabbit' | 'Fish' | 'Reptile' | 'Other';

type PetDraft = {
  name: string;
  species: Species;
  breed: string;
  dob: string;       
  weight: string;     
  notes: string;
  file: File | null;
  preview: string | null;
};

const EMPTY: PetDraft = {
  name: '',
  species: 'Dog',
  breed: '',
  dob: '',
  weight: '',
  notes: '',
  file: null,
  preview: null,
};

const inputBase =
  'w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 placeholder-slate-400 focus:ring-4 focus:ring-cyan-400/40 focus:outline-none';

export default function NewMultiplePetsPage() {
  const router = useRouter();
  const [meId, setMeId] = useState<string | null>(null);
  const [rows, setRows] = useState<PetDraft[]>([{ ...EMPTY }]);
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number }>({ done: 0, total: 0 });

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.replace('/signup');
      setMeId(user.id);
    })();
  }, [router]);

  function addRow() {
    setRows((r) => [...r, { ...EMPTY }]);
  }
  function removeRow(i: number) {
    setRows((r) => (r.length === 1 ? r : r.filter((_, idx) => idx !== i)));
  }
  function update(i: number, patch: Partial<PetDraft>) {
    setRows((r) => r.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));
  }
  function onPick(i: number, file: File | null) {
    update(i, { file, preview: file ? URL.createObjectURL(file) : null });
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!meId) return;

    for (const [i, r] of rows.entries()) {
      if (!r.name.trim()) return alert(`Row ${i + 1}: name is required`);
      if (r.weight && isNaN(Number(r.weight))) return alert(`Row ${i + 1}: weight must be a number`);
    }

    try {
      setSaving(true);
      setProgress({ done: 0, total: rows.length });

      const uploadedUrls: (string | null)[] = [];
      for (let i = 0; i < rows.length; i++) {
        const r = rows[i];
        if (!r.file) {
          uploadedUrls.push(null);
          continue;
        }
        const ext = r.file.name.split('.').pop() || 'jpg';
        const key = `${meId}/${Date.now()}-${slugify(r.name)}-${i}.${ext}`;
        const { error: upErr } = await supabase
          .storage.from('pet-photos')
          .upload(key, r.file, { upsert: true, contentType: r.file.type });
        if (upErr) throw upErr;
        const { data } = supabase.storage.from('pet-photos').getPublicUrl(key);
        uploadedUrls.push(data.publicUrl);
        setProgress((p) => ({ ...p, done: p.done + 1 }));
      }

      const payload = rows.map((r, i) => ({
        name: r.name.trim(),
        species: r.species,
        breed: r.breed.trim() || null,
        dob: r.dob || null,
        weight_kg: r.weight ? Number(r.weight) : null,
        notes: r.notes.trim() || null,
        avatar_url: uploadedUrls[i],
      }));

      const { data, error } = await supabase.from('pets').insert(payload).select('id');
      if (error) throw error;

      if (data && data.length > 0) router.replace(`/pets/${data[0].id}`);
      else router.replace('/pets');
    } catch (err: any) {
      console.error(err);
      alert(err?.message ?? 'Failed to save pets.');
    } finally {
      setSaving(false);
    }
  }

  const progressPct =
    progress.total > 0 ? Math.min(100, Math.round((progress.done / progress.total) * 100)) : 0;

  return (
    <main className="min-h-screen bg-[radial-gradient(1200px_600px_at_0%_0%,rgba(6,182,212,0.10),transparent),radial-gradient(1000px_500px_at_100%_0%,rgba(37,99,235,0.10),transparent)] bg-slate-950">
      <div className="relative w-full h-48 sm:h-64 md:h-72 lg:h-80">
        <Image
          src="/images/statbg4.jpg"
          alt="Banner"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-transparent to-blue-600/20" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(2,6,23,0)_0%,rgba(2,6,23,0.55)_65%,rgba(2,6,23,0.85)_100%)]" />

        <div className="absolute inset-0 grid place-items-center px-4">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1">
              <span className="inline-block h-2 w-2 rounded-full bg-cyan-400" />
              <span className="text-xs font-semibold tracking-widest text-cyan-300">ADD PETS</span>
            </div>
            <h1 className="mt-3 text-3xl md:text-5xl font-extrabold text-white">Add Pets</h1>
            <p className="text-sm md:text-base text-slate-300 mt-2">Home / Pets / Add Pets</p>
          </div>
        </div>
      </div>

      
      <div className="mx-auto max-w-[1000px] px-4 py-12">
        <section className="rounded-[26px] border border-slate-700 bg-slate-900 shadow-md overflow-hidden">
          
          <div className="rounded-t-[26px] bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-5 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Add Your Pets</h2>
                <p className="text-white/90 text-sm">Quickly create profiles for all your pets.</p>
              </div>
              <span className="hidden sm:inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-100">
                <Plus className="h-4 w-4" /> {rows.length} row{rows.length > 1 ? 's' : ''}
              </span>
            </div>

            
            {saving && (
              <div className="mt-4 h-2 w-full rounded-full bg-white/20">
                <div
                  className="h-2 rounded-full bg-white"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            )}
          </div>

          <motion.form
            onSubmit={handleSave}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-6 p-6 sm:p-8 md:p-10"
          >
            {rows.map((r, i) => (
              <PetRowCard
                key={i}
                index={i}
                row={r}
                onChange={update}
                onRemove={() => removeRow(i)}
                onPick={(f) => onPick(i, f)}
              />
            ))}

            
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={addRow}
                className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-5 py-2 text-sm font-semibold text-cyan-100 hover:bg-cyan-500/15"
              >
                + Add another pet
              </button>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-2 text-sm font-semibold text-white shadow hover:from-cyan-700 hover:to-blue-700 disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Savingâ€¦
                  </>
                ) : (
                  <>Save {rows.length} pet{rows.length > 1 ? 's' : ''}</>
                )}
              </button>

              {saving && (
                <span className="text-sm text-slate-300">
                  Uploading {progress.done}/{progress.total}
                </span>
              )}
            </div>

            
            <p className="text-xs text-slate-400">
              Tip: Photos are optional. You can add or change them later from each petâ€™s profile.
            </p>
          </motion.form>
        </section>
      </div>
    </main>
  );
}



function PetRowCard({
  index, row, onChange, onRemove, onPick,
}: {
  index: number;
  row: PetDraft;
  onChange: (i: number, patch: Partial<PetDraft>) => void;
  onRemove: () => void;
  onPick: (f: File | null) => void;
}) {
  const fileRef = useRef<HTMLInputElement | null>(null);

  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900 p-5 text-slate-100 shadow-sm">
      
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-600 to-blue-600 text-white text-xs font-bold">
            {index + 1}
          </span>
          <h3 className="font-semibold">Pet #{index + 1}</h3>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="rounded-full border border-slate-700 px-3 py-1 text-xs font-semibold text-slate-200 hover:bg-slate-800"
        >
          Remove
        </button>
      </div>

      
      <div className="mb-4 flex items-center gap-4">
        <div className="relative h-20 w-20 overflow-hidden rounded-2xl bg-slate-800 ring-2 ring-cyan-400/40">
          {row.preview ? (
            <Image src={row.preview} alt="Preview" fill sizes="80px" className="object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[10px] text-slate-400">
              No photo
            </div>
          )}
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 px-4 py-2 text-xs font-semibold text-white shadow hover:from-cyan-700 hover:to-blue-700"
          >
            {row.preview ? 'Change photo' : 'Upload photo'}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => onPick(e.target.files?.[0] ?? null)}
          />
        </div>
      </div>

      
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="Pet name *">
          <input
            value={row.name}
            onChange={(e) => onChange(index, { name: e.target.value })}
            required
            className={inputBase}
            placeholder="e.g., Bruno"
          />
        </Field>

        <Field label="Species">
          <select
            value={row.species}
            onChange={(e) => onChange(index, { species: e.target.value as Species })}
            className={inputBase}
          >
            {(['Dog','Cat','Bird','Rabbit','Fish','Reptile','Other'] as Species[]).map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </Field>

        <Field label="Breed">
          <input
            value={row.breed}
            onChange={(e) => onChange(index, { breed: e.target.value })}
            className={inputBase}
            placeholder="e.g., Golden Retriever"
          />
        </Field>

        <Field label="Date of birth">
          <input
            type="date"
            value={row.dob}
            onChange={(e) => onChange(index, { dob: e.target.value })}
            className={inputBase}
          />
        </Field>

        <Field label="Weight (kg)">
          <input
            inputMode="decimal"
            value={row.weight}
            onChange={(e) => onChange(index, { weight: e.target.value })}
            className={inputBase}
            placeholder="e.g., 12.5"
          />
        </Field>

        <Field label="Notes">
          <input
            value={row.notes}
            onChange={(e) => onChange(index, { notes: e.target.value })}
            className={inputBase}
            placeholder="Temperament, allergies"
          />
        </Field>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-slate-200">{label}</span>
      {children}
    </label>
  );
}

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

