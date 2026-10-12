type WeightUnit = "kg" | "lb";
type Gender = "male" | "female";

interface ProteinInput {
  gender: Gender;
  heightCm: number;
  weight: number;
  weightUnit: WeightUnit;
}

export const calculateDailyProtein = ({
  gender,
  heightCm,
  weight,
  weightUnit,
}: ProteinInput) => {
  if (!gender || !heightCm || !weight || !weightUnit) {
    throw new Error("All input fields are requiredd");
  }

  const weightKg = weightUnit === "lb" ? weight * 0.453592 : weight;

  const baseMultiplier = gender === "male" ? 1.6 : 1.4;
  let heightAdjustment = 0;

  if (heightCm > 180) {
    heightAdjustment = 0.1;
  } else if (heightCm < 155) {
    heightAdjustment = -0.1;
  }
  const proteinPerKg = baseMultiplier + heightAdjustment;
  const dailyProtein = weightKg * proteinPerKg;

  return {   
    dailyProteinGrams: Math.round(dailyProtein),
  };
};

