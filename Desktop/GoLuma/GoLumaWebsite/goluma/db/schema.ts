import { pgTable, serial, text, varchar, timestamp, integer } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }),
  email: varchar('email', { length: 100 }).notNull().unique(),
  password: text('password'), // hashed password
  image: text('image'),
  lumaPoints: integer('luma_points').default(0),
  rank: varchar('rank', { length: 50 }).default('Adventurer'),
  createdAt: timestamp('created_at').defaultNow(),
});
