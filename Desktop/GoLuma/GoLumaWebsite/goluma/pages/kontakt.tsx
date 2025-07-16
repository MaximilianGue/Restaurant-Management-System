import { useState } from 'react';

export default function Kontakt() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');

    try {
      const res = await fetch('/api/sendMail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      });

      if (res.ok) {
        setStatus('success');
        setName('');
        setEmail('');
        setMessage('');
      } else {
        setStatus('error');
      }
    } catch (err) {
      setStatus('error');
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-4">Kontakt</h1>
      <p className="mb-6">Du hast Fragen oder Anregungen? Schreib uns gern eine Nachricht!</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full border border-gray-300 rounded-md px-4 py-2"
        />
        <input
          type="email"
          placeholder="E-Mail-Adresse"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full border border-gray-300 rounded-md px-4 py-2"
        />
        <textarea
          placeholder="Deine Nachricht"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          className="w-full border border-gray-300 rounded-md px-4 py-2 h-32 resize-none"
        />
        <button
          type="submit"
          className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2 rounded-md"
          disabled={status === 'sending'}
        >
          {status === 'sending' ? 'Senden...' : 'Nachricht senden'}
        </button>
      </form>

      {status === 'success' && (
        <p className="text-green-600 mt-4">Danke! Deine Nachricht wurde erfolgreich gesendet.</p>
      )}
      {status === 'error' && (
        <p className="text-red-600 mt-4">Fehler beim Senden. Bitte versuche es später erneut.</p>
      )}
    </div>
  );
}
