// pages/api/update-profile.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '../../lib/db';
import bcrypt from 'bcrypt';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { id, name, password, birthdate, gender, customImage } = req.body;

  try {
    let hashedPassword = null;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const query = `
      UPDATE users
      SET name = $1,
          ${hashedPassword ? 'password = $2,' : ''}
          birthdate = $3,
          gender = $4,
          custom_image = $5
      WHERE id = $6
      RETURNING id, name, email, luma_points, rank, referee_code, birthdate, gender, custom_image
    `;

    const values = hashedPassword
      ? [name, hashedPassword, birthdate, gender, customImage, id]
      : [name, birthdate, gender, customImage, id];

    const result = await pool.query(query, values);
    res.status(200).json({ user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Fehler beim Update' });
  }
}
