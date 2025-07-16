'use client';

import Image from 'next/image';
import { useState } from 'react';

type Rank = {
  name: string;
  points: number;
  benefit: string;
};

type Props = {
  onClose: () => void;
  ranks: Rank[];
};

export default function RankJourney({ onClose, ranks }: Props) {
  const [hoverGender, setHoverGender] = useState<Record<string, 'male' | 'female'>>({});

  const getImageSrc = (rankName: string) => {
    const normalized = rankName === 'Christoph Columbus'
      ? 'Christoph_Kolumbus'
      : rankName === 'Neil Armstrong'
      ? 'Astronout' // falls dein Bild noch falsch benannt ist
      : rankName.replace(' ', '_');

    const gender = hoverGender[rankName] || 'female'; // default: female
    return `/user/${normalized}_${gender}.png`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl p-8 max-w-3xl w-full relative shadow-lg overflow-y-auto max-h-[90vh]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl"
        >
          ×
        </button>

        <h2 className="text-2xl font-bold text-center mb-8 text-gray-800">Deine Luma Reise</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {ranks.map((rank, i) => (
            <div
              key={i}
              className="flex items-center space-x-4 p-4 rounded-lg border shadow-sm hover:shadow-md transition"
              onMouseEnter={() =>
                setHoverGender((prev) => ({
                  ...prev,
                  [rank.name]: prev[rank.name] === 'male' ? 'female' : 'male',
                }))
              }
              onMouseLeave={() =>
                setHoverGender((prev) => ({
                  ...prev,
                  [rank.name]: prev[rank.name] === 'male' ? 'female' : 'male',
                }))
              }
            >
              <div className="relative w-16 h-16 rounded-full overflow-hidden shadow border flex-shrink-0">
                <Image
                  src={getImageSrc(rank.name)}
                  alt={rank.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <p className="font-semibold text-gray-800">{rank.name}</p>
                <p className="text-sm text-gray-600">{rank.points}+ Punkte – {rank.benefit}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
