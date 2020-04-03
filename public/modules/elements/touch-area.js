import { copy, draw, fade } from '../utils/touch.js';
import player from '../melody/player.js';

const { define, render, useContext } = hookedElements;

export default context => {
  const { play, stop } = player(context);
  define('#touch', {
    init() {
      const el = this.element;
      context.value.draw = draw(el.getContext('2d'));
      // bind mouse events to touch
      this.mousemove = this.ontouchmove.bind(this);
      fade(el.getContext('2d'), el.width, el.height);
      render(this);
    },
    ontouchstart(e) {
      e.preventDefault();
      this.element.addEventListener('mousemove', this.mousemove, false);
      const touch = this.copy((e.changedTouches || [e])[0], 'fill');
      const note = play(touch.channel, touch);
      this.draw(touch);
      context.provide({ ...context.value, note });
    },

    ontouchmove(e) {
      e.preventDefault();
      const touch = this.copy((e.changedTouches || [e])[0]);
      const note = play(touch.channel, touch);
      this.draw(touch);
      context.provide({ ...context.value, note });
    },

    ontouchend(e) {
      e.preventDefault();
      const touch = this.copy((e.changedTouches || [e])[0]);
      this.element.removeEventListener('mousemove', this.mousemove);
      stop(touch);
    },

    onmousedown(e) {
      this.ontouchstart(e);
    },
    onmouseup(e) {
      this.ontouchend(e);
    },

    render() {
      const el = this.element;
      const parent = el.offsetParent || { offsetLeft: 0, offsetTop: 0 };
      this.copy = copy(
        el.offsetLeft + parent.offsetLeft,
        el.offsetTop + parent.offsetTop
      );
      this.draw = useContext(context).draw;
    }
  });
};
