export type CloudflareImageOptions = {
	width?: number;
	height?: number;
	quality?: number;
	format?: 'auto' | 'webp' | 'avif';
	fit?: 'scale-down' | 'cover' | 'contain';
	dpr?: number;
};

export type CloudflareImageConfig = {
	enabled: boolean;
	origin: string;
};

const buildCloudflareImageParams = (options: CloudflareImageOptions): string => {
	const params: string[] = [];
	if (options.width) params.push(`width=${options.width}`);
	if (options.height) params.push(`height=${options.height}`);
	if (options.dpr) params.push(`dpr=${options.dpr}`);
	params.push(`fit=${options.fit ?? 'scale-down'}`);
	if (options.quality) params.push(`quality=${options.quality}`);
	params.push(`format=${options.format ?? 'auto'}`);
	return params.join(',');
};

export const buildCloudflareImageUrl = (
	url: string,
	options: CloudflareImageOptions,
	config: CloudflareImageConfig
): string => {
	if (!config.enabled) {
		return url;
	}

	try {
		const parsed = new URL(url);
		if (parsed.origin !== config.origin) {
			return url;
		}
		if (parsed.pathname.startsWith('/cdn-cgi/image/')) {
			return url;
		}

		const params = buildCloudflareImageParams(options);
		return `${parsed.origin}/cdn-cgi/image/${params}${parsed.pathname}`;
	} catch {
		return url;
	}
};
