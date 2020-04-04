import { setRange } from '../melody/notes.js';

const { define, render, useContext } = hookedElements;

export default (context) => {
  define('#bars', {
    init() {
      render(this);
    },
    render() {
      const { state } = useContext(context);
      if (state === 'layout') {
        const ctx = this.element.getContext('2d');
        const noteRange = setRange(
          this.element.parentElement.clientWidth,
          this.element.parentElement.clientHeight
        );
        const { range, span, span2, orange, ospan } = noteRange;
        this.element.height = range * span;
        this.element.width = orange * ospan;
        for (let i = 0, j = span2; i <= range; i++, j += span) {
          ctx.beginPath();
          ctx.moveTo(0, j);
          ctx.lineTo(this.element.width, j);
          ctx.lineWidth = span;
          ctx.strokeStyle = `rgba(10,20,30,${i / span2})`;
          ctx.stroke();
        }
        for (let i = 1, j = ospan + ospan / 2; i < orange; i++, j += ospan) {
          ctx.beginPath();
          ctx.moveTo(j + 1, 0);
          ctx.lineTo(j + 1, this.element.height);
          ctx.lineWidth = ospan;
          ctx.strokeStyle = `rgba(0,20,00,${i / 10})`;
          ctx.stroke();
        }
        context.provide({ ...context.value, state: 'compose', noteRange });
      }
    },
  });
};
