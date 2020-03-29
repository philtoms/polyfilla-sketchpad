const { define, render, useContext } = hookedElements;

import channels from './channels.js';
import touch from './touch-area.js';
import backdrop from './touch-backdrop.js';

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
