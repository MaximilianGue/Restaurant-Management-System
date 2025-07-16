import { useEffect, useState } from 'react';
import Image from 'next/image';
import ExperienceModal from '../components/ExperienceModal';
import StartHeroSection from '../components/StartHeroSection';
import ExperienceFilters from '../components/ExperienceFilters';

export default function Home() {
  const [experiences, setExperiences] = useState<any[]>([]);
  const [selectedExperience, setSelectedExperience] = useState<any | null>(null);
  const [filters, setFilters] = useState<any>({});

  // Holt Erlebnisse basierend auf Filtern
  const fetchExperiences = async () => {
    const params = new URLSearchParams();

    if (filters.tags?.length) params.append('tags', filters.tags.join(','));
    if (filters.minRating) params.append('minRating', filters.minRating);
    if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
    if (filters.sort) params.append('sort', filters.sort);

    const res = await fetch(`/api/experiences?${params.toString()}`);
    const data = await res.json();
    setExperiences(data);
  };

  useEffect(() => {
    fetchExperiences();
  }, [filters]);

  return (
    <div className="overflow-x-hidden">
      <StartHeroSection />

      <div className="bg-gray-50 min-h-screen py-12 sm:px-6 lg:px-8">
        <ExperienceFilters onFilterChange={setFilters} />

        <h1 className="text-4xl font-extrabold text-gray-900 mb-10 text-center">
          Deine nächsten Abenteuer
        </h1>

        {experiences.length === 0 ? (
          <p className="text-center text-gray-500">Keine Erlebnisse gefunden.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {experiences.map((exp, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                <div className="relative w-full h-56">
                  <Image
                    src={exp.images?.[0] || '/default.jpg'}
                    alt={exp.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-5">
                  <h2 className="text-xl font-semibold text-gray-800">{exp.title}</h2>
                  <p className="text-gray-600 mt-2">{exp.description}</p>
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-orange-600 font-bold">{exp.price}</span>
                    <button
                      className="bg-orange-500 text-white px-4 py-2 rounded-full text-sm hover:bg-orange-600 transition"
                      onClick={() => setSelectedExperience(exp)}
                    >
                      Jetzt buchen
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedExperience && (
          <ExperienceModal
            experience={selectedExperience}
            onClose={() => setSelectedExperience(null)}
            onBook={() => console.log('Buchen gedrückt')}
            otherExperiences={experiences.filter((e) => e.title !== selectedExperience.title)}
            setSelectedExperience={setSelectedExperience}
          />
        )}
      </div>
    </div>
  );
}
