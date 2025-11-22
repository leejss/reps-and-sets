import type { Tables } from "../database.types";

export interface Exercise {
  id: string;
  name: string;
  targetMuscleGroup: string;
  description?: string;
  externalLink?: string;
  createdAt: Date;
  updatedAt: Date;
}

export function mapExerciseRow(row: Tables<"exercises">): Exercise {
  return {
    id: row.id,
    name: row.name,
    targetMuscleGroup: row.target_muscle_group,
    description: row.description || undefined,
    externalLink: row.external_link || undefined,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}
