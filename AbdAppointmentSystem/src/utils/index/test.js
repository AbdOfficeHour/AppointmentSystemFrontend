function getTimeRange(startTime, endTime) {
  const parseTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return { hours, minutes };
  };

  const start = parseTime(startTime);
  const end = parseTime(endTime);

  // 计算小时范围
  const hourRange = [];
  for (let hour = start.hours; hour <= end.hours; hour++) {
    hourRange.push(hour);
  }

  // 计算分钟范围
  const minuteRange = {};
  hourRange.forEach(hour => {
    if (hour === start.hours && hour === end.hours) {
      minuteRange[hour] = Array.from({ length: end.minutes - start.minutes + 1 }, (_, i) => i + start.minutes);
    } else if (hour === start.hours) {
      minuteRange[hour] = Array.from({ length: 60 - start.minutes }, (_, i) => i + start.minutes);
    } else if (hour === end.hours) {
      minuteRange[hour] = Array.from({ length: end.minutes + 1 }, (_, i) => i);
    } else {
      minuteRange[hour] = Array.from({ length: 60 }, (_, i) => i);
    }
  });

  return {
    hourRange,
    minuteRange
  };
}

// 示例用法
const startTime = "10:15";
const endTime = "12:45";
const { hourRange, minuteRange } = getTimeRange(startTime, endTime);

console.log('Hour Range:', hourRange);
console.log('Minute Range:', minuteRange);

const allHours = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23];
const availableHours = [10, 11, 12];

const disabledHours = allHours.filter(hour => !availableHours.includes(hour));

console.log(disabledHours);
// 输出: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]

const array = Array.from({ length: 24 }, (_, index) => index);
console.log(array);


