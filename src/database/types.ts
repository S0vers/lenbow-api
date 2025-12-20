import type { InferSelectModel } from 'drizzle-orm';
import { accounts, sessions, users } from 'src/models/drizzle/auth.model';
import { transactionStatusEnum, transactionTypeEnum } from 'src/models/drizzle/enum.models';
import { transactions } from 'src/models/drizzle/transactions.model';

export type UserSchemaType = InferSelectModel<typeof users>;
export type AccountSchemaType = InferSelectModel<typeof accounts>;
export type SessionSchemaType = InferSelectModel<typeof sessions>;
export type TransactionSchemaType = InferSelectModel<typeof transactions>;

/**
 * Enum Schema Types
 */
export type TransactionTypeEnum = (typeof transactionTypeEnum.enumValues)[number];
export type TransactionStatusEnum = (typeof transactionStatusEnum.enumValues)[number];
