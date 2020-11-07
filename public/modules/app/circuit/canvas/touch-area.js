import { copy, draw, fade } from '../utils/touch.js';

export function $ontouchstart(acc, e) {
  e.preventDefault();

  const { ctxDraw, ctxCopy } = acc;
  this.el.addEventListener('mousemove', mousemove, false);
  const touch = ctxCopy((e.changedTouches || [e])[0], 'fill');
  const bvn = this.signal('/player/play', touch.channel, touch);
  ctxDraw(touch);
  return { ...acc, bvn };
}

export function $ontouchmove(acc, e) {
  e.preventDefault();

  const { ctxDraw, ctxCopy } = acc;
  const touch = ctxCopy((e.changedTouches || [e])[0]);
  const bvn = this.signal('/player/play', touch.channel, touch);
  ctxDraw(touch);
  return { ...acc, bvn };
}

export function $ontouchend(acc, e) {
  e.preventDefault();

  const { ctxCopy } = acc;
  const touch = ctxCopy((e.changedTouches || [e])[0]);
  this.el.removeEventListener('mousemove', mousemove);
  this.signal('/player/stop', touch);
}

const mousemove = $ontouchmove;

export default {
  $state(acc) {
    const {
      backdrop: { noteRange },
      ctxDraw,
      ctxCopy,
    } = acc;
    const el = this.el;
    if (el.offsetParent) {
      ctxCopy = copy(
        el.offsetLeft + el.offsetParent.offsetLeft,
        el.offsetTop + el.offsetParent.offsetTop
      );
    }
    if (noteRange && !ctxDraw) {
      const drawCtx = el.getContext('2d');
      ctxDraw = draw(drawCtx);
      el.width = noteRange.orange * noteRange.ospan;
      el.height = noteRange.range * noteRange.span;
      fade(drawCtx, el.width, el.height);
    }
    return { ...acc, ctxDraw, ctxCopy };
  },
  $ontouchstart,
  $ontouchmove,
  $ontouchend,
  $onmousedown: $ontouchstart,
  $onmouseup: $ontouchend,
};
