'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { PawPrint, Calendar, Weight, Edit3, Trash2, ChevronLeft, Camera } from 'lucide-react';

type PetRow = {
  id: string;
  owner_id: string;
  name: string;
  species: string | null;
  breed: string | null;
  dob: string | null;
  weight_kg: number | null;
  notes: string | null;
  photo_url: string | null;               // legacy
  created_at: string;
  cover_url?: string | null;
  avatar_url?: string | null;
};

type PetMediaRow = {
  id: string;
  pet_id: string;
  url: string;
  created_at: string;
};

const cl = {
  brandGrad: 'bg-gradient-to-r from-cyan-600 to-blue-600',
  brandGradHover: 'hover:from-cyan-700 hover:to-blue-700',
  surface: 'bg-slate-900',
  surfaceAlt: 'bg-slate-850', 
  card: 'bg-slate-900 border border-slate-700 shadow-sm',
  chip: 'border border-cyan-500/30 bg-cyan-500/10 text-cyan-100',
  text: 'text-slate-100',
  textSoft: 'text-slate-300',
  textMuted: 'text-slate-400',
  ring: 'focus:outline-none focus:ring-4 focus:ring-cyan-400/40',
};

export default function PetProfilePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [meId, setMeId] = useState<string | null>(null);
  const [pet, setPet] = useState<PetRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [err, setErr] = useState<string>('');
  const [msg, setMsg] = useState<string>('');

  const [gallery, setGallery] = useState<PetMediaRow[]>([]);
  const [galleryLoading, setGalleryLoading] = useState(true);

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState(0);
  const [deletingPhotoId, setDeletingPhotoId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace('/signup'); return; }
      setMeId(user.id);

      setErr(''); setLoading(true);
      const base = 'id, owner_id, name, species, breed, dob, weight_kg, notes, photo_url, created_at';

      let petRow: PetRow | null = null;
      const withExtras = await supabase
        .from('pets')
        .select(`${base}, cover_url, avatar_url`)
        .eq('id', params.id)
        .maybeSingle();

      if (withExtras.error && withExtras.error.code !== '42703') {
        setErr(withExtras.error.message); setLoading(false); return;
      }
      petRow = (withExtras.data as PetRow) || null;
      if (!petRow) {
        const legacy = await supabase.from('pets').select(base).eq('id', params.id).maybeSingle();
        if (legacy.error) { setErr(legacy.error.message); setLoading(false); return; }
        petRow = legacy.data as PetRow | null;
      }

      if (!petRow) { setErr('Pet not found'); setLoading(false); return; }
      setPet(petRow);
      setLoading(false);

      setGalleryLoading(true);
      const g = await supabase
        .from('pet_media')
        .select('id, pet_id, url, created_at')
        .eq('pet_id', petRow.id)
        .order('created_at', { ascending: false });
      if (g.error) console.error('gallery load error:', g.error);
      setGallery((g.data ?? []) as PetMediaRow[]);
      setGalleryLoading(false);
    })();
  }, [params.id, router]);

  const ageLabel = useMemo(() => (pet?.dob ? humanAge(pet.dob) : '—'), [pet?.dob]);

  async function handleDeletePet() {
    if (!pet) return;
    if (!confirm(`Delete ${pet.name}? This cannot be undone.`)) return;
    try {
      setDeleting(true);
      const { error } = await supabase.from('pets').delete().eq('id', pet.id);
      if (error) throw error;
      router.replace('/pets');
    } catch (e: any) {
      alert(e?.message ?? 'Failed to delete');
      setDeleting(false);
    }
  }

  function storagePathFromPublicUrl(url: string) {
    try {
      const u = new URL(url);
      const marker = '/object/public/pet-media/';
      const i = u.pathname.indexOf(marker);
      if (i === -1) return null;
      return decodeURIComponent(u.pathname.slice(i + marker.length));
    } catch { return null; }
  }

  async function deletePhoto(row: PetMediaRow) {
    if (!pet || !meId) return;
    if (!confirm('Delete this photo?')) return;
    try {
      setDeletingPhotoId(row.id);
      const path = storagePathFromPublicUrl(row.url);
      if (path) {
        const { error: rmErr } = await supabase.storage.from('pet-media').remove([path]);
        if (rmErr) console.warn('storage remove failed:', rmErr.message);
      }
      const { error: dbErr } = await supabase.from('pet_media').delete().eq('id', row.id);
      if (dbErr) throw dbErr;

      const reset: Record<string, any> = {};
      if (pet.cover_url === row.url) reset.cover_url = null;
      if (pet.avatar_url === row.url) reset.avatar_url = null;
      if (Object.keys(reset).length) {
        const { error: upErr } = await supabase.from('pets').update(reset).eq('id', pet.id);
        if (!upErr) setPet({ ...pet, ...reset });
      }

      try {
        await supabase.from('activities').insert({
          actor_id: meId,
          verb: 'pet.media_deleted',
          subject_type: 'pet',
          subject_id: pet.id,
          summary: `Removed a photo from ${pet.name}`,
          diff: null,
          photo_url: row.url,
          visibility: 'owner_only',
          owner_id: pet.owner_id,
        });
      } catch (e) { console.warn('activity insert failed', e); }

      setGallery(prev => prev.filter(p => p.id !== row.id));
      setMsg('Photo deleted');
      setLightboxIdx(i => Math.min(Math.max(0, i - (i >= gallery.length - 1 ? 1 : 0)), Math.max(0, gallery.length - 2)));
      if (gallery.length - 1 <= 0) setLightboxOpen(false);
    } catch (e: any) {
      console.error(e);
      alert(e?.message ?? 'Failed to delete photo');
    } finally { setDeletingPhotoId(null); }
  }

  const coverSrc  = pet?.cover_url  || pet?.photo_url || '';
  const avatarSrc = pet?.avatar_url || '/images/avatar-placeholder.png';
  const iOwnIt = !!(meId && pet && meId === pet.owner_id);

  if (loading) return (
    <main className="min-h-[100dvh] bg-slate-950">
      <div className="mx-auto max-w-[960px] px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-56 rounded-3xl bg-slate-800" />
          <div className="h-6 w-64 rounded bg-slate-800" />
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="h-24 rounded-xl bg-slate-800" />
            <div className="h-24 rounded-xl bg-slate-800" />
            <div className="h-24 rounded-xl bg-slate-800" />
          </div>
        </div>
      </div>
    </main>
  );

  if (!pet) return (
    <main className="min-h-[100dvh] bg-slate-950">
      <div className="mx-auto max-w-[960px] px-4 py-12">
        <div className="rounded-2xl border border-rose-400/30 bg-rose-900/20 p-6 text-rose-200">{err || 'Pet not found'}</div>
        <div className="mt-4">
          <Link href="/" className="text-cyan-300 underline">Go back</Link>
        </div>
      </div>
    </main>
  );

  return (
    <main className="min-h-[100dvh]  bg-[radial-gradient(1200px_600px_at_0%_0%,rgba(6,182,212,0.10),transparent),radial-gradient(1000px_500px_at_100%_0%,rgba(37,99,235,0.10),transparent)] bg-slate-950">
    
      <div className="relative mx-auto mb-8  max-w-8xl">
        <div className="relative h-48 w-full overflow-hidden sm:h-64 md:h-72 lg:h-80 border border-slate-800">
          <Image src="/images/statbg13.jpg" alt="Header" fill priority className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-transparent to-blue-600/20" />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(2,6,23,0)_0%,rgba(2,6,23,0.55)_65%,rgba(2,6,23,0.85)_100%)]" />

          <div className="relative z-10 flex h-full items-center justify-between px-4 sm:px-8">
            <div className="space-y-2">
              <p className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1 text-xs font-semibold tracking-widest text-cyan-300">
                <span className="inline-block h-2 w-2 rounded-full bg-cyan-400" /> PET PROFILE
              </p>
              <h1 className="text-3xl font-extrabold text-white md:text-5xl">{pet.name}</h1>
              <p className="text-slate-300 text-sm">Home / Profile / Pet Profile</p>
            </div>
            <Link
              href="/pets"
              className="hidden sm:inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-800"
            >
              <ChevronLeft className="h-4 w-4" /> Back
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1000px] px-4 pb-12">
        <section className={`relative overflow-hidden rounded-[28px] ${cl.card}`}>
          <div className="relative h-56 w-full overflow-hidden rounded-t-[28px]">
            {coverSrc ? (
              <Image src={coverSrc} alt={`${pet.name} cover`} fill sizes="(max-width: 768px) 100vw, 1000px" className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-slate-800 text-slate-400">No cover photo</div>
            )}
          </div>

          <div className="absolute -bottom-10 left-6 z-10 flex items-end gap-4">
            <div className="relative h-28 w-28 overflow-hidden rounded-2xl ring-2 ring-cyan-400/60">
              <Image src={avatarSrc} alt={`${pet.name} avatar`} fill className="object-cover" sizes="112px" />
            </div>
            <div className="hidden sm:flex flex-wrap items-center gap-2 pb-2">
              {pet.species && <Badge icon={<PawPrint className="h-3.5 w-3.5" />} label={pet.species} />}
              {pet.breed && <Badge label={pet.breed} />}
              {ageLabel !== '—' && <Badge icon={<Calendar className="h-3.5 w-3.5" />} label={ageLabel} />}
              {pet.weight_kg && <Badge icon={<Weight className="h-3.5 w-3.5" />} label={`${pet.weight_kg} kg`} />}
            </div>
          </div>

          <div className="mt-16 flex flex-col gap-3 px-6 pb-6 pt-4 sm:mt-12 sm:flex-row sm:items-center sm:justify-between">
            <div className="sm:ml-36">
              <h2 className={`text-xl font-bold ${cl.text}`}>{pet.name}</h2>
              <p className={`text-sm ${cl.textSoft}`}>
                {pet.species || 'Pet'}{pet.breed ? ` • ${pet.breed}` : ''} {pet.dob ? `• DOB: ${new Date(pet.dob).toLocaleDateString()}` : ''}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/pets/${pet.id}/edit`}
                className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-100 hover:bg-cyan-500/15"
              >
                <Edit3 className="h-4 w-4 text-cyan-300" /> Edit
              </Link>
              <button
                onClick={handleDeletePet}
                disabled={!iOwnIt || deleting}
                className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
              >
                <Trash2 className="h-4 w-4" /> {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </section>

        <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <Stat title="Age" value={ageLabel} />
          <Stat title="Weight" value={pet.weight_kg ? `${pet.weight_kg} kg` : '—'} />
          <Stat title="Created" value={new Date(pet.created_at).toLocaleDateString()} />
        </section>

        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="mt-6 rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-sm"
        >
          <h2 className={`mb-4 text-lg font-semibold ${cl.text}`}>About {pet.name}</h2>
          <ul className={`space-y-2 text-sm ${cl.text}`}>
            <li><strong className={cl.textMuted}>Species:</strong> {pet.species || '—'}</li>
            <li><strong className={cl.textMuted}>Breed:</strong> {pet.breed || '—'}</li>
            <li><strong className={cl.textMuted}>Birthday:</strong> {pet.dob ? new Date(pet.dob).toLocaleDateString() : '—'}</li>
            <li><strong className={cl.textMuted}>Weight:</strong> {pet.weight_kg ? `${pet.weight_kg} kg` : '—'}</li>
            <li><strong className={cl.textMuted}>Owner:</strong> {meId === pet.owner_id ? 'You' : pet.owner_id.slice(0, 8)}</li>
          </ul>
          {pet.notes && (
            <div className="mt-5 rounded-xl border border-slate-700 bg-slate-800 p-4">
              <h3 className="mb-1 text-sm font-semibold text-slate-300">Bio</h3>
              <p className="text-sm leading-relaxed text-slate-100">{pet.notes}</p>
            </div>
          )}
        </motion.section>

        <section className="mt-8">
          <div className="mb-3 flex items-center justify-between">
            <h2 className={`text-xl font-bold ${cl.text}`}>Photos</h2>
            {meId === pet.owner_id && (
              <UploadPetPhoto
                petId={pet.id}
                petName={pet.name}
                ownerId={pet.owner_id}
                actorId={meId!}
                setMsg={setMsg}
                onUploaded={(url) => {
                  setGallery((prev) => [
                    { id: crypto.randomUUID(), pet_id: pet.id, url, created_at: new Date().toISOString() },
                    ...(prev ?? []),
                  ]);
                }}
              />
            )}
          </div>

          {galleryLoading ? (
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="h-28 sm:h-32 rounded-lg bg-slate-800 animate-pulse" />
              ))}
            </div>
          ) : gallery.length === 0 ? (
            <div className="rounded-xl border border-slate-700 bg-slate-900 p-6 text-sm text-slate-300 flex items-center gap-3">
              <Camera className="h-4 w-4 text-cyan-300" /> No photos yet. Add some snapshots for {pet.name}!
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {gallery.map((g, idx) => (
                  <div key={g.id} className="group relative aspect-square overflow-hidden rounded-lg bg-slate-800">
                    <button
                      onClick={() => { setLightboxIdx(idx); setLightboxOpen(true); }}
                      title={`Open photo ${idx + 1}`}
                      className="absolute inset-0"
                    >
                      <Image
                        src={g.url}
                        alt={`${pet.name} photo ${idx + 1}`}
                        fill
                        className="object-cover transition group-hover:scale-105"
                        sizes="(max-width: 768px) 33vw, 320px"
                      />
                    </button>
                    {meId === pet.owner_id && (
                      <button
                        onClick={(e) => { e.stopPropagation(); deletePhoto(g); }}
                        className="absolute right-1 top-1 rounded-full bg-black/60 px-2 py-1 text-[11px] font-semibold text-white opacity-0 transition group-hover:opacity-100"
                        title="Delete photo"
                      >
                        {deletingPhotoId === g.id ? '…' : 'Delete'}
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <AnimatePresence>
                {lightboxOpen && (
                  <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  >
                    <motion.div
                      className="relative w-full max-w-4xl overflow-hidden rounded-2xl bg-black"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: 20, opacity: 0 }}
                      transition={{ duration: 0.18 }}
                    >
                      <div className="relative h-[70vh] w-full">
                        <Image
                          src={gallery[lightboxIdx].url}
                          alt={`Photo ${lightboxIdx + 1}`}
                          fill
                          className="object-contain"
                          sizes="(max-width: 1024px) 100vw, 1024px"
                        />
                      </div>

                      <div className="absolute inset-x-0 top-0 flex items-center justify-between p-3">
                        {meId === pet.owner_id ? (
                          <button
                            onClick={() => deletePhoto(gallery[lightboxIdx])}
                            className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white hover:bg-white/15"
                          >
                            {deletingPhotoId === gallery[lightboxIdx].id ? 'Deleting…' : 'Delete'}
                          </button>
                        ) : <div />}
                        <div className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white">
                          {lightboxIdx + 1} / {gallery.length}
                        </div>
                        <button
                          onClick={() => setLightboxOpen(false)}
                          className="rounded-full bg-white/10 px-3 py-1 text-white hover:bg-white/15"
                        >
                          Close
                        </button>
                      </div>

                      <div className="absolute inset-y-0 left-0 flex items-center">
                        <button
                          onClick={() => setLightboxIdx((i) => (i - 1 + gallery.length) % gallery.length)}
                          className="m-2 rounded-full bg-white/10 px-3 py-2 text-white hover:bg-white/15"
                          aria-label="Previous"
                        >
                          ‹
                        </button>
                      </div>
                      <div className="absolute inset-y-0 right-0 flex items-center">
                        <button
                          onClick={() => setLightboxIdx((i) => (i + 1) % gallery.length)}
                          className="m-2 rounded-full bg-white/10 px-3 py-2 text-white hover:bg-white/15"
                          aria-label="Next"
                        >
                          ›
                        </button>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </section>

        {msg && <p className="mt-3 text-sm text-emerald-300">{msg}</p>}

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/pets/new"
            className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-5 py-2 text-sm font-semibold text-cyan-100 hover:bg-cyan-500/15"
          >
            Add another pet
          </Link>
          <Link
            href="/dashboard"
            className={`rounded-full ${cl.brandGrad} ${cl.brandGradHover} px-5 py-2 text-sm font-semibold text-white`}
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}

function UploadPetPhoto({
  petId, petName, ownerId, actorId, onUploaded, setMsg,
}: {
  petId: string;
  petName: string;
  ownerId: string;
  actorId: string;
  onUploaded: (url: string) => void;
  setMsg: (s: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const inputId = `gallery-input-${petId}`;

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.currentTarget;
    const file = input.files?.[0];
    if (!file) return;
    try {
      setBusy(true);
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `gallery/${petId}-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from('pet-media').upload(path, file, { upsert: false, contentType: file.type });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from('pet-media').getPublicUrl(path);
      const url = pub?.publicUrl; if (!url) throw new Error('Failed to get public URL');
      const { error: insErr } = await supabase.from('pet_media').insert({ pet_id: petId, url });
      if (insErr) throw insErr;
      try {
        await supabase.from('activities').insert({
          actor_id: actorId,
          verb: 'pet.media_added',
          subject_type: 'pet',
          subject_id: petId,
          summary: `Added a photo to ${petName}`,
          diff: null,
          photo_url: url,
          visibility: 'owner_only',
          owner_id: ownerId,
        });
      } catch (e) { console.warn('activity insert failed', e); }
      setMsg('Photo uploaded!'); onUploaded(url);
    } catch (err: any) { console.error(err); setMsg(err?.message ?? 'Upload failed'); }
    finally { setBusy(false); if (input) input.value = ''; }
  }
  return (
    <>
      <input id={inputId} type="file" accept="image/*" className="hidden" onChange={onFile} />
      <label
        htmlFor={inputId}
        title="Add photo to gallery"
        className={`cursor-pointer rounded-full px-4 py-2 text-sm font-semibold shadow ${busy ? 'bg-slate-700 text-slate-400' : 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:from-cyan-700 hover:to-blue-700'}`}
      >
        {busy ? 'Uploading…' : 'Add photo'}
      </label>
    </>
  );
}

function Stat({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900 p-4 text-slate-100 shadow-sm">
      <p className="text-xs text-slate-400">{title}</p>
      <p className="mt-1 text-2xl font-extrabold">{value}</p>
    </div>
  );
}

function Badge({ label, icon }: { label: string; icon?: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 text-xs font-medium text-cyan-100">
      {icon} {label}
    </span>
  );
}

function humanAge(dobISO: string) {
  const dob = new Date(dobISO);
  const now = new Date();
  let years = now.getFullYear() - dob.getFullYear();
  let months = now.getMonth() - dob.getMonth();
  let days = now.getDate() - dob.getDate();
  if (days < 0) { months -= 1; days += daysInMonth(new Date(now.getFullYear(), now.getMonth(), 0)); }
  if (months < 0) { years -= 1; months += 12; }
  if (years > 0) return `${years}y ${months}m`;
  if (months > 0) return `${months}m ${Math.max(days, 0)}d`;
  return `${Math.max(days, 0)}d`;
}
function daysInMonth(d: Date) { return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate(); }
