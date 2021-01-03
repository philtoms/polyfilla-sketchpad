import { copy, draw, fade } from './canvas.js';
import { select } from './notes.js';

const touchCtx = (el, { backdrop: { noteRange }, ctxDraw }) => {
  if (noteRange && !ctxDraw) {
    const drawCtx = el.getContext('2d');
    ctxDraw = draw(drawCtx);
    el.width = noteRange.orange * noteRange.ospan;
    el.height = noteRange.range * noteRange.span;
    fade(drawCtx, el.width, el.height);
  }
  return ctxDraw;
};

const touchDraw = ({ ctxDraw, ctxCopy, keyboard }, touches, fill = '') => {
  const touch = ctxCopy(touches, fill);
  if (touch) {
    ctxDraw(touch);
    const name = select(touch.pageX, touch.pageY, !fill, keyboard).name;
    if (name) {
      return { name, vid: touch.channel, touch };
    }
  }
};

function $touchstart(acc, e) {
  return {
    ...acc,
    ...touchDraw(acc, e.changedTouches || [e], 'fill'),
    draw: true,
  };
}

function $touchmove(acc, e) {
  return acc.draw
    ? {
        ...acc,
        ...touchDraw(acc, e.changedTouches || [e]),
      }
    : acc;
}

function $touchend(acc, e) {
  const { ctxCopy } = acc;
  const touch = ctxCopy(e.changedTouches || [e]);
  return { ...acc, touch, draw: false };
}

export default {
  $state(acc) {
    let { ctxCopy } = acc;
    const el = this.el;
    if (el.offsetParent) {
      ctxCopy = copy(
        el.offsetLeft + el.offsetParent.offsetLeft,
        el.offsetTop + el.offsetParent.offsetTop
      );
    }
    return { ...acc, ctxCopy, ctxDraw: touchCtx(el, acc) };
  },
  $draw(acc, touch) {
    const ctxDraw = touchCtx(this.el, acc);
    ctxDraw(touch);
    return { ...acc, ctxDraw };
  },
  $touchstart,
  $touchmove,
  $touchend,
  $mousedown(acc, e) {
    return this.signal('./touchstart', {
      pageX: e.pageX - 7,
      pageY: e.pageY - 15,
    });
  },
  $mouseup(acc, e) {
    return this.signal('./touchend', {
      pageX: e.pageX - 7,
      pageY: e.pageY - 15,
    });
  },
  $mousemove(acc, e) {
    return this.signal('./touchmove', {
      pageX: e.pageX - 7,
      pageY: e.pageY - 15,
    });
  },
};
