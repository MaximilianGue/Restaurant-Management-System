import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function About() {
  const [name, setName] = useState('Maximilian Gühring');

  useEffect(() => {
    const interval = setInterval(() => {
      setName('Maximilian Klein');
      const timeout = setTimeout(() => setName('Maximilian Gühring'), 1000);
      return () => clearTimeout(timeout);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const founders = [
    {
      name: 'Christoph Klein',
      role: 'Gründer der CK invest, Immoware24, Sofort Überweisung, Kitzblitz ...etc',
      image: '/Christoph.jpg',
    },
    {
      name: 'Paul Klein',
      role: 'Schüler und Gründer',
      image: '/Paul.png',
    },
    {
      name,
      role: 'Informatik Student in England und Gründer',
      image: '/Max.jpg',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <h1 className="text-4xl font-bold text-center text-gray-800 mb-12">
        Über uns
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {founders.map((founder, idx) => (
          <div
            key={idx}
            className="flex flex-col items-center text-center space-y-4"
          >
            <div className="w-40 h-40 relative rounded-full overflow-hidden shadow-md">
              <Image
                src={founder.image}
                alt={founder.name}
                fill
                className="object-cover"
              />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              {founder.name}
            </h2>
            <p className="text-gray-600">{founder.role}</p>
          </div>
        ))}
      </div>

      <div className="mt-24">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Unsere Mission
        </h2>
        <div className="bg-white p-6 rounded-lg shadow-lg text-gray-700 leading-relaxed space-y-4">
          <p>
            <strong>GoLuma</strong> ist mehr als nur eine Plattform – wir verstehen uns als
            Erlebnisnetzwerk, das Menschen besondere Momente ermöglicht, die ein Leben lang
            in Erinnerung bleiben. Ob romantisches Candlelight-Dinner, aufregender
            Helikopterflug oder entspannte Kajaktour – GoLuma macht hochwertige Erlebnisse
            sichtbar, buchbar und emotional greifbar.
          </p>
          <p>
            Unser Ziel ist es, regionale Erlebnisanbieter mit Hotels und Gästen zu vernetzen –
            digital, effizient und nutzerfreundlich. Wir starten in Österreich, expandieren
            nach Deutschland und die Schweiz, mit dem langfristigen Ziel, eine europaweite
            Erlebniswelt aufzubauen.
          </p>
          <p>
            Hotels profitieren mehrfach von GoLuma: Sie können über unsere Plattform eigene
            Erlebnis-Pakete verkaufen oder direkt für ihre Gäste buchen. Zusätzlich erhalten sie
            auf Wunsch eine Co-Branding-Unterseite, auf der ihr Hotelname im Fokus steht –
            unterstützt durch die technologische Infrastruktur und Erlebnisse von GoLuma.
          </p>
          <p>
            Die Zusammenarbeit ist unkompliziert, transparent und zukunftsorientiert: GoLuma
            übernimmt Technik, Vermarktung und Erlebnisvielfalt – Hotels konzentrieren sich auf
            ihre Gastgeber-Qualitäten. Für jede vermittelte Buchung erhalten Hotels eine faire
            Marge von 7–10 %.
          </p>
          <p>
            GoLuma ist somit nicht nur eine Erlebnisplattform, sondern ein digitales Tool, das
            Hotels dabei unterstützt, sich neu zu positionieren, ihren Gästen mehr Service zu
            bieten und die Aufenthaltsqualität zu steigern.
          </p>
          <p>
            Wer Teil unseres Netzwerks werden möchte, kann sich jederzeit bei uns melden –
            über das Kontaktformular oder per Mail an{' '}
            <a
              href="mailto:golumagmbh@gmail.com"
              className="text-blue-600 hover:underline"
            >
              golumagmbh@gmail.com
            </a>
            .
          </p>
        </div>

      </div>
    </div>
  );
}
