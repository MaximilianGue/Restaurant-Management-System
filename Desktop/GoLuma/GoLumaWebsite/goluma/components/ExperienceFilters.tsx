import { useState } from 'react';
import { FiFilter } from 'react-icons/fi';
import { FaCheck } from 'react-icons/fa';

type Props = {
  onFilterChange: (filters: any) => void;
};

const ALL_TAGS = ['Outdoor', 'Familienfreundlich', 'Kulinarik', 'Sport', 'Adrenalin', 'Entspannung'];

export default function ExperienceFilters({ onFilterChange }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [distance, setDistance] = useState('');
  const [adults, setAdults] = useState(0);
  const [children, setChildren] = useState(0);
  const [sort, setSort] = useState('');

  const toggleSidebar = () => setIsOpen(!isOpen);

  const handleReset = () => {
    setTags([]);
    setDistance('');
    setAdults(0);
    setChildren(0);
    setSort('');
    onFilterChange({});
  };

  const handleTagToggle = (tag: string) => {
    const updated = tags.includes(tag)
      ? tags.filter((t) => t !== tag)
      : [...tags, tag];
    setTags(updated);
    onFilterChange({ tags: updated, distance, adults, children, sort });
  };

  const updateFilters = (newFilters: Partial<any>) => {
    const filters = {
      tags,
      distance,
      adults,
      children,
      sort,
      ...newFilters,
    };
    onFilterChange(filters);
  };

  return (
    <>
      {/* Filter Toggle */}
      <div className="mb-4 px-4">
        <button
          onClick={toggleSidebar}
          className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-orange-500 hover:bg-orange-600 rounded-md shadow"
        >
          <FiFilter className="text-lg" />
          Filter öffnen
        </button>
      </div>

      {/* Sidebar Panel */}
      <div
        className={`fixed top-0 left-0 h-full w-80 bg-white shadow-2xl transform transition-transform duration-300 z-50 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">Filter</h2>
          <button
            onClick={toggleSidebar}
            className="text-gray-500 hover:text-gray-800 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="p-5 space-y-6 overflow-y-auto text-sm text-gray-700">
          {/* Erlebnisart */}
          <div>
            <label className="block font-medium mb-2">Erlebnisart</label>
            <div className="space-y-2">
              {ALL_TAGS.map((tag) => (
                <label
                  key={tag}
                  className={`flex items-center gap-2 cursor-pointer px-3 py-2 rounded-md border ${
                    tags.includes(tag)
                      ? 'bg-orange-100 border-orange-400 text-orange-800'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={tags.includes(tag)}
                    onChange={() => handleTagToggle(tag)}
                    className="form-checkbox accent-orange-500"
                  />
                  {tag}
                </label>
              ))}
            </div>
          </div>

          {/* Distanz */}
          <div>
            <label className="block font-medium mb-1">Distanz</label>
            <select
              value={distance}
              onChange={(e) => {
                setDistance(e.target.value);
                updateFilters({ distance: e.target.value });
              }}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              <option value="">Alle Distanzen</option>
              <option value="10">0–10 km</option>
              <option value="25">10–25 km</option>
              <option value="50">25–50 km</option>
              <option value="51">50+ km</option>
            </select>
          </div>

          {/* Personen */}
          <div>
            <label className="block font-medium mb-1">Erwachsene</label>
            <input
              type="number"
              min={0}
              value={adults}
              onChange={(e) => {
                const val = Number(e.target.value);
                setAdults(val);
                updateFilters({ adults: val });
              }}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />

            <label className="block font-medium mb-1 mt-3">Kinder</label>
            <input
              type="number"
              min={0}
              value={children}
              onChange={(e) => {
                const val = Number(e.target.value);
                setChildren(val);
                updateFilters({ children: val });
              }}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          {/* Sortieren */}
          <div>
            <label className="block font-medium mb-1">Sortieren nach</label>
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                updateFilters({ sort: e.target.value });
              }}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              <option value="">Standard</option>
              <option value="price_asc">Preis aufsteigend</option>
              <option value="price_desc">Preis absteigend</option>
              <option value="rating_desc">Beste Bewertung</option>
              <option value="distance_asc">Nächste Entfernung</option>
            </select>
          </div>

          {/* Reset Button */}
          <button
            onClick={handleReset}
            className="w-full text-sm text-red-700 bg-red-100 hover:bg-red-200 rounded-md py-2 font-medium transition"
          >
            Filter zurücksetzen
          </button>
        </div>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-40"
          onClick={toggleSidebar}
        />
      )}
    </>
  );
}
