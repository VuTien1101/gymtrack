export function calculateStreak(dates: Date[], referenceDate = new Date()) {
  const workoutDays = new Set(
    dates.map((date) => date.toISOString().slice(0, 10)),
  );
  const cursor = new Date(referenceDate);
  cursor.setUTCHours(0, 0, 0, 0);

  if (!workoutDays.has(cursor.toISOString().slice(0, 10))) {
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  let streak = 0;
  while (workoutDays.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  return streak;
}
