import { describe, it, expect } from 'vitest';
import { translations, t, detectLocale, SUPPORTED_LOCALES } from '$lib/i18n.js';

describe('SUPPORTED_LOCALES', () => {
	it('includes en and fr', () => {
		expect(SUPPORTED_LOCALES).toContain('en');
		expect(SUPPORTED_LOCALES).toContain('fr');
	});
});

describe('translations', () => {
	it('has same keys for all locales', () => {
		const enKeys = Object.keys(translations.en).sort();
		const frKeys = Object.keys(translations.fr).sort();
		expect(enKeys).toEqual(frKeys);
	});
});

describe('t', () => {
	it('returns English string for known key', () => {
		expect(t('en', 'inhale')).toBe('Inhale...');
	});

	it('returns French string for known key', () => {
		expect(t('fr', 'inhale')).toBe('Inspirez...');
	});

	it('returns key itself for unknown key', () => {
		expect(t('en', 'nonexistent')).toBe('nonexistent');
	});

	it('falls back to English for unknown locale', () => {
		expect(t('de', 'inhale')).toBe('Inhale...');
	});
});

describe('detectLocale', () => {
	it('returns fr for French browser', () => {
		expect(detectLocale('fr-FR')).toBe('fr');
	});

	it('returns en for English browser', () => {
		expect(detectLocale('en-US')).toBe('en');
	});

	it('returns en for unsupported language', () => {
		expect(detectLocale('ja-JP')).toBe('en');
	});
});
