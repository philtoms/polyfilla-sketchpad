import {
  define,
  render,
  useContext
} from 'https://unpkg.com/hooked-elements?module';

import { calibrate } from '../functions/tempo.js';

export default context => {
  define('.calibrate', {
    init() {
      this.bpm =
        Array.from(this.element.children).find(el => el.type === 'number') ||
        {};
      this.bpm.placeholder = `bpm = 100`;
      render(this);
    },
    onClick(e) {
      e.preventDefault();
      if (e.target.type === 'button') {
        context.provide({ ...context.value, bpm: calibrate() });
      }
    },
    render() {
      const { bpm = '' } = useContext(context);
      this.bpm.value = bpm;
    }
  });
};
