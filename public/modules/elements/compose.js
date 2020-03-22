import {
  define,
  render,
  useContext
} from 'https://unpkg.com/hooked-elements?module';

import channels from './channels.js';
import touch from './touch-area.js';
import backdrop from './touch-backdrop.js';
import { start } from '../functions/tempo.js';

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
      start();
    }
  });
};
