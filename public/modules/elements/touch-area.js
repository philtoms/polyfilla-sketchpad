import {
  define,
  render,
  useContext
} from 'https://unpkg.com/hooked-elements?module';

import { copy, draw, fade } from '../functions/touch.js';
import { play, stop, speeds } from '../melody/play.js';

let lastTouch;
export default context => {
  define('#touch', {
    init() {
      const el = this.element;
      this.ctx = el.getContext('2d');
      // bind mouse events to touch
      this.mousemove = this.ontouchmove.bind(this);
      setInterval(fade(this.ctx, el.width, el.height), 30);
      render(this);
    },
    ontouchstart(e) {
      e.preventDefault();
      this.element.addEventListener('mousemove', this.mousemove, false);
      speeds.length = 0;
      const touch = this.copy((e.changedTouches || [e])[0], 'fill');
      const note = play(this.voicebox, touch.channel, touch);
      draw(this.ctx, touch, touch);
      lastTouch = touch;
      context.provide({ ...context.value, note });
    },

    ontouchmove(e) {
      e.preventDefault();
      const touch = this.copy((e.changedTouches || [e])[0]);
      const note = play(this.voicebox, touch.channel, touch, lastTouch);
      draw(this.ctx, lastTouch, touch);
      lastTouch = touch;
      context.provide({ ...context.value, note });
    },

    ontouchend(e) {
      e.preventDefault();
      this.element.removeEventListener('mousemove', this.mousemove);
      stop();
    },

    onmousedown(e) {
      this.ontouchstart(e);
    },
    onmouseup(e) {
      this.ontouchend(e);
    },

    render() {
      const el = this.element;
      this.copy = copy(el.offsetLeft, el.offsetTop);
      this.voicebox = useContext(context).voicebox;
    }
  });
};
