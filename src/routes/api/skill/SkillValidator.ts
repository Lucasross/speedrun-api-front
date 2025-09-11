export type ValidationError = {
  field: string;
  message: string;
};

export function validateSkill(skill: { stats: Record<string, number> } | null): ValidationError[] {
  const errors: ValidationError[] = [];
  
  if(skill === null)
    return errors;

  return errors;
}
