import { env } from '$env/dynamic/private';
import { getCountryName } from '$lib/data/countries';
import { getLanguageName } from '$lib/data/languages';
import type { getMoviesByUser } from '$lib/server/db/movies';
import type { getUserPreferences } from '$lib/server/db/user-preferences';

const OPENAI_MODEL = 'gpt-4o-mini';

export type LlmRecommendation = {
	title: string;
	year: number;
	country: string;
	language: string;
	isIndependent: boolean;
	pitch: string;
	funFact: string;
};

type RecommendationContext = {
	movies: Awaited<ReturnType<typeof getMoviesByUser>>;
	prefs: Awaited<ReturnType<typeof getUserPreferences>>;
};

type LlmResponse = {
	recommendations: LlmRecommendation[];
};

function formatWatchlist(
	movies: Awaited<ReturnType<typeof getMoviesByUser>>['wantToWatch']
): string {
	if (movies.length === 0) return 'None';
	return movies
		.map((m) => {
			const parts = [m.title];
			if (m.releaseYear) parts.push(`year: ${m.releaseYear}`);
			if (m.genres) parts.push(`genres: ${m.genres}`);
			if (m.director) parts.push(`director: ${m.director}`);
			return `- ${parts.join(', ')}`;
		})
		.join('\n');
}

function formatDiary(
	movies: Awaited<ReturnType<typeof getMoviesByUser>>['watched']
): string {
	if (movies.length === 0) return 'None';
	return movies
		.map((m) => {
			const parts = [m.title];
			if (m.releaseYear) parts.push(`year: ${m.releaseYear}`);
			if (m.genres) parts.push(`genres: ${m.genres}`);
			if (m.director) parts.push(`director: ${m.director}`);
			if (m.rating != null) parts.push(`rating: ${m.rating}/5`);
			if (m.comment) parts.push(`comment: "${m.comment}"`);
			return `- ${parts.join(', ')}`;
		})
		.join('\n');
}

function buildPrompt(context: RecommendationContext): string {
	const { movies, prefs } = context;
	const excludedTitles = [...movies.wantToWatch, ...movies.watched].map((m) => m.title);

	const countryNames = prefs.countries.map(getCountryName).join(', ') || 'Not specified';
	const languageNames = prefs.languages.map(getLanguageName).join(', ') || 'Not specified';
	const genreNames = prefs.genres.join(', ') || 'Not specified';

	return `You are a film curator for Filmheads, an app that helps people discover foreign films.

Based on this user's taste profile, recommend 1 to 3 foreign films they may not have seen or heard of.

User watchlist (want to watch):
${formatWatchlist(movies.wantToWatch)}

User diary (already watched — use ratings and comments as strong taste signals):
${formatDiary(movies.watched)}

User's preferred genres: ${genreNames}
User's preferred countries of interest: ${countryNames}
User's preferred languages: ${languageNames}

Films to EXCLUDE (already on their lists):
${excludedTitles.length > 0 ? excludedTitles.map((t) => `- ${t}`).join('\n') : 'None'}

Guidelines:
- Recommend foreign/non-English-language films (not Hollywood mainstream)
- International film festival favourites are a great source (Cannes, Berlin, Venice, Toronto, etc.)
- Films do not need to be obscure, but should broaden their horizons
- Each recommendation should feel personally relevant to their taste
- Weight diary ratings and comments heavily when inferring taste
- Return between 1 and 3 recommendations

Respond with JSON only, in this exact shape:
{
  "recommendations": [
    {
      "title": "Film title in English or original",
      "year": 2019,
      "country": "Country of origin",
      "language": "Primary language",
      "isIndependent": false,
      "pitch": "2-3 sentences on why this film fits their taste and why they should watch it",
      "funFact": "One interesting fact about the film"
    }
  ]
}`;
}

function parseJsonResponse(content: string): LlmResponse {
	const trimmed = content.trim();
	const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
	const jsonText = fenced ? fenced[1] : trimmed;
	return JSON.parse(jsonText) as LlmResponse;
}

export async function generateFilmRecommendations(
	context: RecommendationContext
): Promise<LlmRecommendation[]> {
	const apiKey = env.OPENAI_API_KEY;
	if (!apiKey) {
		throw new Error('OPENAI_API_KEY is not set');
	}

	const response = await fetch('https://api.openai.com/v1/chat/completions', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${apiKey}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			model: OPENAI_MODEL,
			response_format: { type: 'json_object' },
			messages: [
				{
					role: 'system',
					content:
						'You are a knowledgeable international film curator. Always respond with valid JSON only, no markdown or extra text.'
				},
				{ role: 'user', content: buildPrompt(context) }
			],
			temperature: 0.8
		})
	});

	if (!response.ok) {
		const body = await response.text();
		throw new Error(`OpenAI request failed: ${response.status} ${body}`);
	}

	const data = (await response.json()) as {
		choices: { message: { content?: string } }[];
	};

	const content = data.choices[0]?.message?.content;
	if (!content) {
		throw new Error('OpenAI returned empty response');
	}

	const parsed = parseJsonResponse(content);

	if (!Array.isArray(parsed.recommendations)) {
		throw new Error('OpenAI response missing recommendations array');
	}

	return parsed.recommendations.slice(0, 3);
}
