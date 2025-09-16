'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { supabase } from '@/lib/supabase';
import { useMap } from 'react-leaflet';


const THEME = {
  bgFrom: '#F4ECCF',   // beige
  bgTo:   '#FFFFFF',   // warm → white
  accent: '#2255EE',   // cyan-blue from your navbar button
  accent2:'#51D1EB',   // bright cyan
  sun:    '#F6C436',   // cheerful yellow
};


const blueIcon = new L.Icon({
  iconUrl:
    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  iconRetinaUrl:
    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});


const MapContainer = dynamic(
  () => import('react-leaflet').then((m) => m.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((m) => m.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((m) => m.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((m) => m.Popup),
  { ssr: false }
);


type UserRow = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  created_at: string;
  user_id: string | null;
  role: 'user' | 'admin' | 'vet' | string;
  avatar_url: string | null;
  city: string | null;
  state: string | null;
  latitude: number | null;
  longitude: number | null;
};

type RoleFilter = 'all' | 'user' | 'vet' | 'admin';

export default function LocationsPage() {
  const [rows, setRows] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [role, setRole] = useState<RoleFilter>('all');
  const [onlyWithCoords, setOnlyWithCoords] = useState(false);

  useEffect(() => {
    let ignore = false;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select(
          'id, first_name, last_name, email, phone, created_at, user_id, role, avatar_url, city, state, latitude, longitude'
        )
        .order('created_at', { ascending: false });

      if (ignore) return;
      if (error) {
        console.error('Supabase users error:', error);
        setRows([]);
      } else {
        setRows((data ?? []) as UserRow[]);
      }
      setLoading(false);
    })();
    return () => {
      ignore = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    let list = rows.filter((r) => {
      if (role !== 'all' && r.role !== role) return false;
      if (!s) return true;
      return `${r.first_name} ${r.last_name} ${r.city ?? ''} ${r.state ?? ''} ${r.role ?? ''} ${r.email}`
        .toLowerCase()
        .includes(s);
    });
    if (onlyWithCoords) list = list.filter((r) => r.latitude != null && r.longitude != null);
    return list;
  }, [rows, q, role, onlyWithCoords]);

  const withCoords = filtered.filter((r) => r.latitude != null && r.longitude != null);
  const selected = filtered.find((r) => r.id === selectedId) ?? null;

  const defaultCenter: [number, number] = [20.5937, 78.9629]; // India
  const defaultZoom = 4;

  return (
    <div
      className="min-h-screen relative"
      style={{
        backgroundImage: `linear-gradient(180deg, ${THEME.bgFrom}, ${THEME.bgTo})`,
      }}
    >
      
      
      <div className="relative w-full h-48 sm:h-64 md:h-72 lg:h-80 mb-12">
        <Image
          src="/images/banner14.jpg"
          alt="Locations Banner"
          fill
          priority
          className="object-cover"
          
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/60 via-cyan-700/50 to-blue-800/60 flex flex-col justify-center items-center text-center"></div>

        <div className="absolute inset-0 bg-white/10" />
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-white drop-shadow">
            Discover on Map
          </h1>
          <p className="text-sm md:text-base text-cyan-100 mt-2">Home / Locations</p>
        </div>
      </div>

      
      <div className="relative mx-auto max-w-7xl px-4 md:px-6 pt-2 pb-10">
        
        <div className="mb-4 grid grid-cols-1 lg:grid-cols-3 gap-3 items-center">
          <div className="col-span-2 flex flex-col sm:flex-row gap-3">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search name, city, state…"
              className="h-11 w-full rounded-xl bg-white border border-black/5 px-4 text-sm text-slate-800 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[--pv-accent]"
              style={{ ['--pv-accent' as any]: THEME.accent }}
            />

            
            <div className="flex items-right gap-4">
              {(['all','user','vet','admin'] as RoleFilter[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className={`px-5 h-11 rounded-full border text-sm capitalize transition ${
                    role === r
                      ? 'text-white'
                      : 'text-slate-700'
                  }`}
                  style={
                    role === r
                      ? { background: `linear-gradient(90deg, ${THEME.accent2}, ${THEME.accent})`, borderColor: 'transparent' }
                      : { background: '#ffffff', borderColor: 'rgba(0,0,0,.08)' }
                  }
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-4">
            <label className="inline-flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                className="h-4 w-4 accent-teal-500"
                checked={onlyWithCoords}
                onChange={(e) => setOnlyWithCoords(e.target.checked)}
              />
              Only with coordinates
            </label>
            {!loading && (
              <span className="text-xs md:text-sm text-slate-600">
                {filtered.length} users · {withCoords.length} with coordinates
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          <aside className="space-y-6 overflow-y-auto max-h-[680px] pr-2">
            {loading ? (
              <LeftSkeleton />
            ) : filtered.length === 0 ? (
              <p className="text-sm text-slate-600">No users found.</p>
            ) : (
              filtered.map((u, i) => (
                <UserCard
                  key={u.id}
                  user={u}
                  index={i}
                  active={selectedId ? selectedId === u.id : i === 0}
                  onClick={() => setSelectedId(u.id)}
                />
              ))
            )}
          </aside>

          
          <section className="relative h-[520px] lg:h-[680px] rounded-2xl overflow-hidden shadow-xl ring-1 ring-black/5 bg-white">
            
            

            <div className="h-full w-full relative">
              <MapContainer
                center={
                  selected?.latitude && selected?.longitude
                    ? [selected.latitude, selected.longitude]
                    : defaultCenter
                }
                zoom={selected ? 12 : defaultZoom}
                style={{ height: '100%', width: '100%', zIndex: 1 }}
                zoomControl={true}
                scrollWheelZoom={true}
              >
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                  attribution="&copy; OpenStreetMap &copy; CARTO"
                />

                <ViewportController
                  items={withCoords}
                  selected={selected}
                  fallbackCenter={defaultCenter}
                />

                {withCoords.map((u) => (
                  <Marker
                    key={u.id}
                    position={[u.latitude!, u.longitude!]}
                    icon={blueIcon}
                    eventHandlers={{ click: () => setSelectedId(u.id) }}
                  >
                    <Popup>
                      <div className="min-w-[220px]">
                        <div className="font-semibold text-slate-900">{`${u.first_name} ${u.last_name}`}</div>
                        <div className="text-xs text-slate-600 capitalize">{u.role}</div>
                        <div className="text-sm text-slate-800 mt-1">
                          {[u.city, u.state].filter(Boolean).join(', ') || '—'}
                        </div>
                        {u.phone && (
                          <div className="text-sm text-slate-800 mt-1 flex items-center gap-1">
                            {phoneIcon} {u.phone}
                          </div>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}


function MapControlButton({
  label,
  title,
  onClickId,
}: { label: string; title: string; onClickId: 'fit-users'|'fit-india'|'locate-me' }) {
  return (
    <button
      data-map-action={onClickId}
      title={title}
      className="text-xs px-3 h-8 rounded-full bg-white/95 border border-black/10 shadow-sm hover:shadow transition"
    >
      {label}
    </button>
  );
}


function ViewportController({
  items,
  selected,
  fallbackCenter,
}: {
  items: UserRow[];
  selected: UserRow | null;
  fallbackCenter: [number, number];
}) {
  const map = useMap();

  useEffect(() => {

    const container = map.getContainer().parentElement?.parentElement; // section > div > map
    if (!container) return;

    const handler = async (ev: Event) => {
      const target = ev.target as HTMLElement;
      const action = target.getAttribute('data-map-action') as
        | 'fit-users'
        | 'fit-india'
        | 'locate-me'
        | null;
      if (!action) return;

      if (action === 'fit-users') {
        const pts = items.map((i) => [i.latitude!, i.longitude!] as [number, number]);
        if (pts.length === 0) return;
        if (pts.length === 1) {
          map.setView(pts[0], 11);
        } else {
          map.fitBounds(L.latLngBounds(pts).pad(0.2), { animate: true });
        }
      }

      if (action === 'fit-india') {
        map.setView(fallbackCenter, 4);
      }

      if (action === 'locate-me') {
        if (!navigator.geolocation) return;
        navigator.geolocation.getCurrentPosition((pos) => {
          const { latitude, longitude } = pos.coords;
          map.flyTo([latitude, longitude], 12, { duration: 0.7 });
        });
      }
    };

    container.addEventListener('click', handler);
    return () => container.removeEventListener('click', handler);
  }, [items, fallbackCenter, map]);

  useEffect(() => {

    if (selected?.latitude != null && selected.longitude != null) {
      map.flyTo([selected.latitude, selected.longitude], 13, { duration: 0.7 });
      return;
    }

    const pts = items.map((i) => [i.latitude!, i.longitude!] as [number, number]);
    if (pts.length === 0) {
      map.setView(fallbackCenter, 4);
    } else if (pts.length === 1) {
      map.setView(pts[0], 11);
    } else {
      map.fitBounds(L.latLngBounds(pts).pad(0.2), { animate: true });
    }
  }, [items, selected, fallbackCenter, map]);

  return null;
}


function UserCard({
  user,
  index,
  active,
  onClick,
}: {
  user: UserRow;
  index: number;
  active?: boolean;
  onClick?: () => void;
}) {
  const title = `${user.first_name} ${user.last_name}`.trim();
  const address = [user.city, user.state].filter(Boolean).join(', ');

  const activeClasses =
    active || index === 0
      ? 'text-white border-transparent'
      : 'bg-white border border-black/5 text-slate-900 hover:shadow-md';

  const activeStyle =
    active || index === 0
      ? {
          background: `linear-gradient(90deg, ${THEME.accent2}, ${THEME.accent})`,
          boxShadow: '0 10px 30px -12px rgba(32, 83, 238, 0.35)',
        }
      : {};

  return (
    <button
      onClick={onClick}
      className={`relative w-full rounded-2xl overflow-hidden transition-all duration-200 hover:scale-[1.01] ${activeClasses}`}
      style={activeStyle as React.CSSProperties}
    >
      <div className="relative flex items-center">
        
        <div className="flex-1 p-6 pr-36">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-semibold">{title || 'Unnamed'}</h3>
            
            <span
              className={`text-[11px] px-2 py-0.5 rounded-full ${
                active || index === 0
                  ? 'bg-white/25 text-white'
                  : 'bg-teal-50 text-teal-700 border border-teal-100'
              }`}
            >
              {user.role}
            </span>
          </div>

          
          <div className="mt-2 flex items-start gap-2">
            <span className={active ? 'text-white' : 'text-teal-600'}>{pinIcon}</span>
            <p className={`text-sm ${active ? 'text-white/95' : 'text-slate-700'}`}>
              {address || '—'}
            </p>
          </div>

          
          {user.phone && (
            <div className="mt-2 flex items-center gap-2">
              <span className={active ? 'text-white' : 'text-teal-600'}>{phoneIcon}</span>
              <p className={`text-sm ${active ? 'text-white/95' : 'text-slate-700'}`}>
                {user.phone}
              </p>
            </div>
          )}
        </div>

        
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          <div className={`h-20 w-20 rounded-full shadow-lg p-1 ${active ? 'bg-white/20 ring-1 ring-white/40' : 'bg-white ring-1 ring-black/5'}`}>
            <div className="h-full w-full overflow-hidden rounded-full bg-slate-100">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <span className={`${active ? 'text-white/90' : 'text-slate-400'} text-xs`}>No Image</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}


function LeftSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="h-32 rounded-2xl bg-white border border-black/5 animate-pulse"
        />
      ))}
    </div>
  );
}


const pinIcon = (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
    <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" />
  </svg>
);
const phoneIcon = (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
    <path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 0 1 1 1v3.5a1 1 0 0 1-1 1C11.85 21.82 2.18 12.15 2.18 1a1 1 0 0 1 1-1H6.7a1 1 0 0 1 1 1c0 1.25.2 2.46.57 3.58a1 1 0 0 1-.24 1.01l-2.2 2.2z" />
  </svg>
);
