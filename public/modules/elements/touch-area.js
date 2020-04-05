import { copy, draw, fade } from '../utils/touch.js';
import player from '../melody/player.js';

const { define, render, useContext } = hookedElements;

export default (context) => {
  const { play, stop } = player(context);
  define('#touch', {
    init() {
      const el = this.element;
      context.value.drawCtx = el.getContext('2d');
      // bind mouse events to touch
      this.mousemove = this.ontouchmove.bind(this);
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
      if (el.offsetParent) {
        this.copy = copy(
          el.offsetLeft + el.offsetParent.offsetLeft,
          el.offsetTop + el.offsetParent.offsetTop
        );
      }
      const { drawCtx, noteRange } = useContext(context);
      if (noteRange && !this.draw) {
        el.width = noteRange.orange * noteRange.ospan;
        el.height = noteRange.range * noteRange.span;
        this.draw = draw(drawCtx);
        fade(drawCtx, el.width, el.height);
      }
    },
  });
};
