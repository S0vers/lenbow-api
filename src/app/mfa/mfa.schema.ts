import { z } from 'zod';

export const mfaVerifySetupSchema = z.object({
	token: z.string().length(6, 'Verification token must be exactly 6 digits').regex(/^\d{6}$/),
});

export const mfaVerifyLoginSchema = z.object({
	userId: z.number().int().min(1, 'User ID is required'),
	token: z
		.string()
		.min(6, 'MFA token must be at least 6 characters')
		.max(9, 'MFA token must be at most 9 characters')
		.regex(/^[0-9A-Z-]+$/i, 'MFA token must contain only numbers, letters, and dashes'),
});

export const mfaDisableSchema = z.object({
	password: z.string().min(1, 'Password is required'),
});

export type MfaVerifySetupDto = z.infer<typeof mfaVerifySetupSchema>;
export type MfaVerifyLoginDto = z.infer<typeof mfaVerifyLoginSchema>;
export type MfaDisableDto = z.infer<typeof mfaDisableSchema>;
