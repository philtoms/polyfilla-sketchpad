import circuit from '/node_modules/dom-circuit/index.js';

import autograph, { title, tempo, timeSignature } from './autograph.js';
import stave from './stave.js';
import metronome from './metronome.js';
import touch from './canvas/touch-area.js';
import backdrop from './canvas/touch-backdrop.js';
import keyboard_ from './keyboard.js';
import player, { go, record, start, stop, playback } from './player/index.js';

export default () =>
  circuit({
    autograph: {
      title,
      tempo,
      timeSignature,
      ...autograph,
    },

    stave,
    metronome,

    compose: {
      '$/player/go'() {
        this.el.className = 'compose';
      },
      backdrop,
      touch,
      keyboard_,
    },

    player: {
      go$click: go,
      'start$/compose/touch/touchstart': start,
      'stop$/compose/touch/touchend': stop,
      'record$/compose/touch/touchmove': record,
      playback,
      ...player,
    },
  });
