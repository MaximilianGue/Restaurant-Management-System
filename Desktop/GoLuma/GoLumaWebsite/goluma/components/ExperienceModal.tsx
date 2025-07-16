import React, { useState } from 'react';
import Image from 'next/image';
import Calendar from 'react-calendar';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';


type Props = {
  experience: any;
  onClose: () => void;
  onBook?: () => void;
  otherExperiences: any[];
  setSelectedExperience: (exp: any) => void;
};

export default function ExperienceModal({
  experience,
  onClose,
  onBook,
  otherExperiences,
  setSelectedExperience,
}: Props) {
  const [activeTab, setActiveTab] = useState<'allgemein' | 'bewertung' | 'aehnlich'>('allgemein');
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [imageIndex, setImageIndex] = useState(0);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const images = experience.images || ['/default.jpg'];

  const prevImage = () => {
    setImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextImage = () => {
    setImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 px-4">
      <div className="bg-white rounded-lg w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 shadow-lg relative">

        <button onClick={onClose} className="absolute top-3 right-4 text-xl">×</button>

        <h2 className="text-2xl font-bold mb-4">{experience.title}</h2>

        {/* Bild-Slider mit Pfeilen */}
        <div className="relative w-full h-64 mb-4 rounded overflow-hidden">
          <Image
            src={images[imageIndex]}
            alt={`Bild ${imageIndex + 1}`}
            fill
            className="object-cover"
          />
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-40 text-white px-3 py-1 rounded-full hover:bg-opacity-70"
              >
                ‹
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-40 text-white px-3 py-1 rounded-full hover:bg-opacity-70"
              >
                ›
              </button>
            </>
          )}
        </div>

        {/* Tabs */}
        <div className="flex justify-around mt-4 border-b">
          {['allgemein', 'bewertung', 'aehnlich'].map((tab) => (
            <button
              key={tab}
              className={`px-4 py-2 ${activeTab === tab ? 'border-b-2 border-orange-500 font-semibold' : 'text-gray-500'}`}
              onClick={() => setActiveTab(tab as any)}
            >
              {tab === 'allgemein' ? 'Allgemein' : tab === 'bewertung' ? 'Bewertung' : 'Ähnliches'}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === 'allgemein' && (
            <>
              <p className="text-gray-700 mb-4">{experience.description}</p>
              <p className="text-sm text-gray-500 mb-2">📍 Ort: Kitzbühel</p>
              <p className="text-sm text-gray-500 mb-4">⏱️ Dauer: 2 Stunden</p>

              <div className="mt-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">📅 Buchung auswählen</h3>

                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm w-fit mx-auto flex flex-col items-center gap-6">
                    
                    {/* 📅 Datumsauswahl */}
                    <div>
                    <p className="text-sm text-gray-600 mb-2 text-center">Wähle ein Datum:</p>
                    <DatePicker
                        selected={selectedDate}
                        onChange={(date: Date) => setSelectedDate(date)}
                        dateFormat="dd.MM.yyyy"
                        minDate={new Date()}
                        inline
                        calendarClassName="!border-none !shadow-none !text-base"
                        dayClassName={() =>
                        "rounded-md hover:bg-orange-100 transition text-gray-800 w-10 h-10 flex items-center justify-center"
                        }
                    />
                    </div>

                    {/* 🕒 Uhrzeitauswahl */}
                    <div className="w-full flex flex-col items-center">
                        <p className="text-sm text-gray-600 mb-2">Wähle eine Uhrzeit:</p>

                        <div className="grid grid-cols-3 gap-3">
                            {['09:00', '10:30', '12:00', '13:30', '15:00', '16:30'].map((time) => (
                            <button
                                key={time}
                                onClick={() => setSelectedTime(time)}
                                className={`px-4 py-2 rounded border text-sm font-medium transition ${
                                selectedTime === time
                                    ? 'bg-orange-500 text-white border-orange-600'
                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-orange-100'
                                }`}
                            >
                                {time}
                            </button>
                            ))}
                        </div>
                    </div>


                    {/* Anzeige */}
                   <p className="text-center text-sm text-gray-500 mt-4">
                    Ausgewählt:{' '}
                    <span className="text-orange-600 font-semibold">
                        {selectedDate
                        ? `${selectedDate.toLocaleDateString('de-DE', {
                            weekday: 'short',
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            })}${selectedTime ? `, ${selectedTime}` : ''}`
                        : '–'}
                    </span>
                    </p>

                </div>
                </div>


            </>
          )}

          {activeTab === 'bewertung' && (
            <div>
              <p className="text-yellow-500 text-xl">★★★★☆ (4.5/5)</p>
              <ul className="mt-4 space-y-3">
                <li className="text-sm text-gray-700">„Tolles Erlebnis, super Guide!“</li>
                <li className="text-sm text-gray-700">„Ein echtes Abenteuer. Würde ich wieder machen.“</li>
              </ul>
            </div>
          )}

          {activeTab === 'aehnlich' && (
            <div>
              <p className="text-sm text-gray-500 mb-2">Weitere Vorschläge:</p>
              <ul className="space-y-2">
                {otherExperiences.map((exp, i) => (
                  <li
                    key={i}
                    className="text-sm text-blue-600 underline cursor-pointer"
                    onClick={() => {
                      onClose();
                      setTimeout(() => {
                        setSelectedExperience(exp);
                      }, 100);
                    }}
                  >
                    {exp.title}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Buchen-Button */}
        {activeTab === 'allgemein' && (
          <button
            onClick={onBook}
            className="w-full bg-orange-500 text-white py-2 mt-6 rounded hover:bg-orange-600"
          >
            Jetzt buchen
          </button>
        )}
      </div>
    </div>
  );
}
