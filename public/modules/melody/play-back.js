export const channels = {
  0: [],
  1: [],
  2: []
};
export const register = (channel, name, touch) => {
  const time = Tone.now();
  const idx = channels[channel].length;
  const note = {
    idx,
    channel,
    name,
    time,
    touch
  };
  channels[channel].push(note);
  return note;
};
