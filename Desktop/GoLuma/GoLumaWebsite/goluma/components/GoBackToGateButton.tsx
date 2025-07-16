'use client';

import { useRouter } from 'next/navigation';

export default function GoBackToGateButton() {
  const router = useRouter();

  const handleGoBack = () => {
    // Cookie löschen
    document.cookie = 'goluma-access=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';

    // Weiterleitung zum Gate
    router.push('/access');
  };

  return (
    <button
      onClick={handleGoBack}
      className="text-sm text-orange-600 border border-orange-400 px-3 py-1 rounded hover:bg-orange-100 transition"
    >
      Zurück zum Gate
    </button>
  );
}
