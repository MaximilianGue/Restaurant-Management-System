// pages/api/register.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '../../lib/db';
import bcrypt from 'bcrypt';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { name, email, password, birthdate, gender } = req.body;



  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Alle Felder sind erforderlich.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

   await pool.query(
    'INSERT INTO users (name, email, password, birthdate, gender) VALUES ($1, $2, $3, $4, $5)',
    [name, email, hashedPassword, birthdate, gender]
  );


    res.status(200).json({ message: 'Benutzer registriert' });
  } catch (err: any) {
    console.error(err);
    if (err.code === '23505') {
      return res.status(409).json({ error: 'E-Mail ist bereits registriert' });
    }
    res.status(500).json({ error: 'Serverfehler' });
  }
}
