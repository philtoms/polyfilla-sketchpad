import voicebox from '../../voicebox.js';

export { start, play, stop } from './play.js';
export { playback } from './playback.js';

export function go(acc, e) {
  e.preventDefault();
  this.el.className = 'compose';
  return {
    ...acc,
    play: {
      previousNote: '',
      nextNote: 0,
      nextBar: 0,
      nextTime: null,
    },
    voicebox: voicebox.init(acc.data.score),
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
