import { setRange, scale, color, select } from './utils/notes.js';

export default (el) => {
  const noteRange = setRange(
    el.parentElement.clientWidth,
    el.parentElement.clientHeight
  );
  const { range, span, orange, ospan } = noteRange;
  el.parentElement.style.height = `${range * span}px`;
  el.height = range * span;
  el.width = orange * ospan;

  const ctx = el.getContext('2d');
  ctx.beginPath();
  for (let j = 0, idx = 0, x = 0; j < orange; j++, x += ospan) {
    for (let i = 0, y = 0; i < range; i++, y += span, idx++) {
      ctx.fillStyle = `rgba(${color[select(x + 1, y + 1).key]},0.5)`;
      ctx.fillRect(x, y, ospan, span);
    }
  }
};
