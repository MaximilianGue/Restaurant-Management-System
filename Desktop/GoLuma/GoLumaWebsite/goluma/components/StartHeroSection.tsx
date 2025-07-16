import { useState, useRef } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export default function StartHeroSection() {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [location, setLocation] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const locationInputRef = useRef<HTMLInputElement>(null);
  const hasFetchedLocationRef = useRef(false); // verhindert mehrfache Abfragen

  const fetchSuggestions = async (query: string) => {
    if (query.length < 2) return setSuggestions([]);
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`);
    const data = await res.json();
    const names = data.map((item: any) => item.display_name);
    setSuggestions(names);
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocation(value);
    fetchSuggestions(value);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setLocation(suggestion);
    setSuggestions([]);
    if (locationInputRef.current) {
      locationInputRef.current.value = suggestion;
    }
  };

  // 📍 Hole Standort bei Fokus, aber nur einmal
  const handleFocus = () => {
    if (hasFetchedLocationRef.current) return;

    if (!navigator.geolocation) {
      alert('Geolocation wird nicht unterstützt');
      return;
    }

    hasFetchedLocationRef.current = true;

    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        const data = await res.json();
        const address =
          data?.address?.city ||
          data?.address?.town ||
          data?.address?.village ||
          data?.address?.state ||
          'Unbekannt';
        setLocation(address);
        if (locationInputRef.current) {
          locationInputRef.current.value = address;
        }
      } catch (err) {
        alert('Ort konnte nicht ermittelt werden');
      }
    });
  };

  return (
    <section className="w-full overflow-hidden m-0 p-0">
      <div
        className="w-full h-[70vh] bg-cover bg-center flex items-center justify-center"
        style={{
          backgroundImage: "url('/background/background.png')",
          margin: 0,
          padding: 0,
        }}
      >
        <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-xl shadow-lg p-6 w-full max-w-3xl mx-4">
          <h1 className="text-3xl font-bold text-center mb-4 text-gray-800">
            Entdecke <span className="text-orange-500">go</span>Luma
          </h1>

          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Ort Input */}
            <div className="relative">
              <input
                type="text"
                ref={locationInputRef}
                placeholder="Region oder Ort eingeben"
                className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm"
                onFocus={handleFocus}
                onChange={handleLocationChange}
                value={location}
              />
              {suggestions.length > 0 && (
                <ul className="absolute z-20 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-40 overflow-y-auto text-sm">
                  {suggestions.map((sug, i) => (
                    <li
                      key={i}
                      onClick={() => handleSuggestionClick(sug)}
                      className="px-4 py-2 hover:bg-orange-100 cursor-pointer"
                    >
                      {sug}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Datum Picker */}
            <DatePicker
              selected={startDate}
              onChange={(date: Date | null) => setStartDate(date)}
              placeholderText="Datum auswählen"
              className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm"
              minDate={new Date()}
            />

            {/* Button */}
            <button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2 rounded-md text-sm">
              Suchen
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
