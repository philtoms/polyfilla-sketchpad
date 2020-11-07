import circuit from '/node_modules/dom-circuit/index.js';

import metronome from './circuit/metronome.js';
import player, { start, stop, playback } from './circuit/player.js';
import stave from './circuit/stave.js';
import score, { title, tempo, signature } from './circuit/score.js';
import touch from './circuit/canvas/touch-area.js';
import backdrop from './circuit/canvas/touch-backdrop.js';

export default () =>
  circuit({
    metronome,
    score: {
      title,
      tempo,
      signature,
      stave,
      ...score,
    },

    canvas: {
      touch,
      backdrop,
    },

    player: {
      start,
      stop,
      playback,
      ...play,
    },

    go$click() {
      this.signal('/score/start');
    },

    $state() {
      this.el.className = this.id;
    },
  })({ voicebox });
