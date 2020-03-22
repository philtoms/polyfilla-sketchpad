import {
  define,
  render,
  useContext
} from 'https://unpkg.com/hooked-elements?module';

import touch from './touch-area.js';
import backdrop from './touch-backdrop.js';
import channels from './channels.js';

export default context => {
  define('#compose', {
    init() {
      render(this);
      touch(context);
      backdrop(context);
      channels(context);
    },
    render() {
      const { state } = useContext(context);
      this.element.className = state;
    }
  });
};
