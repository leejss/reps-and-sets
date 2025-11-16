import dayjs from "dayjs";

export const formatLocalDateISO = (date: Date | string): string => {
  return dayjs(date).format("YYYY-MM-DD");
};
