import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';

export default function AccessGate() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fromRedirect = sessionStorage.getItem('fromRedirect') === 'true';

    if (document.cookie.includes('goluma-access=1') && !fromRedirect) {
      router.replace('/');
    }

    // Zurücksetzen für künftige Navigationen
    sessionStorage.removeItem('fromRedirect');
  }, []);


  const handleAccess = async () => {
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push('/');
    } else {
      setError('Falsches Passwort. Versuch es erneut.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-orange-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-xl w-full space-y-6 border border-orange-200 relative">
        
        {/* Logo oben */}
        <div className="flex justify-center mb-4">
          <Image src="/logo.png" alt="GoLuma Logo" width={220} height={80} />
        </div>

        <h1 className="text-3xl font-bold text-center text-orange-600">Dein Leben. Dein Abenteuer</h1>

        <div className="mt-4 text-center text-gray-600 text-sm leading-relaxed">
          <p className="mb-2 font-semibold text-orange-500 uppercase tracking-widest">Coming Soon</p>
          <p>
            Bald ist es soweit! Dann kannst du endlich die besten Events & Erlebnisse in Tirol direkt bei uns buchen – ob Adrenalin-Abenteuer, romantisches Getaway oder Familienausflug.
          </p>
          <p className="mt-2">
            Mach deinen Urlaub unvergesslich – mit Erlebnissen, die berühren, begeistern und verbinden. GoLuma steht für Qualität, Emotion und digitale Einfachheit.
          </p>
        </div>

        <div className="pt-6">
          <input
            type="password"
            placeholder="🔐 Passwort eingeben..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          />

          {error && <p className="text-sm text-red-500 text-center mt-2">{error}</p>}

          <button
            onClick={handleAccess}
            className="mt-4 w-full bg-orange-500 text-white rounded-md py-2 font-semibold hover:bg-orange-600 transition"
          >
            Weiter zu GoLuma
          </button>
        </div>
      </div>
    </div>
  );
}
