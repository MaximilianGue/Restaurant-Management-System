// pages/api/auth.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { serialize } from 'cookie';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { password } = req.body;

  if (password === 'NullLaunch') {
    const cookie = serialize('goluma-access', '1', {
      path: '/',
      maxAge: 3600,
      sameSite: 'lax',
    });

    res.setHeader('Set-Cookie', cookie);
    res.status(200).json({ success: true });
  } else {
    res.status(401).json({ success: false, message: 'Falsches Passwort' });
  }
}
