export type ValidationError = {
  field: string;
  message: string;
};

export function validateMonster(monster: { stats: Record<string, number> } | null): ValidationError[] {
  const errors: ValidationError[] = [];
  
  if(monster === null)
    return errors;

  // Base Health
  if (!("Base Health" in monster.stats)) {
    errors.push({ field: "Base Health", message: "Monster should have 'Base Health'." });
  } else if (monster.stats["Base Health"] < 50 || monster.stats["Base Health"] > 200) {
    errors.push({ field: "Base Health", message: "Base Health should be between 50 and 200." });
  }

  // Base Damage
  if (!("Base Damage" in monster.stats)) {
    errors.push({ field: "Base Damage", message: "Monster should have 'Base Damage'." });
  } else if (monster.stats["Base Damage"] < 10 || monster.stats["Base Damage"] > 50) {
    errors.push({ field: "Base Damage", message: "Base Damage should be between 10 and 50." });
  }

  return errors;
}
