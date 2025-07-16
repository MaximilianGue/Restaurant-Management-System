import { useState } from 'react';
import { useRouter } from 'next/router';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem('user', JSON.stringify(data.user));
      router.push('/profile');
    } else {
      alert(data.error);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 space-y-4">
      <h1 className="text-2xl font-bold">Login</h1>
      <input
        type="email"
        placeholder="E-Mail"
        className="w-full border p-2 rounded"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Passwort"
        className="w-full border p-2 rounded"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      <button onClick={handleLogin} className="bg-orange-500 text-white px-4 py-2 rounded">
        Einloggen
      </button>
      <p className="mt-4 text-center text-sm text-gray-600">
        Noch kein Account?{' '}
        <a href="/register" className="text-orange-600 hover:underline">
          Jetzt registrieren
        </a>
      </p>

    </div>
  );
}
