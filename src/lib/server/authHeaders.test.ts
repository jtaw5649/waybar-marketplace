import { describe, it, expect } from 'vitest';
import { acceptHeaders, authHeaders, jsonHeaders } from './authHeaders';

describe('authHeaders', () => {
	it('adds Authorization when token is provided', () => {
		const headers = authHeaders('token');
		expect(headers).toEqual({ Authorization: 'Bearer token' });
	});

	it('keeps headers unchanged when token is missing', () => {
		const headers = authHeaders();
		expect(headers).toEqual({});
	});

	it('preserves existing headers', () => {
		const headers = authHeaders('token', { Accept: 'application/json' });
		expect(headers).toEqual({ Accept: 'application/json', Authorization: 'Bearer token' });
	});
});

describe('jsonHeaders', () => {
	it('adds Content-Type and Authorization', () => {
		const headers = jsonHeaders('token');
		expect(headers).toEqual({
			Accept: 'application/json',
			'Content-Type': 'application/json',
			Authorization: 'Bearer token'
		});
	});

	it('adds Content-Type without Authorization when token is missing', () => {
		const headers = jsonHeaders();
		expect(headers).toEqual({ Accept: 'application/json', 'Content-Type': 'application/json' });
	});
});

describe('acceptHeaders', () => {
	it('adds Accept and Authorization', () => {
		const headers = acceptHeaders('token');
		expect(headers).toEqual({ Accept: 'application/json', Authorization: 'Bearer token' });
	});

	it('adds Accept without Authorization when token is missing', () => {
		const headers = acceptHeaders();
		expect(headers).toEqual({ Accept: 'application/json' });
	});

	it('preserves existing headers', () => {
		const headers = acceptHeaders('token', { 'X-Trace': 'on' });
		expect(headers).toEqual({
			'X-Trace': 'on',
			Accept: 'application/json',
			Authorization: 'Bearer token'
		});
	});
});
