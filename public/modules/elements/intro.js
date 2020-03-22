import {
  define,
  render,
  useContext
} from 'https://unpkg.com/hooked-elements?module';

import tempo from './tempo.js';

export default context => {
  define('#intro', {
    init() {
      tempo(context);
      render(this);
    },
    onclick(e) {
      if (e.target.type === 'submit') {
        e.preventDefault();
        context.provide({ ...context.value, state: 'compose' });
      }
    },
    render() {
      const { state } = useContext(context);
      this.element.className = state;
    }
  });
};
