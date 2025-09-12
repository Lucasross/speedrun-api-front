export type ValidationError = {
  field: string;
  message: string;
};

export function validateSector(sector: any): ValidationError[] {
  const errors: ValidationError[] = [];
  
  if(sector === null)
    return errors;

  return errors;
}
