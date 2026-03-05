import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

const TIME_STEP = 30;
const DIGITS = 6;
const WINDOW = 1;
const BASE32_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

@Injectable()
export class MfaTotpService {
	generateSecret(): string {
		const buffer = crypto.randomBytes(20);
		return this.base32Encode(buffer);
	}

	generateToken(secret: string, timestamp?: number): string {
		const time = Math.floor((timestamp ?? Date.now()) / 1000);
		const timeStep = Math.floor(time / TIME_STEP);

		const secretBuffer = this.base32Decode(secret);
		const timeBuffer = Buffer.alloc(8);
		timeBuffer.writeUInt32BE(0, 0);
		timeBuffer.writeUInt32BE(timeStep, 4);

		const hmac = crypto.createHmac('sha1', secretBuffer);
		hmac.update(timeBuffer);
		const hash = hmac.digest();

		const offset = hash[hash.length - 1]! & 0x0f;
		const code =
			((hash[offset]! & 0x7f) << 24) |
			((hash[offset + 1]! & 0xff) << 16) |
			((hash[offset + 2]! & 0xff) << 8) |
			(hash[offset + 3]! & 0xff);

		return (code % Math.pow(10, DIGITS)).toString().padStart(DIGITS, '0');
	}

	verifyToken(secret: string, token: string, timestamp?: number): boolean {
		const time = timestamp ?? Date.now();
		for (let i = -WINDOW; i <= WINDOW; i++) {
			const testTime = time + i * TIME_STEP * 1000;
			const expectedToken = this.generateToken(secret, testTime);
			if (this.constantTimeCompare(token, expectedToken)) return true;
		}
		return false;
	}

	generateUri(secret: string, label: string, issuer: string): string {
		const params = new URLSearchParams({
			secret,
			issuer,
			algorithm: 'SHA1',
			digits: String(DIGITS),
			period: String(TIME_STEP),
		});
		return `otpauth://totp/${encodeURIComponent(label)}?${params.toString()}`;
	}

	generateBackupCodes(count = 10): string[] {
		const codes: string[] = [];
		for (let i = 0; i < count; i++) {
			const code = crypto.randomBytes(4).toString('hex').toUpperCase();
			codes.push(`${code.slice(0, 4)}-${code.slice(4, 8)}`);
		}
		return codes;
	}

	private base32Encode(buffer: Buffer): string {
		let result = '';
		let bits = 0;
		let value = 0;
		for (const byte of buffer) {
			value = (value << 8) | byte;
			bits += 8;
			while (bits >= 5) {
				bits -= 5;
				result += BASE32_CHARS[(value >>> bits) & 31];
			}
		}
		if (bits > 0) result += BASE32_CHARS[(value << (5 - bits)) & 31];
		return result;
	}

	private base32Decode(encoded: string): Buffer {
		const cleanInput = encoded.toUpperCase().replace(/[^A-Z2-7]/g, '');
		let bits = 0;
		let value = 0;
		const result: number[] = [];
		for (const char of cleanInput) {
			const index = BASE32_CHARS.indexOf(char);
			if (index === -1) continue;
			value = (value << 5) | index;
			bits += 5;
			if (bits >= 8) {
				result.push((value >>> (bits - 8)) & 255);
				bits -= 8;
			}
		}
		return Buffer.from(result);
	}

	private constantTimeCompare(a: string, b: string): boolean {
		if (a.length !== b.length) return false;
		let result = 0;
		for (let i = 0; i < a.length; i++) {
			result |= a.charCodeAt(i) ^ b.charCodeAt(i);
		}
		return result === 0;
	}
}
