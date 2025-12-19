export enum ApiErrorType {
	Network = 'network',
	Unauthorized = 'unauthorized',
	Forbidden = 'forbidden',
	NotFound = 'not_found',
	ClientError = 'client_error',
	ServerError = 'server_error',
	Parse = 'parse',
	Unknown = 'unknown'
}

export interface ClassifiedError {
	type: ApiErrorType;
	message: string;
	userMessage: string;
	statusCode?: number;
}

export function classifyApiError(error: unknown, statusCode?: number): ClassifiedError {
	if (statusCode !== undefined) {
		return classifyHttpStatus(statusCode);
	}

	if (error instanceof TypeError) {
		return {
			type: ApiErrorType.Network,
			message: 'Unable to connect to server',
			userMessage: 'Unable to connect to server. Please check your internet connection.'
		};
	}

	if (error instanceof DOMException && error.name === 'AbortError') {
		return {
			type: ApiErrorType.Network,
			message: 'Request was aborted',
			userMessage: 'Request timed out. Please try again.'
		};
	}

	if (error instanceof SyntaxError) {
		return {
			type: ApiErrorType.Parse,
			message: 'Invalid response from server',
			userMessage: 'Received invalid data from server. Please try again.'
		};
	}

	return {
		type: ApiErrorType.Unknown,
		message: error instanceof Error ? error.message : 'Unknown error',
		userMessage: 'An unexpected error occurred. Please try again.'
	};
}

function classifyHttpStatus(status: number): ClassifiedError {
	if (status === 401) {
		return {
			type: ApiErrorType.Unauthorized,
			message: 'Unauthorized',
			userMessage: 'Please log in to continue.',
			statusCode: status
		};
	}

	if (status === 403) {
		return {
			type: ApiErrorType.Forbidden,
			message: 'Forbidden',
			userMessage: 'You do not have permission to access this resource.',
			statusCode: status
		};
	}

	if (status === 404) {
		return {
			type: ApiErrorType.NotFound,
			message: 'Not found',
			userMessage: 'The requested resource was not found.',
			statusCode: status
		};
	}

	if (status >= 400 && status < 500) {
		return {
			type: ApiErrorType.ClientError,
			message: `Client error (HTTP ${status})`,
			userMessage: 'There was a problem with your request.',
			statusCode: status
		};
	}

	if (status >= 500) {
		return {
			type: ApiErrorType.ServerError,
			message: `Server error (HTTP ${status})`,
			userMessage: 'Server error. Please try again later.',
			statusCode: status
		};
	}

	return {
		type: ApiErrorType.Unknown,
		message: `Unexpected status code: ${status}`,
		userMessage: 'An unexpected error occurred.',
		statusCode: status
	};
}
