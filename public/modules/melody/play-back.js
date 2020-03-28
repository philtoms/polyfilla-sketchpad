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

export const playback = (voicebox, startpoint, channel = 0) => {
  const channels = [].concat(channel);
  const startTime = events[startpoint].time;
  voicebox.schedule(
    startTime,
    5,
    events.slice(startpoint).reduce(
      (acc, event) =>
        acc.concat(
          channels.map(channel => ({
            time: event[channel].time,
            spn: event[channel].name,
            vid: channel
          }))
        ),
      []
    )
  );
};
