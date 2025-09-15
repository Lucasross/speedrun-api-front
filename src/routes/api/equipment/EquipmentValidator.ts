export type ValidationError = {
  field: string;
  message: string;
};

export function validateEquipment(equipment: { stats: Record<string, number> } | null): ValidationError[] {
  const errors: ValidationError[] = [];
  
  if(equipment === null)
    return errors;

  return errors;
}
