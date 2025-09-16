'use client';
import Link from 'next/link';
import { Card, FeatureCard, AvatarPicker } from './shared/ui';
import React from 'react';

export default function UserDashboard({
  firstName, meId, profileAvatar, onAvatarChange, showMessage, onExploreMyPets,
}: {
  firstName: string;
  meId: string | null;
  profileAvatar: string | null;
  onAvatarChange: (url: string | null) => void;
  showMessage: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onExploreMyPets: () => void;
}) {
  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-cyan-700/40 to-blue-800/40 border-white/10">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="ring-4 ring-cyan-400/30 rounded-full bg-white/10">
              <AvatarPicker currentUrl={profileAvatar} meId={meId} table="users" showMessage={showMessage} onUploaded={onAvatarChange} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Hello{firstName ? `, ${firstName}` : ''}</h2>
              <p className="text-gray-200">Your journey starts here with us</p>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <FeatureCard
          title="Pet Profiles"
          description="Create detailed profiles for your furry friends with photos, medical history, and more."
          icon="🐶🐰🦜🐈"
          gradient="from-cyan-500 to-blue-600"
          action="Manage Pets"
          onClick={onExploreMyPets}
        />
        <FeatureCard
          title="Book Appointments"
          description="Find qualified veterinarians near you and schedule appointments with ease."
          icon="📅🩺💉🏥"
          gradient="from-yellow-400 to-amber-600"
          action="Book Now"
          href="/appointments/new"
        />
        <FeatureCard
          title="Shop Products"
          description="Browse premium pet food, medicines, and accessories for your pets."
          icon="🏷️🛒💳🛍️"
          gradient="from-fuchsia-500 to-purple-600"
          action="Shop Now"
          href="/products"
        />
      </div>

      <Card>
        <h3 className="text-xl font-bold bg-gradient-to-r from-cyan-300 via-yellow-300 to-blue-400 bg-clip-text text-transparent">Recent Activity</h3>
        <div className="space-y-3 mt-3">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
            <div className="flex-1">
              <p className="font-medium text-white">Welcome to Poshik</p>
              <p className="text-sm text-gray-300">Complete your profile to get personalized recommendations</p>
            </div>
            <span className="text-xs text-gray-400">Just now</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
