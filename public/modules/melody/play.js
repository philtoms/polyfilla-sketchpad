let lastNote;
let lastSpeed = 0;
export const speeds = [];

import { select } from './notes.js';
import { register } from './play-back.js';

export const play = (voicebox, channel, touch, lastTouch) => {
  let speed = lastTouch
    ? parseInt((touch.pageY - lastTouch.pageY) * 100)
    : lastSpeed;
  lastSpeed = speed;
  let avgSpeed = speed;
  let maxSpeed = speed;
  speeds.push(speed);
  if (speeds.length > 8) {
    speeds.shift();
    avgSpeed = parseInt(speeds.slice(2, -2).reduce((acc, s) => acc + s, 0) / 4);
    maxSpeed = speeds.reduce((acc, s) => Math.max(acc, Math.abs(s)), 0);
  }
  // const accel = Math.abs(speed - lastSpeed);
  const direction = Math.max(-1, Math.min(1, speed));
  // if (speed === 0) {
  //   speeds = [];
  // }

  var tail = [];
  const momentum = parseInt(
    tail.length > 1
      ? tail.length * (tail[0].pageY - tail[tail.length - 1].pageY)
      : 0
  );

  const slip =
    (speed === 0 || (speeds.length == 8 && maxSpeed < 1500)) &&
    Math.abs(momentum) < 4000;

  const { name, pitch, p1 } = select(
    touch.pageX,
    touch.pageY,
    momentum,
    direction
  );

  if (name && name !== lastNote) {
    const note = register(voicebox, channel, name, touch, voicebox.time);
    voicebox.play(0, name);
    lastNote = name;
    return note;
  }
};

export const stop = () => (lastNote = '');
