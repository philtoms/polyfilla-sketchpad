import { copy, draw } from './canvas.js';
import { select } from './notes.js';

const touchCtx = (acc, el) => {
  let {
    backdrop: { noteRange },
    ctxDraw,
    ctxCopy,
  } = acc;

  if (noteRange && !ctxDraw) {
    const drawCtx = el.getContext('2d');
    el.width = noteRange.orange * noteRange.ospan;
    el.height = noteRange.range * noteRange.span;
    ctxDraw = draw(drawCtx, el.width, el.height);
  }
  if (el.offsetParent) {
    ctxCopy = copy(
      el.offsetLeft + el.offsetParent.offsetLeft,
      el.offsetTop + el.offsetParent.offsetTop
    );
  }
  return { ...acc, ctxCopy, ctxDraw };
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
  const ctx = touchCtx(acc, this.el);
  return {
    ...ctx,
    ...touchDraw(ctx, e.changedTouches || [e], 'fill'),
    draw: true,
  };
}

function $touchmove(acc, e) {
  if (acc.draw) {
    const ctx = touchCtx(acc, this.el);
    return {
      ...ctx,
      ...touchDraw(ctx, e.changedTouches || [e]),
    };
  }
}

function $touchend(acc, e) {
  const { ctxCopy } = acc;
  const touch = ctxCopy(e.changedTouches || [e]);
  return { ...acc, touch, draw: false };
}

export default {
  $state(acc) {
    return touchCtx(acc, this.el);
  },
  $draw(acc, touch) {
    const { ctxDraw } = touchCtx(acc, this.el);
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
