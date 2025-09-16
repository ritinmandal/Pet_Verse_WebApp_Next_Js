'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';

type Pet = {
  id: string;
  owner_id: string;
  name: string;
  photo_url: string | null;   // legacy fallback
  avatar_url: string | null;
  cover_url: string | null;
};

export default function EditPetPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [meId, setMeId] = useState<string | null>(null);
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');


  const [name, setName] = useState('');


  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const avatarRef = useRef<HTMLInputElement | null>(null);


  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [removeCover, setRemoveCover] = useState(false);
  const coverRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace('/signup'); return; }
      setMeId(user.id);

      const { data, error } = await supabase
        .from('pets')
        .select('id, owner_id, name, photo_url, avatar_url, cover_url')
        .eq('id', id)
        .maybeSingle();

      if (error) { setErr(error.message); setLoading(false); return; }
      if (!data) { setErr('Pet not found'); setLoading(false); return; }
      if (data.owner_id !== user.id) { setErr('You do not own this pet.'); setLoading(false); return; }

      setPet(data as Pet);
      setName(data.name);
      setAvatarPreview(data.avatar_url ?? data.photo_url);
      setCoverPreview(data.cover_url ?? data.photo_url);
      setLoading(false);
    })();
  }, [id, router]);

  function onAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setAvatarFile(f);
    setRemoveAvatar(false);
    setAvatarPreview(f ? URL.createObjectURL(f) : (pet?.avatar_url ?? pet?.photo_url ?? null));
  }
  function onCover(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setCoverFile(f);
    setRemoveCover(false);
    setCoverPreview(f ? URL.createObjectURL(f) : (pet?.cover_url ?? pet?.photo_url ?? null));
  }

  async function uploadToBucket(kind: 'avatars'|'covers', file: File) {
    const ext = file.name.split('.').pop() || 'jpg';
    const key = `${kind}/${id}-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase
      .storage.from('pet-media')
      .upload(key, file, { upsert: false, contentType: file.type });
    if (upErr) throw upErr;
    const { data: pub } = supabase.storage.from('pet-media').getPublicUrl(key);
    if (!pub?.publicUrl) throw new Error('Failed to get public URL');
    return pub.publicUrl as string;
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!pet || !meId) return;
    if (!name.trim()) return alert('Please enter a name');

    try {
      setSaving(true);


      let avatar_url: string | null | undefined = undefined;
      let cover_url: string | null | undefined = undefined;

      if (removeAvatar) avatar_url = null;
      if (removeCover)  cover_url = null;

      if (avatarFile) avatar_url = await uploadToBucket('avatars', avatarFile);
      if (coverFile)  cover_url  = await uploadToBucket('covers',   coverFile);

      const update: Record<string, any> = { name: name.trim() };
      if (avatar_url !== undefined) update.avatar_url = avatar_url;
      if (cover_url  !== undefined) update.cover_url  = cover_url;

      const { error } = await supabase.from('pets').update(update).eq('id', pet.id);
      if (error) throw error;

      router.replace(`/pets/${pet.id}`);
    } catch (e: any) {
      console.error(e);
      alert(e?.message ?? 'Failed to save changes.');
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-[100dvh] bg-slate-950">
        <div className="mx-auto max-w-[900px] px-4 py-10">
          <div className="space-y-4">
            <div className="h-8 w-40 rounded bg-slate-800 animate-pulse" />
            <div className="h-56 rounded-2xl bg-slate-800 animate-pulse" />
          </div>
        </div>
      </main>
    );
  }

  if (!pet) {
    return (
      <main className="min-h-[100dvh] bg-slate-950">
        <div className="mx-auto max-w-[900px] px-4 py-10">
          <div className="rounded-2xl border border-rose-400/30 bg-rose-900/20 p-6 text-rose-200">{err || 'Not found'}</div>
          <div className="mt-4"><Link href="/" className="text-cyan-300 underline">Go home</Link></div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[100dvh] bg-[radial-gradient(1200px_600px_at_0%_0%,rgba(6,182,212,0.10),transparent),radial-gradient(1000px_500px_at_100%_0%,rgba(37,99,235,0.10),transparent)] bg-slate-950">
      <div className="mx-auto max-w-[900px] px-4 py-12">
        <section className="rounded-[26px] border border-slate-700 bg-slate-900 mt-18 shadow-md overflow-hidden">
          
          <div className="rounded-t-[26px] bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-5 text-white flex items-center justify-between">
            <h1 className="text-2xl font-bold">Edit {pet.name}</h1>
            <Link
              href={`/pets/${pet.id}`}
              className="rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20"
            >
              Back
            </Link>
          </div>

          <motion.form
            onSubmit={handleSave}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="p-6 sm:p-8 md:p-10 space-y-8"
          >
            
            <div>
              <p className="mb-2 text-sm font-semibold text-slate-200">Cover photo</p>
              <div className="flex items-center gap-4">
                <div className="relative h-28 w-48 overflow-hidden rounded-2xl bg-slate-800 ring-2 ring-cyan-400/40">
                  {coverPreview ? (
                    <Image src={coverPreview} alt="Cover preview" fill sizes="192px" className="object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">No cover</div>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => coverRef.current?.click()}
                    className="rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 px-4 py-2 text-sm font-semibold text-white hover:from-cyan-700 hover:to-blue-700"
                  >
                    {coverPreview ? 'Change cover' : 'Upload cover'}
                  </button>
                  {coverPreview && (
                    <button
                      type="button"
                      onClick={() => { setRemoveCover(true); setCoverFile(null); setCoverPreview(null); }}
                      className="rounded-full border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-800"
                    >
                      Remove cover
                    </button>
                  )}
                  <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={onCover} />
                </div>
              </div>
            </div>

            
            <div>
              <p className="mb-2 text-sm font-semibold text-slate-200">Profile photo (avatar)</p>
              <div className="flex items-center gap-4">
                <div className="relative h-28 w-28 overflow-hidden rounded-full bg-slate-800 ring-2 ring-cyan-400/40">
                  {avatarPreview ? (
                    <Image src={avatarPreview} alt="Avatar preview" fill sizes="112px" className="object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">No photo</div>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => avatarRef.current?.click()}
                    className="rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 px-4 py-2 text-sm font-semibold text-white hover:from-cyan-700 hover:to-blue-700"
                  >
                    {avatarPreview ? 'Change photo' : 'Upload photo'}
                  </button>
                  {avatarPreview && (
                    <button
                      type="button"
                      onClick={() => { setRemoveAvatar(true); setAvatarFile(null); setAvatarPreview(null); }}
                      className="rounded-full border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-800"
                    >
                      Remove photo
                    </button>
                  )}
                  <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={onAvatar} />
                </div>
              </div>
            </div>

            
            <div>
              <label className="block">
                <span className="mb-1 block text-sm font-semibold text-slate-200">Pet name *</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 placeholder-slate-400 focus:ring-4 focus:ring-cyan-400/40 focus:outline-none"
                  placeholder="eg. Bruno"
                />
              </label>
            </div>

            
            <div className="flex items-center gap-3">
              <button
                disabled={saving || !name.trim()}
                type="submit"
                className="rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-2 text-sm font-semibold text-white shadow hover:from-cyan-700 hover:to-blue-700 disabled:opacity-60"
              >
                {saving ? 'Saving…' : 'Save changes'}
              </button>
              <Link
                href={`/pets/${pet.id}`}
                className="rounded-full border border-slate-700 px-5 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-800"
              >
                Cancel
              </Link>
            </div>

            <p className="text-xs text-slate-400">
              Tip: You can update photos later from the pet’s profile page.
            </p>
          </motion.form>
        </section>
      </div>
    </main>
  );
}

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}
