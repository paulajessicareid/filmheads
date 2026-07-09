import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';
import { user } from './auth.schema';

export const movieListItem = pgTable('movie_list_item', {
	id: serial('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	title: text('title').notNull(),
	listType: text('list_type', { enum: ['want_to_watch', 'watched'] }).notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull()
});

export * from './auth.schema';
