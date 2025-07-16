import Head from 'next/head';
import Link from 'next/link';

export default function Join() {
  return (
    <>
      <Head>
        <title>Join Us – GoLuma</title>
      </Head>
      <main className="max-w-6xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold text-gray-800 text-center mb-12">
          Werde Teil von GoLuma
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Erlebnisanbieter */}
          <div className="bg-white p-6 rounded-xl shadow space-y-4 border border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-800">Für Erlebnisanbieter</h2>
            <p className="text-gray-600">
              Du bietest ein spannendes Erlebnis an – z. B. Canyoning, Lama-Wanderungen oder Weinverkostungen?
              Dann werde Partner von GoLuma und erreiche neue Zielgruppen.
            </p>
            <p className="text-gray-600">
              Deine Vorteile: moderne Buchungsplattform, automatische Abwicklung, höhere Sichtbarkeit und volle Kontrolle über deine Angebote.
            </p>
             <Link href="/erlebnisbetreiber/register">
              <button className="mt-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-2 rounded-md shadow">
                Account erstellen
              </button>
            </Link>
          </div>

          {/* Hotels */}
          <div className="bg-white p-6 rounded-xl shadow space-y-4 border border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-800">Für Hotels</h2>
            <p className="text-gray-600">
              Biete deinen Gästen mehr als nur eine Unterkunft: Mit GoLuma kannst du Erlebnisse direkt mitverkaufen oder für deine Gäste buchen.
            </p>
            <p className="text-gray-600">
              Erhöhe deine Buchungszahlen, schaffe Zusatznutzen und steigere die Aufenthaltsqualität – digital, unkompliziert und provisionsbasiert.
            </p>

            <button
              disabled
              className="mt-4 bg-gray-200 text-gray-500 font-semibold px-5 py-2 rounded-md shadow cursor-not-allowed flex items-center gap-2"
            >
              <span>🔒 Coming soon</span>
            </button>
          </div>

        </div>
      </main>
    </>
  );
}
