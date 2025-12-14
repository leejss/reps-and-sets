import { getRepository } from "@/lib/repositories/factory";
import type { IRepository } from "@/lib/repositories/types";

function getRepo(): IRepository {
  return getRepository();
}

export async function execute<T>(
  action: (repo: IRepository) => Promise<T>,
  options: {
    errorMessage?: string;
    onError?: (error: unknown) => void;
    onFinally?: () => void;
    shouldThrow?: boolean;
  } = {},
): Promise<T | undefined> {
  const { errorMessage, onError, onFinally, shouldThrow = true } = options;

  try {
    const repo = getRepo();
    return await action(repo);
  } catch (error) {
    if (errorMessage) {
      console.error(errorMessage, error);
    }
    onError?.(error);
    if (shouldThrow) {
      throw error;
    }
    return undefined;
  } finally {
    onFinally?.();
  }
}

export type StoreHelpers = {
  execute: typeof execute;
};

export function createStoreHelpers(): StoreHelpers {
  return { execute };
}
