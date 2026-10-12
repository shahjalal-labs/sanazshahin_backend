import * as z from 'zod';

export const createMealplanSchema = z.object({
  // Define fields
  name: z.string(),
});

export const MealplanSchemaValidation = {
createMealplanSchema
};
  