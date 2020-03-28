const emptyChannels = {
  0: [],
  1: [],
  2: []
};

const events = [];
export const register = (channel, name, touch, time) => {
  const idx = events.length;
  const event = {
    idx,
    channel,
    name,
    time,
    touch
  };
  events.push({ ...emptyChannels, time, [channel]: event });
  return event;
};

export const playback = (voicebox, startpoint, offset = 1, channel = 0) => {
  const channels = [].concat(channel);
  const startTime = events[startpoint].time;
  for (let i = startpoint; i < events.length; i++) {
    channels.forEach(channel => {
      const { name, time } = events[i][channel];
      voicebox.start(channel, name, time + offset - startTime);
    });
  }
  voicebox.time = startTime;
};
