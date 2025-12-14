import type { Services } from "@/lib/services";
import { getServices } from "@/lib/services";

function getSvc(): Services {
  return getServices();
}

export async function execute<T>(
  action: (services: Services) => Promise<T>,
  options: {
    errorMessage?: string;
    onError?: (error: unknown) => void;
    onFinally?: () => void;
    shouldThrow?: boolean;
  } = {},
): Promise<T | undefined> {
  const { errorMessage, onError, onFinally, shouldThrow = true } = options;

  try {
    const services = getSvc();
    return await action(services);
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
