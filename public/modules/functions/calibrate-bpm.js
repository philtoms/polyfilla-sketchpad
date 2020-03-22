let ticks = [];
let tempo = 100;
let lastTick = 0;
let calibrateId;
export default e => {
  clearTimeout(calibrateId);
  calibrateId = setTimeout(() => {
    ticks = [];
    lastTick = 0;
  }, 1500);
  const tick = Date.now();
  if (lastTick) {
    ticks.push(tick - lastTick);
    tempo =
      Math.floor(
        (6000 * ticks.length) / ticks.reduce((acc, t) => acc + t, 0) || 1
      ) * 10;
  }
  lastTick = tick;
  return ticks.length ? tempo : '';
};
