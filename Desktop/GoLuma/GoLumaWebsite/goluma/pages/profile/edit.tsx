// pages/profile/edit.tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function EditProfilePage() {
  const [form, setForm] = useState({ name: '', password: '', birthdate: '', gender: '', customImage: '' });
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      const user = JSON.parse(stored);
      setForm({
        name: user.name,
        password: '',
        birthdate: user.birthdate?.slice(0, 10) || '',
        gender: user.gender || '',
        customImage: user.customImage || ''
      });
    }
  }, []);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const stored = localStorage.getItem('user');
    if (!stored) return;
    const user = JSON.parse(stored);

    const res = await fetch('/api/update-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, id: user.id }),
    });

    if (res.ok) {
      const updated = await res.json();
      localStorage.setItem('user', JSON.stringify(updated.user));
      router.push('/profile');
    } else {
      alert('Fehler beim Speichern');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 bg-white p-6 rounded-xl shadow space-y-4">
      <h1 className="text-2xl font-bold mb-4 text-center">Profil bearbeiten</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="name" value={form.name} onChange={handleChange} className="w-full border p-2 rounded" placeholder="Name" />
        <input name="password" value={form.password} onChange={handleChange} className="w-full border p-2 rounded" placeholder="Neues Passwort (optional)" type="password" />
        <input name="birthdate" value={form.birthdate} onChange={handleChange} className="w-full border p-2 rounded" type="date" />
        <select name="gender" value={form.gender} onChange={handleChange} className="w-full border p-2 rounded">
          <option value="">Geschlecht wählen</option>
          <option value="männlich">Männlich</option>
          <option value="weiblich">Weiblich</option>
        </select>
        <input name="customImage" value={form.customImage} onChange={handleChange} className="w-full border p-2 rounded" placeholder="Link zum Profilbild (optional)" />
        <button type="submit" className="w-full bg-orange-500 text-white py-2 rounded hover:bg-orange-600">Speichern</button>
      </form>
    </div>
  );
}
