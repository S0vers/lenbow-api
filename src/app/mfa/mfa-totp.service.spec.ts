import { Test, TestingModule } from '@nestjs/testing';
import { MfaTotpService } from './mfa-totp.service';

describe('MfaTotpService', () => {
	let service: MfaTotpService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [MfaTotpService],
		}).compile();

		service = module.get<MfaTotpService>(MfaTotpService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	describe('generateSecret', () => {
		it('should return a base32 string', () => {
			const secret = service.generateSecret();
			expect(secret).toMatch(/^[A-Z2-7]+=*$/i);
			expect(secret.length).toBeGreaterThan(20);
		});

		it('should return different secrets on each call', () => {
			const a = service.generateSecret();
			const b = service.generateSecret();
			expect(a).not.toBe(b);
		});
	});

	describe('generateToken and verifyToken', () => {
		it('should generate and verify token for same secret and time', () => {
			const secret = service.generateSecret();
			const timestamp = Date.now();
			const token = service.generateToken(secret, timestamp);
			expect(token).toMatch(/^\d{6}$/);
			expect(service.verifyToken(secret, token, timestamp)).toBe(true);
		});

		it('should reject wrong token', () => {
			const secret = service.generateSecret();
			const timestamp = Date.now();
			const token = service.generateToken(secret, timestamp);
			expect(service.verifyToken(secret, '000000', timestamp)).toBe(false);
		});
	});

	describe('generateUri', () => {
		it('should return otpauth URI with issuer and label', () => {
			const secret = service.generateSecret();
			const uri = service.generateUri(secret, 'Test (user@example.com)', 'Lenbow');
			expect(uri).toMatch(/^otpauth:\/\/totp\//);
			expect(uri).toContain('issuer=Lenbow');
			expect(uri).toContain('secret=');
		});
	});

	describe('generateBackupCodes', () => {
		it('should return 10 codes by default', () => {
			const codes = service.generateBackupCodes();
			expect(codes).toHaveLength(10);
		});

		it('should return codes in XXXX-XXXX format', () => {
			const codes = service.generateBackupCodes(5);
			expect(codes).toHaveLength(5);
			codes.forEach(code => {
				expect(code).toMatch(/^[A-Z0-9]{4}-[A-Z0-9]{4}$/);
			});
		});
	});
});
