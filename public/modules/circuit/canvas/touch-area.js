import { copy, draw, fade } from '../../utils/touch.js';
import { select } from '../../utils/notes.js';

const touchDraw = ({ ctxDraw, ctxCopy, keyboard }, touches, fill = '') => {
  const touch = ctxCopy(touches, fill);
  ctxDraw(touch);
  const name = select(touch.pageX, touch.pageY, keyboard).name;
  if (name) {
    return { name, vid: touch.channel, touch };
  }
};

function $touchstart(acc, e) {
  e.preventDefault();
  return {
    ...acc,
    ...touchDraw(acc, (e.changedTouches || [e])[0], 'fill'),
    draw: true,
  };
}

function $touchmove(acc, e) {
  e.preventDefault();
  if (acc.draw) {
    return {
      ...acc,
      ...touchDraw(acc, (e.changedTouches || [e])[0]),
    };
  }
}

function $touchend(acc, e) {
  e.preventDefault();
  const { ctxCopy } = acc;
  const touch = ctxCopy((e.changedTouches || [e])[0]);
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
    return this.signal('./touchstart', e);
  },
  $mouseup(acc, e) {
    return this.signal('./touchend', e);
  },
  $mousemove(acc, e) {
    return this.signal('./touchmove', e);
  },
};
