import voicebox from '../../utils/voicebox.js';

export { start, stop, record } from './record.js';
export { playback } from './playback.js';

export function go(acc, e) {
  e.preventDefault();
  this.el.className = 'compose';
  return {
    ...acc,
    record: {
      previousNote: '',
      nextNote: 0,
      nextBar: 0,
      nextTime: null,
    },
    voicebox: voicebox.init(acc.data.autograph),
  };
}

export default {
  data: (acc, data) => ({
    ...acc,
    data,
  }),
  go,
  'tempo$/autograph/tempo'(acc, value) {
    acc.voicebox.tempo = value;
    return acc;
  },
  'timeSignature$/autograph/timeSignature'(acc, value) {
    acc.voicebox.timeSignature = value;
    return acc;
  },
};
