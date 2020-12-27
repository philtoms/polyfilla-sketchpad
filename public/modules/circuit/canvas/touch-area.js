import { copy, draw, fade } from '../../utils/canvas.js';
import { select } from '../../utils/notes.js';

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
  // e.preventDefault();
  return {
    ...acc,
    ...touchDraw(acc, e.changedTouches || [e], 'fill'),
    draw: true,
  };
}

function $touchmove(acc, e) {
  // if (e.cancelable) {
  //   e.preventDefault();
  // }
  if (acc.draw) {
    return {
      ...acc,
      ...touchDraw(acc, e.changedTouches || [e]),
    };
  }
}

function $touchend(acc, e) {
  // e.preventDefault();
  const { ctxCopy } = acc;
  const touch = ctxCopy(e.changedTouches || [e]);
  return { ...acc, touch, draw: false };
}

export default {
  $state(acc) {
    let {
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
  $draw: ({ ctxDraw }, touch) => {
    ctxDraw(touch);
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
