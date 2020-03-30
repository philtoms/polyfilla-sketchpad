import { select } from './notes.js';
import client from '../utils/client.js';

const emptyChannels = {
  0: [],
  1: [],
  2: []
};

let previousEvent = {};
let lastEvent = { idx: -1 };
let nextBeat = 0;

export default context => {
  const { post } = client(context);
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
    previousEvent.touch = touch;
    previousEvent = {};
  };

  const register = (channel, name, touch) => {
    const { voicebox, data } = context.value;
    let time = voicebox.time;
    if (time < lastEvent.time) {
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
      touch
    };
    data.push({ ...emptyChannels, time, [channel]: event });
    post(event);
    return (lastEvent = event);
  };

  const playback = (startpoint, channel = 0) => {
    const { voicebox, draw, data } = context.value;
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
