import z from 'zod';
import {
	validateBoolean,
	validateEmail,
	validatePassword,
	validatePhoneNumber,
	validateString,
} from '../../core/validators/commonRules';

export const loginSchema = z.object({
	email: validateEmail,
	password: validateString('Password'),
});

export const registerSchema = z.object({
	name: validateString('Name').optional(),
	email: validateEmail,
	password: validatePassword,
	image: validateString('Image').optional(),
	phone: validatePhoneNumber('Phone').optional(),
});

export const updateProfileSchema = z.object({
	name: validateString('Name').optional(),
	image: validateString('Image').optional(),
	phone: validatePhoneNumber('Phone').optional(),
	is2faEnabled: validateBoolean('is2faEnabled').optional(),
	receiveTransactionEmails: validateBoolean('receiveTransactionEmails').optional(),
});

export const updateEmailPreferencesSchema = z.object({
	receiveTransactionEmails: validateBoolean('receiveTransactionEmails'),
});

export const unsubscribeSchema = z.object({
	token: validateString('Token'),
});

export type LoginDto = z.infer<typeof loginSchema>;
export type RegisterDto = z.infer<typeof registerSchema>;
export type UpdateProfileDto = z.infer<typeof updateProfileSchema>;
export type UpdateEmailPreferencesDto = z.infer<typeof updateEmailPreferencesSchema>;
export type UnsubscribeDto = z.infer<typeof unsubscribeSchema>;
