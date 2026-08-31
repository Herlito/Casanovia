function parseMilestoneTimeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const clean = timeStr.trim().toLowerCase();

  const isPM = clean.includes('pm') || clean.includes('p.m.') || clean.includes('p. m.');
  const isAM = clean.includes('am') || clean.includes('a.m.') || clean.includes('a. m.');

  const match = clean.match(/(\d{1,2})[:.](\d{2})/);
  if (!match) {
    const hourMatch = clean.match(/(\d{1,2})/);
    if (!hourMatch) return 0;
    let h = parseInt(hourMatch[1], 10);
    if (isPM && h < 12) h += 12;
    if (isAM && h === 12) h = 0;
    if (h < 6) h += 24;
    return h * 60;
  }

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);

  if (isPM && hours < 12) {
    hours += 12;
  } else if (isAM && hours === 12) {
    hours = 0;
  }

  // If hours < 6 (e.g. 00:30, 01:30, 02:00, 03:00, 04:00, 05:00)
  // this is past-midnight party/celebration in the wedding day sequence
  if (hours < 6) {
    hours += 24;
  }

  return hours * 60 + minutes;
}

const times = ["08:00 hrs", "16:00 hrs", "06:00 hrs", "07:30 hrs", "08:30 hrs"];
times.sort((a,b) => parseMilestoneTimeToMinutes(a) - parseMilestoneTimeToMinutes(b));
console.log(times);
