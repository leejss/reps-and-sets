/**
 * 지역 시간대를 기준으로 YYYY-MM-DD 문자열을 생성합니다.
 * Date.prototype.toISOString()을 사용할 경우 UTC 기준으로 변환되어
 * KST와 같은 양의 오프셋 지역에서는 하루가 앞당겨지는 문제가 발생합니다.
 */
export const formatLocalDateISO = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
