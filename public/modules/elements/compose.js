import {
  define,
  render,
  useContext
} from 'https://unpkg.com/hooked-elements?module';

import touch from './touch-area.js';
import backdrop from './touch-backdrop.js';
import channels from './channels.js';
import startContext from '../functions/start-audio-context.js';

const samples = {
  A0: 'A0.mp3',
  A1: 'A1.mp3',
  A2: 'A2.mp3',
  A3: 'A3.mp3',
  A4: 'A4.mp3',
  A5: 'A5.mp3',
  A6: 'A6.mp3',
  A7: 'A7.mp3'
};

export default context => {
  define('#compose', {
    init() {
      render(this);
      touch(context);
      backdrop(context);
      channels(context);

      // synth = new Tone.AMSynth().toMaster();
      context.value.synth = new Tone.Sampler(samples).toMaster();
      startContext(Tone.context);
      try {
        Object.keys(samples).forEach(s => synth.triggerAttackRelease(s));
      } catch (e) {}
    },
    render() {
      const { state } = useContext(context);
      this.element.className = state;
    }
  });
};
