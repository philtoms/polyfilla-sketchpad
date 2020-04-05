import { setRange, scale, color, select } from '../melody/notes.js';

const { define, render, useContext } = hookedElements;

export default (context) => {
  define('#bars', {
    init() {
      render(this);
    },
    render() {
      const { state } = useContext(context);
      if (state === 'layout') {
        const noteRange = setRange(
          this.element.parentElement.clientWidth,
          this.element.parentElement.clientHeight
        );
        const { range, span, orange, ospan } = noteRange;
        this.element.parentElement.style.height = `${range * span}px`;
        this.element.height = range * span;
        this.element.width = orange * ospan;

        const ctx = this.element.getContext('2d');
        ctx.beginPath();
        for (let j = 0, idx = 0, x = 0; j < orange; j++, x += ospan) {
          for (let i = 0, y = 0; i < range; i++, y += span, idx++) {
            ctx.fillStyle = `rgba(${color[select(x + 1, y + 1).key]},0.5)`;
            // ctx.fillStyle = `rgba(10,20,30,${(1 + (idx % scale.length)) / 20})`;
            // ctx.fillStyle = `rgba(${color[select(x + 1, y + 1).key]},${
            //   (1 + (idx % scale.length)) / 10
            // })`;
            ctx.fillRect(x, y, ospan, span);
          }
        }

        // for (let i = 1, j = ospan + ospan / 2; i < orange; i++, j += ospan) {
        //   ctx.beginPath();
        //   ctx.lineTo(j + 1, this.element.height);
        //   ctx.lineWidth = ospan;
        //   ctx.strokeStyle = `rgba(0,0,0,${i / 10})`;
        //   ctx.stroke();
        // }
        context.provide({ ...context.value, state: 'compose', noteRange });
      }
    },
  });
};
