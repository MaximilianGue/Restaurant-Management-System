'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get('type'); // z. B. 'host'

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    company: '',
    phone: '',
    legalForm: '',
    street: '',
    zip: '',
    city: '',
    country: '',
    vatId: '',
    iban: '',
    accountHolder: '',
    bic: '',
  });

  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    const res = await fetch('/api/host/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, role: type || 'host' }),
    });

    if (res.ok) {
      router.push('/login');
    } else {
      setError('Registrierung fehlgeschlagen.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-3xl w-full space-y-6 border border-gray-200">
        <h2 className="text-2xl font-bold text-center text-gray-800">
          Erlebnisanbieter Registrierung
        </h2>

        {/* 👤 Persönliche Daten */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input name="name" placeholder="Ansprechpartner*" value={form.name} onChange={handleChange} className="input" />
          <input name="email" type="email" placeholder="E-Mail*" value={form.email} onChange={handleChange} className="input" />
          <input name="password" type="password" placeholder="Passwort*" value={form.password} onChange={handleChange} className="input" />
          <input name="phone" placeholder="Telefonnummer" value={form.phone} onChange={handleChange} className="input" />
        </div>

        {/* 🧾 Geschäftsinformationen */}
        <h3 className="text-lg font-semibold text-gray-700 mt-6">Geschäftsinformationen</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input name="company" placeholder="Firmenname*" value={form.company} onChange={handleChange} className="input" />
          <input name="legalForm" placeholder="Rechtsform (z. B. GmbH)*" value={form.legalForm} onChange={handleChange} className="input" />
          <input name="street" placeholder="Straße + Nr.*" value={form.street} onChange={handleChange} className="input" />
          <input name="zip" placeholder="PLZ*" value={form.zip} onChange={handleChange} className="input" />
          <input name="city" placeholder="Ort*" value={form.city} onChange={handleChange} className="input" />
          <input name="country" placeholder="Land*" value={form.country} onChange={handleChange} className="input" />
          <input name="vatId" placeholder="USt-ID (optional)" value={form.vatId} onChange={handleChange} className="input" />
        </div>

        {/* 🏦 Bankverbindung */}
        <h3 className="text-lg font-semibold text-gray-700 mt-6">Bankverbindung</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input name="iban" placeholder="IBAN*" value={form.iban} onChange={handleChange} className="input" />
          <input name="accountHolder" placeholder="Kontoinhaber*" value={form.accountHolder} onChange={handleChange} className="input" />
          <input name="bic" placeholder="BIC / SWIFT (optional)" value={form.bic} onChange={handleChange} className="input" />
        </div>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <button
          onClick={handleRegister}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-md font-semibold"
        >
          Registrierung abschließen
        </button>
      </div>
    </div>
  );
}
