import { useState } from 'react';
import ExperienceModal from '../../components/ExperienceModal';

export default function ExperiencesPage() {
  const [selectedExperience, setSelectedExperience] = useState(null);

  const handleBook = () => {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (!user) {
      window.location.href = '/login';
      return;
    }

    fetch('/api/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        experienceId: selectedExperience.id,
        userId: user.id,
      }),
    })
      .then(res => res.json())
      .then(data => {
        alert('Erlebnis gebucht!');
        setSelectedExperience(null);
      });
  };

  const exampleExperiences = [
    { id: 1, title: 'Sonnenaufgang am Berg', description: 'Erlebe den Sonnenaufgang...', image: '/exp/sunrise.jpg' },
    { id: 2, title: 'Alpakawanderung', description: 'Spaziere mit Alpakas...', image: '/exp/alpaka.jpg' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Erlebnisse</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {exampleExperiences.map((exp) => (
          <div key={exp.id} className="bg-white p-4 shadow rounded-xl">
            <h2 className="text-xl font-semibold mb-2">{exp.title}</h2>
            <button
              className="bg-orange-500 text-white px-4 py-2 rounded"
              onClick={() => setSelectedExperience(exp)}
            >
              Buchen
            </button>
          </div>
        ))}
      </div>

      {selectedExperience && (
        <ExperienceModal
          experience={selectedExperience}
          onClose={() => setSelectedExperience(null)}
          onBook={handleBook}
        />
      )}
    </div>
  );
}
