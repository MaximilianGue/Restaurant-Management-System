// pages/api/testdb.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import pool from '../../lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const result = await pool.query('SELECT * FROM users');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('DB Test Error:', error);
    res.status(500).json({ error: 'DB test failed' });
  }
}
