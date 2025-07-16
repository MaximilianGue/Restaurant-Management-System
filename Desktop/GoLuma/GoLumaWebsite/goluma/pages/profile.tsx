import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import RankJourney from '../components/RankJourney'; 



export default function Profile() {
  const [user, setUser] = useState<any>(null);
  const [showRankPopup, setShowRankPopup] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  if (!user) {
    return <p className="text-center mt-20">Bitte einloggen...</p>;
  }

  const ranks = [
    { name: 'Adventurer', points: 0, benefit: 'Zugang zu Standard-Erlebnissen' },
    { name: 'Explorer', points: 200, benefit: '5% Rabatt auf alle Buchungen' },
    { name: 'Pirate', points: 500, benefit: 'Exklusiver Zugang zu Abenteuer-Touren' },
    { name: 'Christoph Columbus', points: 1000, benefit: 'Freie Buchung eines Bonus-Erlebnisses pro Jahr' },
    { name: 'Neil Armstrong', points: 2000, benefit: 'VIP-Support & Einladungen zu Events' },
  ];

  const rankImages: Record<string, string> = {
    'Adventurer': '/user/Adventurer.png',
    'Explorer': '/user/Explorer.png',
    'Pirate': '/user/Pirate.png',
    'Christoph Columbus': '/user/Columbus.png',
    'Neil Armstrong': '/user/Astronout.png',
  };

  function normalizeRank(rank: string): string {
    if (rank === 'Christoph Columbus') return 'Christoph_Kolumbus';
    if (rank === 'Neil Armstrong') return 'Astronout'; // Corrected spelling
    return rank.replace(' ', '_');
  }

  const genderSuffix = user.gender?.toLowerCase() === 'weiblich' ? 'female' : 'male';
  const normalizedRank = normalizeRank(user.rank || '');
  const profileImage = `/user/${normalizedRank}_${genderSuffix}.png`;

  const formattedBirthdate = new Date(user.birthdate).toLocaleDateString('de-DE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  function getAge(birthdate: string) {
    const today = new Date();
    const birth = new Date(birthdate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }

  const age = getAge(user.birthdate);

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-10">
      <h1 className="text-4xl font-bold text-center text-gray-800">Dein Profil</h1>

      <div className="bg-white rounded-2xl shadow p-6 flex flex-col sm:flex-row items-center sm:items-start sm:space-x-6">
        <div className="w-24 h-24 relative rounded-full overflow-hidden shadow-md border">
          <Image src={profileImage} alt="Profilbild" fill className="object-cover" />
        </div>

        <div className="mt-4 sm:mt-0 text-center sm:text-left">
          <h2 className="text-2xl font-semibold text-gray-800">{user.name}</h2>
          <p className="text-gray-500">Geboren am {formattedBirthdate} ({age} Jahre alt)</p>
          <p className="text-gray-500">Geschlecht: {user.gender}</p>
          <p><Link href="/profile/edit" className="text-sm text-blue-600 underline">Profil bearbeiten</Link></p>
          <button
            onClick={() => {
              localStorage.removeItem('user');
              window.location.href = '/';
            }}
            className="mt-2 text-sm text-red-600 hover:underline"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Luma Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          className="bg-orange-50 border border-orange-200 rounded-xl p-6 text-center shadow-sm cursor-pointer hover:shadow-md transition"
          onClick={() => setShowRankPopup(true)}
        >
          <p className="text-3xl font-bold text-orange-600">{user.luma_points}</p>
          <p className="text-sm text-gray-700 mt-1">Luma Punkte</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center shadow-sm">
          <p className="text-xl font-semibold text-green-700">{user.rank}</p>
          <p className="text-sm text-gray-700 mt-1">Aktueller Rang</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center shadow-sm">
          <p className="font-mono text-lg text-blue-700">{user.referee_code || 'N/A'}</p>
          <p className="text-sm text-gray-700 mt-1">Referee Code</p>
        </div>
      </div>

      {/* Kommende Erlebnisse */}
      <div className="bg-white rounded-2xl shadow p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Zukünftige Erlebnisse</h3>
        <ul className="space-y-2 text-gray-700 list-disc list-inside">
          {(user.upcoming || []).map((exp: string, i: number) => (
            <li key={i}>{exp}</li>
          ))}
        </ul>
      </div>

      {/* Vergangene Erlebnisse */}
      <div className="bg-white rounded-2xl shadow p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Vergangene Erlebnisse</h3>
        <ul className="space-y-2 text-gray-700 list-disc list-inside">
          {(user.past || []).map((exp: string, i: number) => (
            <li key={i}>{exp}</li>
          ))}
        </ul>
      </div>

      {/* Luma Reise Popup */}
      {showRankPopup && (
        <RankJourney onClose={() => setShowRankPopup(false)} ranks={ranks} />
      )}

    </div>
  );
}
