import type { ConfigService } from '@nestjs/config';
import type { CookieOptions } from 'express';

interface SameSiteCookieConfig {
	sameSite: CookieOptions['sameSite'];
	secure: boolean;
	domain?: string;
}

/** Normalize URL to origin (scheme + host + port) for comparison. Handles URLs without protocol. */
function getOrigin(url: string, isProduction: boolean): string {
	const withProtocol = url.includes('://') ? url : (isProduction ? 'https://' : 'http://') + url;
	try {
		return new URL(withProtocol).origin;
	} catch {
		return withProtocol;
	}
}

/** True if API and frontend(s) are on different origins (cross-origin cookie required). */
function isCrossOriginSetup(configService: ConfigService<any, boolean>): boolean {
	const isProduction = configService.get<string>('NODE_ENV') === 'production';
	const apiUrl = configService.get<string>('API_URL', '');
	const originUrl = configService.get<string>('ORIGIN_URL', '');
	if (!apiUrl || !originUrl) return false;
	const apiOrigin = getOrigin(apiUrl.trim(), isProduction);
	const origins = originUrl.split(',').map(s => getOrigin(s.trim(), isProduction));
	return origins.every(origin => origin !== apiOrigin);
}

export default class AppHelpers {
	/**
	 * Determines if the input is an email or a username.
	 * @param input - The user-provided input.
	 * @returns "email" if the input is an email, "username" otherwise.
	 */
	static detectInputType(input: string): 'EMAIL' | 'USERNAME' {
		// Regular expression to validate email format
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(input) ? 'EMAIL' : 'USERNAME';
	}

	/**
	 * Generates a random OTP of the specified length.
	 * @param length - The length of the OTP to generate.
	 * @returns The generated OTP.
	 * @throws An error if the length is less than 4.
	 */
	static OTPGenerator(length: number = 4): number {
		if (length < 4) {
			throw new Error('The OTP length must be at least 4.');
		}

		const min = Math.pow(10, length - 1);
		const max = Math.pow(10, length) - 1;
		return Math.floor(Math.random() * (max - min + 1) + min);
	}

	/**
	 * Generate OTP expiry time.
	 * @param expiryTime - The expiry time in minutes.
	 * @returns The expiry time in Date format.
	 */
	static OTPExpiry(expiryTime: number = 5): Date {
		const now = new Date();
		return new Date(now.getTime() + expiryTime * 60000);
	}

	/**
	 * Determines the appropriate SameSite and secure settings for cookies based on environment variables.
	 * @param configService - NestJS ConfigService instance
	 * @returns The SameSite and secure settings for cookies.
	 */
	static sameSiteCookieConfig(configService: ConfigService<any, boolean>): SameSiteCookieConfig {
		const crossOrigin = isCrossOriginSetup(configService);
		// Cross-origin (e.g. dashboard on different domain/port than API) requires SameSite=none + Secure=true
		const sameSite = crossOrigin
			? ('none' as CookieOptions['sameSite'])
			: (configService.get<CookieOptions['sameSite']>('COOKIE_SAME_SITE', 'lax'));
		const secure = crossOrigin
			? true // Required when SameSite=none
			: configService.get<string>('COOKIE_SECURE') === 'true';
		const domain = configService.get<string>('COOKIE_DOMAIN');

		const config: SameSiteCookieConfig = {
			sameSite,
			secure,
		};

		if (domain) {
			config.domain = domain;
		}

		return config;
	}
}
