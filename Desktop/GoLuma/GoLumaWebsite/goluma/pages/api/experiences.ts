import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { tags, minRating, maxPrice, sort } = req.query;

    let query = 'SELECT * FROM experiences';
    const conditions: string[] = [];
    const values: any[] = [];

    if (tags) {
      const tagArray = (tags as string).split(',');
      conditions.push(`tags && $${values.length + 1}`);
      values.push(tagArray);
    }

    if (minRating) {
      conditions.push(`rating >= $${values.length + 1}`);
      values.push(Number(minRating));
    }

    if (maxPrice) {
      // Assumes price is stored like 'ab €59'
      conditions.push(`CAST(REPLACE(price, 'ab €', '') AS FLOAT) <= $${values.length + 1}`);
      values.push(Number(maxPrice));
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    // Optional sorting
    if (sort === 'price_asc') {
      query += ' ORDER BY CAST(REPLACE(price, \'ab €\', \'\') AS FLOAT) ASC';
    } else if (sort === 'price_desc') {
      query += ' ORDER BY CAST(REPLACE(price, \'ab €\', \'\') AS FLOAT) DESC';
    } else if (sort === 'rating_asc') {
      query += ' ORDER BY rating ASC';
    } else if (sort === 'rating_desc') {
      query += ' ORDER BY rating DESC';
    }

    const { rows: experiences } = await pool.query(query, values);

    // Bilder zu jedem Erlebnis laden
    const fullData = await Promise.all(
      experiences.map(async (exp) => {
        const { rows: images } = await pool.query(
          'SELECT image_url FROM experience_images WHERE experience_id = $1',
          [exp.id]
        );
        return {
          ...exp,
          images: images.map((img) => img.image_url),
        };
      })
    );

    res.status(200).json(fullData);
  } catch (err) {
    console.error('Error loading experiences:', err);
    res.status(500).json({ error: 'Fehler beim Laden der Erlebnisse' });
  }
}
