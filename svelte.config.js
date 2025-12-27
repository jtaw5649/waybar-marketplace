import adapter from '@sveltejs/adapter-cloudflare';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter({
			routes: {
				include: ['/*'],
				exclude: ['<all>']
			}
		}),
		csp: {
			mode: 'auto',
			directives: {
				'default-src': ['self'],
				'script-src': ['self', 'https://challenges.cloudflare.com'],
				'style-src': ['self', 'unsafe-inline'],
				'font-src': ['self'],
				'img-src': ['self', 'data:', 'https:'],
				'connect-src': [
					'self',
					'https://barforge-registry-api.jtaw.workers.dev',
					'https://api.barforge.dev',
					...(process.env.NODE_ENV === 'development'
						? ['http://localhost:8787', 'http://127.0.0.1:8787']
						: []),
					'https://challenges.cloudflare.com'
				],
				'frame-src': ['https://challenges.cloudflare.com'],
				'base-uri': ['self'],
				'form-action': ['self'],
				'frame-ancestors': ['none']
			}
		}
	}
};

export default config;
