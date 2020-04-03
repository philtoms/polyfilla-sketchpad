import { select, noteMap } from './notes.js';
import client from '../utils/client.js';

const emptyChannels = {
  0: [],
  1: [],
  2: []
};

let previousEvent = {};
let lastTime = 0;
let nextBeat = 0;

export default context => {
  const { batch } = client(context);
  const play = (channel, touch) => {
    const { voicebox } = context.value;
    const note = select(touch.pageX, touch.pageY);

    if (note && note !== previousEvent.name) {
      previousEvent = register(channel, note, touch);
      voicebox.play(0, note);
      return previousEvent;
    }
  };

  const stop = touch => {
    if (previousEvent.touch) {
      const { draw = () => {} } = context.value;
      draw({ ...previousEvent.touch, paintType: 'fill' });
      previousEvent = {};
    }
  };

  const register = (channel, name, touch) => {
    const { voicebox, data, quantize } = context.value;
    if (!lastTime) {
      lastTime = data.length ? data[data.length - 1].time : 0;
    }
    let time = voicebox.nextTime(lastTime);
    if (time < lastTime) {
      time = data[nextBeat].time;
      voicebox.cancel(time);
      const events = data.filter(({ time: etime }) => etime < time);
      data.splice(0, data.length, ...events);
    }
    const idx = data.length;
    const event = {
      idx,
      channel,
      name,
      time,
      touch: {
        pageX: touch.pageX,
        pageY: noteMap(touch.pageY).pos,
        paintType: touch.paintType
      }
    };
    data.push({ ...emptyChannels, time, [channel]: event });
    quantize(idx);
    batch(data[idx][channel]);
    lastTime = time;
    return data[idx][channel];
  };

  const playback = (startpoint, channel = 0) => {
    const { voicebox, data, draw = () => {} } = context.value;
    const channels = [].concat(channel);
    nextBeat = startpoint;
    voicebox.schedule(
      data.slice(startpoint).reduce(
        (acc, event) =>
          acc.concat(
            channels.map(channel => ({
              time: event[channel].time,
              spn: event[channel].name,
              vid: channel,
              cb: () => {
                nextBeat = event[channel].idx + 1;
                draw(event[channel].touch);
              }
            }))
          ),
        []
      )
    );
  };

  return {
    play,
    stop,
    playback
  };
};
