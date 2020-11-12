import circuit from '/node_modules/dom-circuit/index.js';

import metronome from './circuit/metronome.js';
import player, {
  go,
  start,
  play,
  stop,
  playback,
} from './circuit/player/index.js';
import stave from './circuit/stave.js';
import autograph, { title, tempo, timeSignature } from './circuit/autograph.js';
import touch from './circuit/canvas/touch-area.js';
import backdrop from './circuit/canvas/touch-backdrop.js';

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
