import { boolean, integer, pgTable, serial, text, timestamp, unique } from 'drizzle-orm/pg-core';
import { user } from './auth.schema';

export const userCountry = pgTable(
	'user_country',
	{
		id: serial('id').primaryKey(),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		countryCode: text('country_code').notNull(),
		createdAt: timestamp('created_at').defaultNow().notNull()
	},
	(table) => [unique().on(table.userId, table.countryCode)]
);

export const userLanguage = pgTable(
	'user_language',
	{
		id: serial('id').primaryKey(),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		languageCode: text('language_code').notNull(),
		createdAt: timestamp('created_at').defaultNow().notNull()
	},
	(table) => [unique().on(table.userId, table.languageCode)]
);

export const movieListItem = pgTable('movie_list_item', {
	id: serial('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	title: text('title').notNull(),
	listType: text('list_type', { enum: ['want_to_watch', 'watched'] }).notNull(),
	tmdbId: integer('tmdb_id'),
	posterPath: text('poster_path'),
	genres: text('genres'),
	director: text('director'),
	favourite: boolean('favourite').default(false).notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull()
});

export const fhRecommendation = pgTable('fh_recommendation', {
	id: serial('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	batchGeneratedAt: timestamp('batch_generated_at').notNull(),
	tmdbId: integer('tmdb_id'),
	title: text('title').notNull(),
	posterPath: text('poster_path'),
	genres: text('genres'),
	director: text('director'),
	country: text('country'),
	language: text('language'),
	isIndependent: boolean('is_independent').default(false).notNull(),
	pitch: text('pitch'),
	funFact: text('fun_fact'),
	sortOrder: integer('sort_order').default(0).notNull()
});

export * from './auth.schema';
