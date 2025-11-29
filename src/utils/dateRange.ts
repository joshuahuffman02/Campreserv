export interface DateRange {
  start: Date;
  end: Date; // non-inclusive end
}

export const rangesOverlap = (a: DateRange, b: DateRange) => {
  return a.start < b.end && a.end > b.start;
};

export const normalizeDateRange = (startDate: string, endDate: string): DateRange => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    throw new Error("Invalid dates");
  }
  if (end <= start) {
    throw new Error("End date must be after start date");
  }
  return { start, end };
};
