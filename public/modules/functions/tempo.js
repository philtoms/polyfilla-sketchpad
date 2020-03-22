import startContext from './start-audio-context.js';

let subscriptions = [];
const loop = new Tone.Loop(time => {
  subscriptions.forEach(cb => cb(time));
}, '16n');

Tone.Transport.bpm.value = 100;

let running;
export const start = async time => {
  if (!running) {
    await startContext(Tone.context);
    Tone.Transport.start();
  }
  loop.start();
  running = true;
};
export const stop = time => {
  loop.stop(time);
  running = false;
};
export const subscribe = cb => subscriptions.push(cb);
export const unsubscribe = cb =>
  (subscriptions = subscriptions.filter(s => s !== cb));

let ticks = [];
let lastTick = 0;
let calibrateId;
export const calibrate = (bpm = 100, interval = '4d') => {
  start();
  // loop.interval = interval;
  clearTimeout(calibrateId);
  calibrateId = setTimeout(() => {
    ticks = [];
    lastTick = 0;
  }, 1500);
  const tick = Date.now();
  if (lastTick) {
    ticks.push(tick - lastTick);
    bpm =
      Math.floor(
        (6000 * ticks.length) / ticks.reduce((acc, t) => acc + t, 0) || 1
      ) * 10;
    Tone.Transport.bpm.value = bpm;
  }
  lastTick = tick;
  return ticks.length ? bpm : '';
};
