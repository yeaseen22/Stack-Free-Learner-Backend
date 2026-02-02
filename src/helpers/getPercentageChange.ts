export const getPercentageChange = (current: number, previous: number): string => {
  if (previous === 0) {
    if (current === 0) return "0%";
    return "0%";
  }
  const change = ((current - previous) / previous) * 100;
  const sign = change >= 0 ? "+" : "-";
  return `${sign}${Math.abs(change).toFixed(0)}%`;
};
