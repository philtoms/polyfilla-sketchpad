import {
  define,
  render,
  useContext
} from 'https://unpkg.com/hooked-elements?module';

import { basenotes } from '../melody/notes.js';

export default context => {
  define('#bars', {
    init() {
      this.ctx = this.element.getContext('2d');
      this.width = this.element.width;
      this.height = this.element.height;
      render(this);
    },
    render() {
      const { ctx, width, height } = this;
      for (let i = 0, j = 20; i <= basenotes.length; i++, j += 40) {
        ctx.beginPath();
        ctx.moveTo(0, j);
        ctx.lineTo(width, j);
        ctx.lineWidth = 40;
        ctx.strokeStyle = `rgba(10,20,30,${i / 20})`;
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.moveTo(width * 0.75, 0);
      ctx.lineTo(width * 0.75, height);
      ctx.lineWidth = width * 0.5;
      ctx.strokeStyle = `rgba(0,20,00,0.2)`;
      ctx.stroke();
      // document
      //   .getElementById('compose-channels')
      //   .addEventListener('mousedown', replaceReplay);
    }
  });
};
