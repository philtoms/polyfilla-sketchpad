const emptyChannels = {
  0: [],
  1: [],
  2: []
};

let events = [];
let lastTime = 0;
export const register = (voicebox, channel, name, touch, time) => {
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
  return event;
};

export const playback = (voicebox, startpoint, channel = 0) => {
  const channels = [].concat(channel);
  voicebox.schedule(
    events[startpoint].time,
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
