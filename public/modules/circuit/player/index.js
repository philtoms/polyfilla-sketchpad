import voicebox from './voices.js';
import quantize from './quantize.js';

export { start, stop, record } from './record.js';
export { playback } from './playback.js';

export default {
  'data$/score/go': (acc, data) => ({
    ...acc,
    ...data,
    record: {
      previousNote: '',
      nextNote: 0,
      nextBar: 0,
      nextTime: null,
    },
    quantize: quantize(data.autograph, data.bars),
    voicebox: voicebox(data.autograph),
  }),
  '$/score/autograph_'({ tempo, timeSignature }) {
    acc.voicebox.tempo = tempo;
    acc.voicebox.timeSignature = timeSignature;
  },
};
