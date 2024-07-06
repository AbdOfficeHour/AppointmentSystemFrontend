// Example data
const schedule = [
  {
    date: '2024-07-17',
    available: [
      { start: '08:30', end: '11:00' },
      { start: '12:30', end: '14:00' },
      { start: '17:00', end: '20:00' }
    ],
    busy: [
      { start: '08:00', end: '08:30' },
      { start: '11:00', end: '12:30' },
      { start: '14:00', end: '17:00' }
    ]
  },
  {
    date: '2024-07-18',
    busy: [
      { start: '08:00', end: '08:30' },
      { start: '11:00', end: '12:30' },
      { start: '14:00', end: '17:00' }
    ],
    available: [
      { start: '08:30', end: '11:00' },
      { start: '12:30', end: '14:00' },
      { start: '17:00', end: '20:00' }
    ]
  }
];
const makeRange = (start, end) => {
  const result = [];
  for (let i = start; i <= end; i++) {
    result.push(i);
  }
  return result;
};

const getBusyTimes = (date) => {
  const day = schedule.find(d => d.date === date);
  return day ? day.busy : [];
};

const getDateRange = (start, end) => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const dates = [];
  let currentDate = startDate;
  while (currentDate <= endDate) {
    dates.push(currentDate.toISOString().split('T')[0]);
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return dates;
};

const disabledHours = (startDate, endDate) => {
  const dates = getDateRange(startDate, endDate);
  let totalDisabledHours = [];

  dates.forEach(date => {
    const busyTimes = getBusyTimes(date);
    // const disabled = new Set();
    const disabled = new Set([...makeRange(0, 7), ...makeRange(20, 23)]);
    busyTimes.forEach(period => {
      const [startHour, startMinute] = period.start.split(':').map(Number);
      const [endHour, endMinute] = period.end.split(':').map(Number);

      for (let hour = startHour; hour <= endHour; hour++) {
        if (startHour !== endHour) {
          if (hour === startHour && startMinute === 0) {
            disabled.add(hour);
          } else if (hour === endHour && endMinute === 59) {
            disabled.add(hour);
          } else if (hour !== startHour && hour !== endHour) {
            disabled.add(hour);
          }
        } else {
          if (startMinute === 0 && endMinute === 59) {
            disabled.add(hour);
          }
        }
      }
    });
    let dateDisabledHours = Array.from(disabled).sort((a, b) => a - b);

    let newElements = dateDisabledHours.filter(element => !totalDisabledHours.includes(element));
    totalDisabledHours = totalDisabledHours.concat(newElements);
    totalDisabledHours = [...new Set(totalDisabledHours)];
  })
  return Array.from(totalDisabledHours).sort((a, b) => a - b);
};

const disabledMinutes = (startDate, endDate, hour) => {
  const dates = getDateRange(startDate, endDate);
  let totalDisabledMinutes = [];

  dates.forEach(date => {
    const busyTimes = getBusyTimes(date);
    const disabled = new Set();
    busyTimes.forEach(period => {
      const [startHour, startMinute] = period.start.split(':').map(Number);
      const [endHour, endMinute] = period.end.split(':').map(Number);

      if (hour === startHour) {
        for (let minute = startMinute; minute < 60; minute++) {
          disabled.add(minute);
        }
      }
      if (hour === endHour) {
        for (let minute = 0; minute <= endMinute; minute++) {
          disabled.add(minute);
        }
      }
      if (hour > startHour && hour < endHour) {
        for (let minute = 0; minute < 60; minute++) {
          disabled.add(minute);
        }
      }
    });
    let dateDisabledMinutes = Array.from(disabled).sort((a, b) => a - b);

    let newElements = dateDisabledMinutes.filter(element => !totalDisabledMinutes.includes(element));
    totalDisabledMinutes = totalDisabledMinutes.concat(newElements);
    totalDisabledMinutes = [...new Set(totalDisabledMinutes)];
  });

  return Array.from(totalDisabledMinutes).sort((a, b) => a - b);
};

const disabledSeconds = (hour, minute) => {
  return makeRange(1, 59);
};

// Usage examples for a date range
const startDate = "2024-07-04T16:00:00.000Z";
const endDate = "2024-07-20T16:00:00.000Z";

console.log(disabledHours(startDate, endDate));
console.log(disabledMinutes(startDate, endDate, 8));
