import type {
  TrainingDay,
  TrainingDayInput,
  TrainingStatus,
} from "../../models/training-day";
import { supabase } from "../../supabase";
import { getAuthenticatedUser } from "../../utils";
import type { ITrainingDayRepository } from "../types";

const TABLE_NAME = "training_days" as const;

/**
 * Supabase Row를 도메인 모델로 변환
 */
function mapToTrainingDay(row: {
  id: string;
  training_date: string;
  title: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}): TrainingDay {
  return {
    id: row.id,
    trainingDate: row.training_date,
    title: row.title,
    status: row.status as TrainingStatus,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

export class SupabaseTrainingDayRepository implements ITrainingDayRepository {
  async findByDate(date: string): Promise<TrainingDay | null> {
    const user = await getAuthenticatedUser();

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select("*")
      .eq("user_id", user.id)
      .eq("training_date", date)
      .maybeSingle();

    if (error) {
      console.error("훈련일 조회 실패:", error);
      throw error;
    }

    return data ? mapToTrainingDay(data) : null;
  }

  async findByDateRange(
    startDate: string,
    endDate: string,
  ): Promise<TrainingDay[]> {
    const user = await getAuthenticatedUser();

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select("*")
      .eq("user_id", user.id)
      .gte("training_date", startDate)
      .lte("training_date", endDate)
      .order("training_date", { ascending: true });

    if (error) {
      console.error("훈련일 범위 조회 실패:", error);
      throw error;
    }

    return (data ?? []).map(mapToTrainingDay);
  }

  async getOrCreate(date: string): Promise<TrainingDay> {
    const existing = await this.findByDate(date);
    if (existing) return existing;

    return this.create({ trainingDate: date, status: "planned" });
  }

  async create(input: TrainingDayInput): Promise<TrainingDay> {
    const user = await getAuthenticatedUser();

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert({
        user_id: user.id,
        training_date: input.trainingDate,
        title: input.title ?? null,
        status: input.status ?? "planned",
      })
      .select()
      .single();

    if (error) {
      console.error("훈련일 생성 실패:", error);
      throw error;
    }

    return mapToTrainingDay(data);
  }

  async update(
    id: string,
    input: Partial<TrainingDayInput>,
  ): Promise<TrainingDay> {
    const updatePayload: Record<string, unknown> = {};

    if (input.trainingDate !== undefined) {
      updatePayload.training_date = input.trainingDate;
    }
    if (input.title !== undefined) {
      updatePayload.title = input.title;
    }
    if (input.status !== undefined) {
      updatePayload.status = input.status;
    }

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("훈련일 수정 실패:", error);
      throw error;
    }

    return mapToTrainingDay(data);
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from(TABLE_NAME).delete().eq("id", id);

    if (error) {
      console.error("훈련일 삭제 실패:", error);
      throw error;
    }
  }
}
