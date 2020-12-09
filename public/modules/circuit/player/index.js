import voicebox from '../../utils/voicebox.js';

export { record, toggle } from './record.js';
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
    go: true,
  };
}

export default {
  data: (acc, data) => ({
    ...acc,
    data,
  }),
  go,
};
