import { SessionSchemaType, UserSchemaType } from '../../../database/types';

export type UserWithoutPassword = Omit<UserSchemaType, 'password'>;

export type CreateUser = Omit<
	UserSchemaType,
	'id' | 'publicId' | 'is2faEnabled' | 'createdAt' | 'updatedAt'
>;

export type SessionDataType = Omit<
	SessionSchemaType,
	'id' | 'publicId' | 'isRevoked' | 'createdAt' | 'updatedAt'
> & { twoFactorVerified?: boolean };

// Api Response Types
export type UserWithoutPasswordResponse = Omit<UserSchemaType, 'id' | 'publicId' | 'password'> & {
	id: string;
};
