
"use client";

import Link from "next/link";
import { sidebarMenus } from "@/app/config/sidebarMenus";
import Image from "next/image";
import { LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

type SidebarProps = {
  role: "admin" | "vet" | "user";
  name: string;
  avatarUrl?: string;
};

export default function Sidebar({ role, name, avatarUrl }: SidebarProps) {
  const menus = sidebarMenus[role] || [];
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.push("/signup");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <aside className="w-65  relative overflow-hidden flex flex-col">
      
      <div className="absolute  bg-gradient-to-br from-dark-700 via-dark-800 to-dark-950" />

      
      

      
      <div className="relative flex flex-col h-full">
        
        <div className="flex flex-col pt-4 items-center px-6">
          <div className="relative mb-4">
            <Image
              src={avatarUrl || "/default-avatar.png"}
              alt={name}
              width={80}
              height={80}
              className="w-20 h-20 rounded-full object-cover ring-4 ring-white/30 shadow-xl"
            />
            
            <div className="pointer-events-none absolute -inset-2 rounded-full bg-cyan-400/10 blur-xl" />
          </div>
          <h2 className="font-bold text-white text-xl mb-1 drop-shadow-sm">{name}</h2>
          <p className="text-sm text-white/90 capitalize bg-white/15 px-3 py-1 rounded-full backdrop-blur-sm border border-white/10">
            {role}
          </p>
        </div>

        
        <nav className="flex flex-col gap-2 mt-10 py-10 flex-1">
          {menus.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className="group relative  text-white/90 font-medium text-base px-4 py-3 rounded-xl border border-white/10
                         transition-all duration-300 backdrop-blur-sm
                         hover:shadow-lg hover:border-cyan-300/30
                         focus:outline-none focus:ring-2 focus:ring-cyan-300/50"
            >
              
              <span className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-white/5 via-cyan-500/10 to-white/5" />
              
              <span className="absolute left-0 top-0 h-full w-1 rounded-l-xl bg-gradient-to-b from-cyan-400/80 to-blue-700/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative z-10 flex items-center gap-2">
                
                {item.icon && <span className="text-cyan-300/90">{item.icon}</span>}
                {item.label}
              </span>
            </Link>
          ))}
        </nav>

        
        <div>
          <button
            onClick={handleLogout}
            className="group w-full flex items-center justify-center gap-3 text-white/90 font-medium text-base px-4 py-3 rounded-2xl
                       border border-white/10 backdrop-blur-sm transition-all duration-300
                       hover:border-cyan-300/40 hover:shadow-lg
                       focus:outline-none focus:ring-2 focus:ring-cyan-300/60"
            aria-label="Logout"
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-700 to-cyan-500
                             group-hover:from-blue-800 group-hover:to-cyan-600 transition-colors">
              <LogOut className="w-4 h-4 text-white" />
            </span>
            <span className="relative">
              <span className="bg-gradient-to-r from-cyan-300 to-blue-200 bg-clip-text text-transparent">
                Logout
              </span>
              
              <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300 group-hover:w-full" />
            </span>
          </button>
        </div>
      </div>

      
      <div className="absolute top-10 left-10 w-24 h-24 bg-cyan-300/20 rounded-full blur-2xl" />
      <div className="absolute bottom-20 right-8 w-20 h-20 bg-blue-400/10 rounded-full blur-xl" />
    </aside>
  );
}
