import { select } from './notes.js';
import client from '../utils/client.js';

const emptyChannels = {
  0: [],
  1: [],
  2: []
};

let events = [];
let lastTime = 0;
let lastEvent = {};

export default context => {
  const { post } = client(context);
  const play = (channel, touch) => {
    const { voicebox } = context.value;
    const note = select(touch.pageX, touch.pageY);

    if (note && note !== lastEvent.name) {
      const event = register(channel, note, touch);
      voicebox.play(0, note);
      return (lastEvent = event);
    }
  };

  const stop = touch => {
    lastEvent.touch = touch;
    lastEvent = {};
  };

  const register = (channel, name, touch) => {
    const { voicebox } = context.value;
    const time = voicebox.time;
    if (time < lastTime) {
      voicebox.cancel();
      events = events.filter(({ time: etime }) => etime < time);
    }
    const idx = events.length;
    const event = {
      idx,
      channel,
      name,
      time,
      touch
    };
    events.push({ ...emptyChannels, time, [channel]: event });
    lastTime = time;
    post(event);
    return event;
  };

  const playback = (startpoint, channel = 0) => {
    const { voicebox, draw } = context.value;
    const channels = [].concat(channel);
    voicebox.schedule(
      events.slice(startpoint).reduce(
        (acc, event) =>
          acc.concat(
            channels.map(channel => ({
              time: event[channel].time,
              spn: event[channel].name,
              vid: channel,
              cb: () => draw(event[channel].touch)
            }))
          ),
        []
      )
    );
  };

  return {
    play,
    stop,
    playback,
    register
  };
};
