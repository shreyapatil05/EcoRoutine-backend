export const normalizeDate = (date) => {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

export const isSameDay = (date1, date2) => {
  return normalizeDate(date1).getTime() === normalizeDate(date2).getTime();
};

export const isYesterday = (dateToCheck, referenceDate = new Date()) => {
  const check = normalizeDate(dateToCheck);
  const ref = normalizeDate(referenceDate);
  const diffInDays = Math.round((ref.getTime() - check.getTime()) / (1000 * 60 * 60 * 24));
  return diffInDays === 1;
};
