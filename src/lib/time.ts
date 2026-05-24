export function todayString() {
  return toDateString(new Date());
}

export function toDateString(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function addDays(dateString: string, days: number) {
  const date = parseDate(dateString);
  date.setDate(date.getDate() + days);
  return toDateString(date);
}

export function parseDate(dateString: string) {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function dayOfWeek(dateString: string) {
  return parseDate(dateString).getDay();
}

export function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export function minutesToTime(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}`.padStart(2, "0") + ":" + `${minutes}`.padStart(2, "0");
}

export function addMinutes(time: string, minutes: number) {
  return minutesToTime(timeToMinutes(time) + minutes);
}

export function formatTime(time: string) {
  const [hourRaw, minute] = time.split(":").map(Number);
  const suffix = hourRaw >= 12 ? "PM" : "AM";
  const hour = hourRaw % 12 || 12;
  return `${hour}:${`${minute}`.padStart(2, "0")} ${suffix}`;
}

export function formatMoney(amount: number) {
  return `$${amount.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

export function generateTimes(start: string, end: string, stepMinutes = 30) {
  const times: string[] = [];
  for (
    let cursor = timeToMinutes(start);
    cursor < timeToMinutes(end);
    cursor += stepMinutes
  ) {
    times.push(minutesToTime(cursor));
  }
  return times;
}
