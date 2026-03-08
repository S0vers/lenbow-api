import z from 'zod';
import { validateString } from '../../core/validators/commonRules';

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const createBudgetCategorySchema = z.object({
	name: validateString('Name', { min: 1, max: 100 }),
	slug: validateString('Slug', { max: 100, regex: slugRegex, regexMsg: 'Slug must be lowercase alphanumeric with hyphens' }).optional(),
	icon: validateString('Icon', { max: 50 }).optional(),
});

export const updateBudgetCategorySchema = createBudgetCategorySchema.partial();

export type CreateBudgetCategoryDto = z.infer<typeof createBudgetCategorySchema>;
export type UpdateBudgetCategoryDto = z.infer<typeof updateBudgetCategorySchema>;
