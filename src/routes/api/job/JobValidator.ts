export type ValidationError = {
  field: string;
  message: string;
};

export function validateJob(job: { stats: Record<string, number> } | null): ValidationError[] {
  const errors: ValidationError[] = [];
  
  if(job === null)
    return errors;

  // Base Health
  if (!("Base Health" in job.stats)) {
    errors.push({ field: "Base Health", message: "Job should have 'Base Health'." });
  } else if (job.stats["Base Health"] < 50 || job.stats["Base Health"] > 200) {
    errors.push({ field: "Base Health", message: "Base Health should be between 50 and 200." });
  }

  // Base Damage
  if (!("Base Damage" in job.stats)) {
    errors.push({ field: "Base Damage", message: "Job should have 'Base Damage'." });
  } else if (job.stats["Base Damage"] < 10 || job.stats["Base Damage"] > 50) {
    errors.push({ field: "Base Damage", message: "Base Damage should be between 10 and 50." });
  }

  return errors;
}
