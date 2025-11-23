import dayjs, { Dayjs } from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";

dayjs.extend(isoWeek);

export const formatLocalDateISO = (date: Date | string | Dayjs): string => {
  return dayjs(date).format("YYYY-MM-DD");
};

export const formatChipDate = (date: Date | string | Dayjs): string => {
  return dayjs(date).format("MM.DD");
};

export const getStartOfWeek = (date: Date | string | Dayjs): Dayjs => {
  return dayjs(date).startOf("isoWeek"); // ISO week starts on Monday
};

export type WeekRange = {
  startDay: Dayjs;
  endDay: Dayjs;
  startISO: string;
  endISO: string;
};

export const getWeekRange = (date: Date | string | Dayjs): WeekRange => {
  const startDay = getStartOfWeek(date);
  const endDay = startDay.add(6, "day");

  return {
    startDay,
    endDay,
    startISO: formatLocalDateISO(startDay),
    endISO: formatLocalDateISO(endDay),
  };
};

export const formatKoreanHeaderDate = (date: Date = new Date()): string => {
  return date.toLocaleDateString("ko-KR", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
};
