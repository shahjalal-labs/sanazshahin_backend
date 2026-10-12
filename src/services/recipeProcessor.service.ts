import { Recipe, User } from "@prisma/client";

export class RecipeProcessorService {
  /**
   * Extract goal intensity multiplier
   */
  private getGoalMultiplier(goal?: string | null): number {
    if (!goal) return 1;

    const g = goal.toLowerCase();

    // stronger signals first
    if (g.includes("extreme") || g.includes("fast")) return 0.75;
    if (g.includes("loss") || g.includes("lose") || g.includes("cut")) return 0.85;
    if (g.includes("lean")) return 0.9;

    if (g.includes("bulk") || g.includes("muscle") || g.includes("gain")) return 1.2;
    if (g.includes("build") || g.includes("mass")) return 1.15;

    return 1;
  }

  /**
   * Base calories adjusted by goal
   */
  private calculateKcal(baseKcal: number, goal?: string | null): number {
    const safeBase = baseKcal || 500;
    const multiplier = this.getGoalMultiplier(goal);
    return Math.round(safeBase * multiplier);
  }

  /**
   * Smart food type inference (priority-based)
   */
  private determineFoodType(recipeInfo: Recipe, userInfo: User): string {
    const features = recipeInfo.features || [];
    const prefs = userInfo.dietaryPreferences || [];

    if (features.length && prefs.length) {
      return [...new Set([...features, ...prefs])].join(", ");
    }

    if (features.length) return features.join(", ");
    if (prefs.length) return prefs.join(", ");

    return "Balanced, Home-style";
  }

  /**
   * Restriction formatting (clean + readable)
   */
  private getRestrictionAlert(restrictions?: string[]): string {
    if (!restrictions?.length) return "";
    return ` | Dietary fit: ${restrictions.join(", ")}`;
  }

  /**
   * Smart meal calorie distribution
   */
  private getMealCalories(baseKcal: number) {
    return {
      breakfast: Math.round(baseKcal * 0.85),
      lunch: baseKcal,
      dinner: Math.round(baseKcal * 1.15),
    };
  }

  /**
   * Parse recipe nutrition string
   */
  private parseNutrition(nutritionStr?: string | null) {
    const defaults = {
      fiber: 0,
      fat: 0,
      carb: 0,
      iron: 0,
      protein: 0,
    };

    if (!nutritionStr) return defaults;

    // Remove HTML tags if present
    const cleanStr = nutritionStr.replace(/<[^>]*>/g, " ").trim();

    const getVal = (regex: RegExp): number => {
      const match = cleanStr.match(regex);
      if (match && match[1]) {
        return parseInt(match[1], 10) || 0;
      }
      return 0;
    };

    return {
      fiber: getVal(/fiber\s*:\s*(\d+)/i),
      fat: getVal(/fat\s*:\s*(\d+)/i),
      carb: getVal(/(?:carb|carbohydrate)s?\s*:\s*(\d+)/i),
      iron: getVal(/iron\s*:\s*(\d+)/i),
      protein: getVal(/protein\s*:\s*(\d+)/i),
    };
  }

  /**
   * Get nutritional details for a meal based on target calories
   */
  private getMealNutrition(kcal: number, nutritionStr?: string | null) {
    const parsed = this.parseNutrition(nutritionStr);
    
    // Check if we parsed actual values
    const hasParsed = parsed.protein > 0 || parsed.carb > 0 || parsed.fat > 0;
    
    if (hasParsed) {
      const parsedCal = (parsed.protein * 4) + (parsed.carb * 4) + (parsed.fat * 9);
      const scale = parsedCal > 0 ? (kcal / parsedCal) : 1;
      
      return {
        fiber: Math.round((parsed.fiber || Math.round(kcal * 0.02)) * scale) || 5,
        fat: Math.round(parsed.fat * scale) || Math.round((kcal * 0.30) / 9),
        carb: Math.round(parsed.carb * scale) || Math.round((kcal * 0.45) / 4),
        iron: Math.round((parsed.iron || Math.round(kcal * 0.015)) * scale) || 5,
        protein: Math.round(parsed.protein * scale) || Math.round((kcal * 0.25) / 4),
      };
    }

    // Fallback: generate balanced nutrient values proportional to the meal's calories (kcal)
    return {
      fiber: Math.round(kcal * 0.02) || 5,
      fat: Math.round((kcal * 0.30) / 9) || 15,
      carb: Math.round((kcal * 0.45) / 4) || 50,
      iron: Math.round(kcal * 0.015) || 5,
      protein: Math.round((kcal * 0.25) / 4) || 25,
    };
  }

  async generateMealplan(  
    userInfo: User,
    recipes: Recipe[],
  ): Promise<{ meals: any[] }> {
    const activeRecipes = recipes.slice(0, 7);
    const activeCount = activeRecipes.length;
    
    if (activeCount === 0) {
      return { meals: [] };
    }

    const baseDays = Math.floor(7 / activeCount);
    let remainder = 7 % activeCount;

    const allocations = activeRecipes.map((recipe, idx) => {
      let days = baseDays;
      if (idx < remainder) {
        days += 1;
      }
      return { recipe, days };
    });

    const getWeightedAverageNutrition = (mealType: 'breakfast' | 'lunch' | 'dinner') => {
      let totalKcal = 0;
      let totalFiber = 0;
      let totalFat = 0;
      let totalCarb = 0;
      let totalIron = 0;
      let totalProtein = 0;
      let totalDays = 0;

      for (const alloc of allocations) {
        if (alloc.days <= 0) continue;
        
        const baseKcal = this.calculateKcal(alloc.recipe.energy, userInfo.goal);
        const kcalSplit = this.getMealCalories(baseKcal);
        const mealKcal = kcalSplit[mealType];
        
        const nutrition = this.getMealNutrition(mealKcal, alloc.recipe.nutrition);
        
        totalKcal += mealKcal * alloc.days;
        totalFiber += nutrition.fiber * alloc.days;
        totalFat += nutrition.fat * alloc.days;
        totalCarb += nutrition.carb * alloc.days;
        totalIron += nutrition.iron * alloc.days;
        totalProtein += nutrition.protein * alloc.days;
        totalDays += alloc.days;
      }

      if (totalDays === 0) return null;

      return {
        kcal: Math.round(totalKcal / totalDays),
        fiber: Math.round(totalFiber / totalDays),
        fat: Math.round(totalFat / totalDays),
        carb: Math.round(totalCarb / totalDays),
        iron: Math.round(totalIron / totalDays),
        protein: Math.round(totalProtein / totalDays),
      };
    };

    const breakfastNutrition = getWeightedAverageNutrition('breakfast');
    const lunchNutrition = getWeightedAverageNutrition('lunch');
    const dinnerNutrition = getWeightedAverageNutrition('dinner');

    if (!breakfastNutrition || !lunchNutrition || !dinnerNutrition) {
      return { meals: [] };
    }

    const combinedName = activeRecipes.map(r => r.recipeName).join(" & ");
    const combinedImage = activeRecipes[0].recipeImage;
    const allIngredients = activeRecipes.flatMap(r => r.ingredients || []);
    const uniqueIngredients = [...new Set(allIngredients)];

    const meals = [
      {
        name: combinedName,
        image: combinedImage,
        fiber: breakfastNutrition.fiber,
        fat: breakfastNutrition.fat,
        carb: breakfastNutrition.carb,
        iron: breakfastNutrition.iron,
        protein: breakfastNutrition.protein,
        kcal: breakfastNutrition.kcal,
        calorie: breakfastNutrition.kcal,
        duration: "7 days",
        durationDays: 7
    
      },
      {
        name: combinedName,
        image: combinedImage,
        fiber: lunchNutrition.fiber,
        fat: lunchNutrition.fat,
        carb: lunchNutrition.carb,
        iron: lunchNutrition.iron,
        protein: lunchNutrition.protein,
        kcal: lunchNutrition.kcal,
        calorie: lunchNutrition.kcal,
        duration: "7 days",
        durationDays: 7,
       
      },
      {
        name: combinedName,
        image: combinedImage,
        fiber: dinnerNutrition.fiber,
        fat: dinnerNutrition.fat,
        carb: dinnerNutrition.carb,
        iron: dinnerNutrition.iron,
        protein: dinnerNutrition.protein,
        kcal: dinnerNutrition.kcal,
        calorie: dinnerNutrition.kcal,
        duration: "7 days",
        durationDays: 7,
       
      },
    ];

    return { meals };
  }

  /**
   * Smarter regeneration with variation (not just static templates)
   */
 
}

export default new RecipeProcessorService();