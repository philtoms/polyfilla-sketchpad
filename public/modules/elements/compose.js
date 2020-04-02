import channels from './channels.js';
import touch from './touch-area.js';
import backdrop from './touch-backdrop.js';
import metronome from './metronome.js';
import controls from './controls.js';

const { define, render, useContext } = hookedElements;

export default context => {
  define('#compose', {
    init() {
      render(this);
      touch(context);
      backdrop(context);
      channels(context);
      metronome(context);
      controls(context);
    },
    render() {
      const { state } = useContext(context);
      this.element.className = state;
    }
  });
};
