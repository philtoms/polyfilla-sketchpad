import {
  define,
  render,
  useContext
} from 'https://unpkg.com/hooked-elements?module';

import calibrate from './calibrate.js';

export default context => {
  define('#intro', {
    init() {
      calibrate(context);
      render(this);
    },
    onclick(e) {
      if (e.target.type === 'submit') {
        e.preventDefault();
        this.voicebox.init();
        context.provide({ ...context.value, state: 'compose' });
      }
    },
    render() {
      const { state, voicebox } = useContext(context);
      this.voicebox = voicebox;
      this.element.className = state;
    }
  });
};
