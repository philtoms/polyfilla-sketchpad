import circuit from '/node_modules/dom-circuit/index.js';

import score, { title, tempo, timeSignature } from './score.js';
import stave from './stave.js';
import metronome from './metronome.js';
import go from './compose/go.js';
import touch from './compose/touch-area.js';
import backdrop from './compose/touch-backdrop.js';
import keyboard_ from './keyboard.js';
import player, { record, start, stop, playback } from './player/index.js';

export default () =>
  circuit({
    score: {
      autograph: {
        title,
        tempo,
        timeSignature,
      },
      go$click: go,
      ...score,
    },

    stave,
    metronome,

    compose: {
      backdrop,
      touch,
      keyboard_,
      '$/score/go'() {
        this.el.className = 'compose';
      },
    },

    player: {
      'start$/compose/touch/touchstart': start,
      'stop$/compose/touch/touchend': stop,
      'record$/compose/touch/touchmove': record,
      playback,
      ...player,
    },
  });
