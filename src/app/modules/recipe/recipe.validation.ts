import { z } from "zod";

const recipeValidationSchema = z.object({
  recipeName: z.string().min(1, "Recipe name is required"),
  duration: z
    .number({
      required_error: "Duration is required",
      invalid_type_error: "Duration must be a number",
    })
    .int("Duration must be an integer")
    .positive("Duration must be greater than 0"),
  energy: z
    .number({
      required_error: "Energy is required",
      invalid_type_error: "Energy must be a number",
    })
    .int("Energy must be an integer")
    .positive("Energy must be greater than 0"),
  features: z
    .array(z.string().min(1, "Feature cannot be empty"))
    .min(1, "At least one feature is required"),
  ingredients: z
    .array(z.string().min(1, "Ingredient cannot be empty"))
    .min(1, "At least one ingredient is required"),
  equipments: z
    .array(z.string().min(1, "Equipment cannot be empty"))
    .min(1, "At least one equipment is required"),
  wyn: z.string().min(1, "WYN is required"),
  nutrition: z.string().min(1, "Nutrition is required"),
  hymi: z.string().min(1, "HYMI is required"),
  youtubeLink: z.string().url("Youtube link must be a valid URL").optional(),
});
const updateRecipeValidationSchema = z.object({
  recipeId: z.string(),
  recipeName: z.string().optional(),
  duration: z.number().optional(),
  energy: z.number().optional(),
  wyn: z.string().optional(),
  nutrition: z.string().optional(),
  hymi: z.string().optional(),
  youtubeLink: z.string().url("Youtube link must be a valid URL").optional(),
});

export const recipeValidation = {
  recipeValidationSchema,
  updateRecipeValidationSchema,
};
