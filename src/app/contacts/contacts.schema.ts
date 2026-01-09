import z from 'zod';
import { baseQuerySchema, SortableField } from '../../core/validators/baseQuery.schema';

const CONTACT_SORTABLE_FIELDS: readonly SortableField[] = [
	{ name: 'id', queryName: 'id' },
	{ name: 'name', queryName: 'name' },
	{ name: 'email', queryName: 'email' },
	{ name: 'createdAt', queryName: 'createdAt' },
] as const;

export const contactQuerySchema = baseQuerySchema(CONTACT_SORTABLE_FIELDS);

export type ContactQuerySchemaType = z.infer<typeof contactQuerySchema>;
