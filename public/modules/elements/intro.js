import {
  define,
  render,
  useContext
} from 'https://unpkg.com/hooked-elements?module';

import calibrate from './calibrate.js';
import synth from '../functions/synth.js';

export default context => {
  define('#intro', {
    init() {
      calibrate(context);
      render(this);
    },
    onclick(e) {
      if (e.target.type === 'submit') {
        e.preventDefault();
        if (!context.value.synth) {
          context.value.synth = synth();
        }
        context.provide({ ...context.value, state: 'compose' });
      }
    },
    render() {
      const { state } = useContext(context);
      this.element.className = state;
    }
  });
};
