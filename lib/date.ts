import dayjs, { Dayjs } from "dayjs";

export const formatLocalDateISO = (date: Date | string | Dayjs): string => {
  return dayjs(date).format("YYYY-MM-DD");
};

export const formatChipDate = (date: Date | string | Dayjs): string => {
  return dayjs(date).format("MM.DD");
};

export const getStartOfWeek = (date: Date | string | Dayjs): Dayjs => {
  return dayjs(date).startOf("week").add(1, "day"); // week starts on Monday
};

export const getCurrentDate = (): Dayjs => {
  return dayjs();
};
