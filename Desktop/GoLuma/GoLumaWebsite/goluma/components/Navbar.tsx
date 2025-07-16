'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import GoBackToGateButton from './GoBackToGateButton';


export default function Navbar() {
  const [user, setUser] = useState<null | any>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);

    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (error) {
          console.error('Fehler beim Parsen von localStorage user:', error);
        }
      }
    }
  }, []);

  function normalizeRank(rank: string): string {
    if (rank === 'Christoph Columbus') return 'Christoph_Kolumbus';
    if (rank === 'Neil Armstrong') return 'Astronout';
    return rank.replace(' ', '_');
  }

  if (!hydrated) return null;

  const genderSuffix =
    user?.gender?.toLowerCase() === 'weiblich' ? 'female' : 'male';
  const normalizedRank = user?.rank ? normalizeRank(user.rank) : 'default';
  const profileImage = `/user/${normalizedRank}_${genderSuffix}.png`;

  return (
    <nav className="relative flex items-center justify-between px-6 py-4 bg-white shadow h-20">
      {/* Logo ganz links */}
      <div className="w-32 h-12 relative">
        <Image
          src="/Logo.png"
          alt="GoLuma Logo"
          fill
          className="object-contain"
          priority
        />
      </div>

      {/* Navigation mittig */}
      <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center space-x-6 text-gray-800 text-sm font-medium">
        <Link href="/">Erlebnisse</Link>
        <Link href="/about">Über uns</Link>
        <Link href="/join">Join Us</Link>
        <button>🌐 DE/EN</button>
      </div>

      {/* Rechts: Login/Profilbild + Zurück zum Gate */}
      <div className="flex items-center space-x-3">
        {/* Zurück zum Gate – immer sichtbar */}
        <GoBackToGateButton />


        {user ? (
          <div className="flex flex-col items-center space-y-1">
            <Link href="/profile">
              <div className="w-10 h-10 relative rounded-full overflow-hidden border border-gray-300 shadow-sm hover:shadow-md transition">
                <Image
                  src={profileImage}
                  alt="Profil"
                  fill
                  className="object-cover"
                />
              </div>
            </Link>
            <span className="text-xs text-gray-600 max-w-[6rem] truncate text-center">
              {user.name}
            </span>
          </div>
        ) : (
          <Link
            href="/login"
            className="text-sm text-blue-600 border border-blue-400 px-3 py-1 rounded hover:bg-blue-100 transition"
          >
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}
