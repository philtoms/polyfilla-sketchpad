import circuit from '/node_modules/dom-circuit/index.js';

import autograph, { title, tempo, timeSignature } from './autograph.js';
import stave from './stave.js';
import metronome from './metronome.js';
import touch from './canvas/touch-area.js';
import backdrop from './canvas/touch-backdrop.js';
import player, { go, start, play, stop, playback } from './player/index.js';

export default () =>
  circuit({
    autograph: {
      '#title': title,
      tempo,
      timeSignature,
      ...autograph,
    },

    stave,
    metronome,

    'compose$/player/go': {
      $state() {
        this.el.className = 'compose';
      },
      backdrop,
      touch,
    },

    player: {
      go$click: go,
      'start$/compose/touch/touchstart': start,
      'play$/compose/touch/touchmove': play,
      'stop$/compose/touch/touchend': stop,
      playback,
      ...player,
    },
  })();
