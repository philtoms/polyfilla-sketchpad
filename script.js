(function (cache, modules) {
  function require(i) { return cache[i] || get(i); }
  function get(i) {
    var exports = {}, module = {exports: exports};
    modules[i].call(exports, window, require, module, exports);
    return (cache[i] = module.exports);
  }
  require.E = function (exports) { return Object.defineProperty(exports, '__esModule', {value: true}); };
  require.I = function (m) { return m.__esModule ? m.default : m; };
  return require.I(require(0));
}([],[function (global, require, module, exports) {
// index.js
'use strict';
const log = require.I(require(1));
const intro = require.I(require(2));
const compose = require.I(require(6));
const list = require.I(require(15));
const voicebox = require.I(require(16));

const { createContext } = hookedElements;
const assets = 'https://cdn.glitch.com/ee40e085-f63b-4369-9a4a-dc97bb39e335%2F';

const samples = {
  A0: `${assets}A0.mp3`,
  A1: `${assets}A1.mp3`,
  A2: `${assets}A2.mp3`,
  A3: `${assets}A3.mp3`,
  A4: `${assets}A4.mp3`,
  A5: `${assets}A5.mp3`,
  A6: `${assets}A6.mp3`,
  A7: `${assets}A7.mp3`
};

const startup = () => {
  const context = createContext({
    state: 'intro',
    voicebox: voicebox().create(0, samples)
  });
  intro(context);
  compose(context);
  list(context);
};

document.addEventListener('DOMContentLoaded', startup);

},function (global, require, module, exports) {
// modules/utils/log.js
'use strict';
window.log = msg => {
  console.log(...[].concat(msg));
};
require.E(exports).default = log;

},function (global, require, module, exports) {
// modules/elements/intro.js
'use strict';
const quantize = require.I(require(3));
const merge = require.I(require(4));
const client = require.I(require(5));

const { define, render, useContext } = hookedElements;

require.E(exports).default = context => {
  const { get, post } = client(context);

  const provide = state => {
    context.provide(merge(context.value, state));
    return context.value;
  };

  define('#tempo', {
    oninput({ target: { value } }) {
      const { score, state } = provide({ score: { tempo: value } });
      if (state === 'intro') post(score, 'score');
    },
    render() {
      const { voicebox, score } = useContext(context);
      if (score && score.tempo) {
        voicebox.tempo = score.tempo;
        this.element.value = score.tempo;
        this.element.nextElementSibling.innerText = score.tempo;
      }
    }
  });
  define('#signature', {
    oninput({ target: { value } }) {
      const { score, state } = provide({ score: { signature: value } });
      if (state === 'intro') post(score, 'score');
    },
    render() {
      const { voicebox, score } = useContext(context);
      if (score && score.signature) {
        voicebox.signature = score.signature;
        this.element.value = score.signature;
      }
    }
  });
  define('#title', {
    init() {
      const title = this.element.value;
      provide({ title });
      render(this);
    },
    onchange({ target: { value } }) {
      provide({
        title: value
      });
    },
    render() {
      const { title } = useContext(context);
      if (!this.title) {
        this.title = title;
      } else if (this.title !== title) {
        window.location.href = window.location.href.replace(this.title, title);
      }
    }
  });
  define('#intro', {
    init() {
      render(this);
      get().then(data => {
        const { score = context.value.score, events = [] } = data;
        provide({
          score,
          data: events.filter(Boolean)
        });
      });
    },
    onclick(e) {
      if (e.target.type === 'submit') {
        e.preventDefault();
        const { score, voicebox, data } = context.value;
        voicebox.init(score);
        provide({
          state: 'compose',
          quantize: quantize(voicebox.signature, data)
        });
        e.target.className = 'compose';
      }
    },
    render() {
      const { state } = useContext(context);
      this.element.className = state;
    }
  });
};

},function (global, require, module, exports) {
// modules/melody/quantize.js
'use strict';
const BIGTIME = Number.MAX_VALUE;

require.E(exports).default = (signature, data) => {
  const [beats, noteValue] = signature;
  const bar = beats * noteValue;
  const q32 = bar / 32;
  const q16 = q32 + q32;
  const q8 = q16 + q16;
  const q4 = q8 + q8;
  const q2 = q4 + q4;
  const q1 = bar;
  const qvMap = Object.entries({
    d1: q1 + q2,
    1: q1,
    '1t': (q1 / 3).toPrecision(3),
    d2: q2 + q4,
    2: q2,
    '2t': (q2 / 3).toPrecision(3),
    d4: q4 + q8,
    4: q4,
    '4t': (q4 / 3).toPrecision(3),
    d8: q8 + q16,
    8: q8,
    '8t': (q8 / 3).toPrecision(3),
    16: q16
  }).reduce((acc, [k, v]) => ({ ...acc, [v]: [k, Number.parseFloat(v)] }), {});
  const qvalues = Object.values(qvMap).map(([k, v]) => v);
  qvalues.sort((a, b) => b - a);

  const quantize = t => qvMap[qvalues.find(qt => t >= qt) || qvMap.q1d];

  const nudge = (time, idx) => {
    data[idx] = {
      time,
      [0]: {
        ...data[idx][0],
        time
      }
    };
    return time;
  };

  const snap = (time, idx) => {
    const twip = time % q16;
    if (twip) {
      for (let i = idx; i < data.length; i++) {
        nudge(data[i].time - twip, i);
      }
    }
    return data[idx].time;
  };

  const maybeTriple = (time1, time2, time3, qspace) => {
    const tt = time3 - time1;
    const i1 = time2 - time1;
    const i2 = time3 - time2;
    if (time3 && tt <= qspace) {
      if (Math.abs(i1 - i2) < q16) {
        const qt = quantize(Math.max((i1 + i2) / 2, q16));
        return qt[0].endsWith('t') && qt;
      }
    }
    return 0;
  };

  return (start = 0, end) => {
    let qbar = 0;
    for (
      // step back 3 for triples
      let idx = Math.max(0, Math.min(start, start - 3));
      idx < (end || data.length);
      idx++
    ) {
      const event = data[idx];
      const idx1 = idx + 1;
      const idx2 = idx + 2;
      const idx3 = idx + 3;
      const time1 = snap(event.time, idx);
      const time2 = idx1 < data.length ? data[idx1].time : 0;
      const time3 = idx2 < data.length ? data[idx2].time : 0;
      const time4 = idx3 < data.length ? data[idx3].time : BIGTIME;

      qbar = Math.floor(time1 / bar) * bar;
      const qnext = time2 - (time2 % q16) || qbar + bar;
      const duration = quantize(qnext - time1);
      console.log(qbar, time1, duration, qnext);
      if (qnext === time1) {
        nudge(qnext + q32, idx1);
      } else {
        const qspace = Math.min(
          Math.max(0, qbar + bar - time1),
          time4 - (time4 % q16) - time1
        );
        const qt = maybeTriple(time1, time2, time3, qspace);
        if (qt) {
          console.log(nudge(time1 + qt[1], idx1), qt);
          console.log(nudge(time1 + qt[1] * 2, idx2), qt);
          idx = idx2;
        }
      }
    }
    return data;
  };
};

},function (global, require, module, exports) {
// modules/utils/merge.js
'use strict';
const merge = (value, state = {}) =>
  Object.entries(state).reduce(
    (acc, [k, v]) => ({
      ...acc,
      [k]: Array.isArray(v)
        ? v
        : typeof v === 'object'
        ? { ...acc[k], ...merge(acc[k], v) }
        : v
    }),
    value
  );
require.E(exports).default = merge;

},function (global, require, module, exports) {
// modules/utils/client.js
'use strict';
require.E(exports).default = context => {
  const post = (data, path = '') =>
    fetch(`${context.value.title}/data/${path}`, {
      headers: {
        'Content-type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify(data)
    });

  const batched = [];
  setInterval(() => {
    if (batched.length) {
      const batch = batched.splice(0, Math.min(batched.length, 100));
      post(batch, 'batch');
    }
  }, 3000);
  const batch = data => {
    batched.push(data);
  };
  // .then(res => res.json())
  // .then(data => console.log(data)),

  const get = () =>
    fetch(`${context.value.title}/data`, {
      headers: {
        'Content-type': 'application/json'
      },
      method: 'GET'
    }).then(res => res.json());

  return {
    post,
    batch,
    get
  };
};

},function (global, require, module, exports) {
// modules/elements/compose.js
'use strict';
const channels = require.I(require(7));
const touch = require.I(require(10));
const backdrop = require.I(require(12));
const metronome = require.I(require(13));
const controls = require.I(require(14));

const { define, render, useContext } = hookedElements;

require.E(exports).default = context => {
  define('#compose', {
    init() {
      render(this);
      touch(context);
      backdrop(context);
      channels(context);
      metronome(context);
      controls(context);
    },
    render() {
      const { state } = useContext(context);
      this.element.className = state;
    }
  });
};

},function (global, require, module, exports) {
// modules/elements/channels.js
'use strict';
const player = require.I(require(8));

const { define, render, useContext } = hookedElements;

require.E(exports).default = context => {
  const { playback } = player(context);
  define('#channels', {
    init() {
      this.channels = Array.from(this.element.children).reduce(
        (acc, el, channel) => ({ ...acc, [channel]: el }),
        {}
      );
      render(this);
    },
    onclick(e) {
      e.preventDefault();
      const startpoint = e.target.id.split('-').pop();
      playback(parseInt(startpoint), 0);
    },
    render() {
      const { note, voicebox, data } = useContext(context);
      this.voicebox = voicebox;
      if (note && note !== this.note) {
        this.note = note;
        const { channel, name, idx } = note;
        const noteId = `${channel}-${idx}`;
        const event = `<span id="${noteId}" class="event"> ${name} </span>`;
        let node = document.getElementById(noteId);
        while (node) {
          const next = node.nextSibling;
          node.parentNode.removeChild(node);
          node = next;
        }
        this.channels[channel].innerHTML += event;
        const elNote = document.getElementById(noteId);
        this.element.scrollLeft = Math.max(0, elNote.offsetLeft - 375);
      }
      if (data != this.data) {
        this.data = data;
        // todo apply all channels
        const channel = 0;
        this.channels[channel].innerHTML = data
          .filter(Boolean)
          .reduce((acc, data) => {
            const { name, idx } = data[channel];
            const noteId = `${channel}-${idx}`;
            return `${acc}<span id="${noteId}" class="event"> ${name} </span>`;
          }, '');
      }
    }
  });
};

},function (global, require, module, exports) {
// modules/melody/player.js
'use strict';
const { select } = require(9);
const client = require.I(require(5));

const emptyChannels = {
  0: [],
  1: [],
  2: []
};

let previousEvent = {};
let lastTime = 0;
let nextBeat = 0;

require.E(exports).default = context => {
  const { batch } = client(context);
  const play = (channel, touch) => {
    const { voicebox } = context.value;
    const note = select(touch.pageX, touch.pageY);

    if (note && note !== previousEvent.name) {
      previousEvent = register(channel, note, touch);
      voicebox.play(0, note);
      return previousEvent;
    }
  };

  const stop = touch => {
    previousEvent.touch = touch;
    previousEvent = {};
  };

  const register = (channel, name, touch) => {
    const { voicebox, data, quantize } = context.value;
    if (!lastTime) {
      lastTime = data.length ? data[data.length - 1].time : 0;
    }
    let time = voicebox.nextTime(lastTime);
    if (time < lastTime) {
      time = data[nextBeat].time;
      voicebox.cancel(time);
      const events = data.filter(({ time: etime }) => etime < time);
      data.splice(0, data.length, ...events);
    }
    const idx = data.length;
    const event = {
      idx,
      channel,
      name,
      time,
      touch
    };
    data.push({ ...emptyChannels, time, [channel]: event });
    quantize(idx);
    batch(data[idx][channel]);
    lastTime = time;
    return event;
  };

  const playback = (startpoint, channel = 0) => {
    const { voicebox, data, draw = () => {} } = context.value;
    const channels = [].concat(channel);
    nextBeat = startpoint;
    voicebox.schedule(
      data.slice(startpoint).reduce(
        (acc, event) =>
          acc.concat(
            channels.map(channel => ({
              time: event[channel].time,
              spn: event[channel].name,
              vid: channel,
              cb: () => {
                nextBeat = event[channel].idx + 1;
                draw(event[channel].touch);
              }
            }))
          ),
        []
      )
    );
  };

  return {
    play,
    stop,
    playback
  };
};

},function (global, require, module, exports) {
// modules/melody/notes.js
'use strict';
const scale = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
exports.scale = scale;
const basenotes = [...scale, ...scale, ...scale]
  .slice(0, 400 / 40)
  .map((name, idx) => ({ name, pos: 380 - idx * 40, idx }));
exports.basenotes = basenotes;

let notes = basenotes;

const select = (oidx, y) => {
  const note = notes.find(({ pos }) => Math.abs(pos - y) < 20);
  if (note) {
    const octive =
      3 + Math.floor(note.idx / scale.length) + Math.floor(oidx / 200);
    return `${note.name}${octive}`;
  }
};
exports.select = select;

},function (global, require, module, exports) {
// modules/elements/touch-area.js
'use strict';
const { copy, draw, fade } = require(11);
const player = require.I(require(8));

const { define, render, useContext } = hookedElements;

require.E(exports).default = context => {
  const { play, stop } = player(context);
  define('#touch', {
    init() {
      const el = this.element;
      context.value.draw = draw(el.getContext('2d'));
      // bind mouse events to touch
      this.mousemove = this.ontouchmove.bind(this);
      setInterval(fade(el.getContext('2d'), el.width, el.height), 30);
      render(this);
    },
    ontouchstart(e) {
      e.preventDefault();
      this.element.addEventListener('mousemove', this.mousemove, false);
      const touch = this.copy((e.changedTouches || [e])[0], 'fill');
      const note = play(touch.channel, touch);
      this.draw(touch);
      context.provide({ ...context.value, note });
    },

    ontouchmove(e) {
      e.preventDefault();
      const touch = this.copy((e.changedTouches || [e])[0]);
      const note = play(touch.channel, touch);
      this.draw(touch);
      context.provide({ ...context.value, note });
    },

    ontouchend(e) {
      e.preventDefault();
      const touch = this.copy((e.changedTouches || [e])[0]);
      this.element.removeEventListener('mousemove', this.mousemove);
      stop(touch);
    },

    onmousedown(e) {
      this.ontouchstart(e);
    },
    onmouseup(e) {
      this.ontouchend(e);
    },

    render() {
      const el = this.element;
      const parent = el.offsetParent || { offsetLeft: 0, offsetTop: 0 };
      this.copy = copy(
        el.offsetLeft + parent.offsetLeft,
        el.offsetTop + parent.offsetTop
      );
      this.draw = useContext(context).draw;
    }
  });
};

},function (global, require, module, exports) {
// modules/utils/touch.js
'use strict';
const copy = (offsetX, offsetY) => (
  { identifier = 0, pageX, pageY, radiusX, radiusY, rotationAngle, force },
  paintType
) => ({
  channel: identifier,
  pageX: pageX - offsetX,
  pageY: pageY - offsetY,
  radiusX,
  radiusY,
  rotationAngle,
  force,
  paintType
});
exports.copy = copy;

const fade = (ctx, width, height) => () => {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    data[i + 3] = Math.max(0, data[i + 3] - 10);
  }
  ctx.putImageData(imageData, 0, 0);
};
exports.fade = fade;

let lastX, lastY;
const draw = ctx => ({ pageX, pageY, paintType }) => {
  ctx.beginPath();
  const color = `rgb(0,0,0)`;
  if (paintType === 'fill') {
    ctx.arc(pageX, pageY, 4, 0, 2 * Math.PI, false); // a circle at the start
    ctx.fillStyle = color;
    ctx.fill();
  } else {
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(pageX, pageY);
    ctx.lineWidth = 4;
    ctx.strokeStyle = color;
    ctx.stroke();
  }
  lastX = pageX;
  lastY = pageY;
};
exports.draw = draw;

},function (global, require, module, exports) {
// modules/elements/touch-backdrop.js
'use strict';
const { basenotes } = require(9);

const { define, render, useContext } = hookedElements;

require.E(exports).default = context => {
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
    }
  });
};

},function (global, require, module, exports) {
// modules/elements/metronome.js
'use strict';
const { define, useContext } = hookedElements;

require.E(exports).default = context => {
  define('#metronome', {
    render() {
      const { voicebox } = useContext(context);
      if (!this.voicebox) {
        this.voicebox = voicebox;
        this.voicebox.subscribe(beat => {
          this.element.className = `tick-${beat % 2}`;
          // console.log(beat, this.voicebox.time);
        });
      }
    }
  });
};

},function (global, require, module, exports) {
// modules/elements/controls.js
'use strict';
const quantize = require.I(require(3));

const { define, useContext } = hookedElements;

require.E(exports).default = context => {
  define('#controls', {
    onclick(e) {
      if (e.target.id === 'clear')
        context.provide({ ...context.value, data: [] });
      if (e.target.id === 'quantize') {
        context.provide({
          ...context.value,
          data: quantize(this.voicebox.signature, this.data)
        });
      }
    },
    render() {
      const { voicebox, data } = useContext(context);
      this.voicebox = voicebox;
      this.data = data;
    }
  });
};

},function (global, require, module, exports) {
// modules/elements/list.js
'use strict';
const player = require.I(require(8));
const client = require.I(require(5));

const { define, useContext } = hookedElements;

require.E(exports).default = context => {
  const { playback } = player(context);
  const { get } = client(context);

  define('#list', {
    onclick(e) {
      if (e.target.className === 'events') {
        context.value.title = e.target.previousSibling.innerText;
        get().then(data => {
          this.voicebox.init(data.score);
          context.value.data = data.events.filter(Boolean);
          playback(0, 0);
        });
      }
    },
    render() {
      const { voicebox } = useContext(context);
      this.voicebox = voicebox;
    }
  });
};

},function (global, require, module, exports) {
// modules/voicebox/index.js
'use strict';
const Voice = require.I(require(17));
const Source = require.I(require(19));

require.E(exports).default = options => {
  const subscriptions = [];
  const ctx = new (window.AudioContext || window.webkitAudioContext)(options);
  const source = Source(ctx);

  let _tempo = 60 / 120;
  let _scoreTempo = _tempo;
  let _beats = 4;
  let _noteValue = 1 / 4;
  let _ticks = 0;
  let _scheduled = [];

  const init = options => {
    voicebox.tempo = options.tempo;
    _scoreTempo = _tempo;
    voicebox.signature = options.signature;
    try {
      source();
    } catch (e) {}
    if (ctx.resume) {
      ctx.resume();
    }
    voicebox.time = 0;
    const clock = () => {
      source({ cb: clock, stop: _tempo });
      const tick = _ticks++ % _beats;
      subscriptions.forEach(cb => cb(tick));
    };
    clock();
    return ctx;
  };

  let baseTime = ctx.currentTime;
  const voices = {};
  const voicebox = {
    init,
    create: (vid, data) => (voices[vid] = Voice(ctx, data)) && voicebox,
    get time() {
      return Math.max(0, ctx.currentTime - baseTime);
    },
    set time(value) {
      baseTime = ctx.currentTime - value;
    },
    get tempo() {
      return _tempo * 60;
    },
    set tempo(value) {
      _tempo = 60 / value;
    },
    get signature() {
      return [_beats, _noteValue];
    },
    set signature(value) {
      _beats = parseInt(value.split('/')[0]);
      _noteValue = 1 / parseInt(value.split('/')[1]);
    },
    nextTime: lastTime => {
      const time = voicebox.time;
      if (time > lastTime + _tempo * _beats) voicebox.time = lastTime + _tempo;
      return voicebox.time;
    },
    subscribe: cb => {
      subscriptions.push(cb);
      return subscriptions.length - 1;
    },
    unsubscribe: sid => subscriptions.splice(sid, 1),
    play: (vid, spn, time = 0, cb) =>
      source({
        ...voices[vid](spn),
        start: time,
        cb
      }),
    schedule: events => {
      voicebox.cancel();
      const startTime = events.length && events[0].time;
      const lead = _scoreTempo * 2;
      _scheduled = events.map(({ vid, spn, time, cb }, idx) => {
        const next = idx ? ((time - startTime) * _tempo) / _scoreTempo : 0;
        return [
          voicebox.play(vid, spn, next + lead),
          source({ cb, stop: next + lead })
        ];
      });
      voicebox.time = startTime - lead;
    },
    cancel: time => {
      _scheduled.forEach(([s, d]) => {
        s.disconnect();
        d.onended = undefined;
      });
      voicebox.time = time;
    }
  };
  return voicebox;
};

},function (global, require, module, exports) {
// modules/voicebox/voice.js
'use strict';
const { fromSPN } = require(18);

require.E(exports).default = (ctx, sampleData) => {
  const naturals = [];
  const samples = {};
  Object.entries(sampleData).map(
    ([spn, url]) =>
      new Promise(resolve => {
        const request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.responseType = 'arraybuffer';
        request.onload = () => {
          ctx.decodeAudioData(
            request.response,
            buffer => {
              samples[spn] = { spn, buffer, playbackRate: 1 };
              naturals.push(samples[spn]);
              resolve();
            },
            err => console.error(err)
          );
        };
        request.send();
      })
  );

  return spn => {
    let sample = samples[spn];
    if (!sample) {
      ({ sample } = naturals.reduce(
        (acc, src) => {
          const interval = fromSPN(spn).midi - fromSPN(src.spn).midi;
          if (interval >= 0 && interval < acc.interval) {
            acc = {
              interval,
              sample: {
                ...src,
                spn,
                playbackRate: Math.pow(2, interval / 12)
              }
            };
          }
          return acc;
        },
        { interval: Number.MAX_SAFE_INTEGER }
      ));
    }
    return (samples[spn] = sample);
  };
};

},function (global, require, module, exports) {
// modules/voicebox/notes.js
'use strict';
const table = {
  C: {
    '-1': { hertz: 8.1758, midi: 0 },
    0: { hertz: 16.352, midi: 12 },
    1: { hertz: 32.703, midi: 24 },
    2: { hertz: 65.406, midi: 36 },
    3: { hertz: 130.81, midi: 48 },
    4: { hertz: 261.63, midi: 60 },
    5: { hertz: 523.25, midi: 72 },
    6: { hertz: 1046.5, midi: 84 },
    7: { hertz: 2093.0, midi: 96 },
    8: { hertz: 4186.0, midi: 108 },
    9: { hertz: 8372.0, midi: 120 },
    10: { hertz: 16744, midi: null }
  },
  'C#': {
    '-1': { hertz: 8.662, midi: 1 },
    0: { hertz: 17.324, midi: 13 },
    1: { hertz: 34.648, midi: 25 },
    2: { hertz: 69.296, midi: 37 },
    3: { hertz: 138.59, midi: 49 },
    4: { hertz: 277.18, midi: 61 },
    5: { hertz: 554.37, midi: 73 },
    6: { hertz: 1108.7, midi: 85 },
    7: { hertz: 2217.5, midi: 97 },
    8: { hertz: 4434.9, midi: 109 },
    9: { hertz: 8869.8, midi: 121 },
    10: { hertz: 17740, midi: null }
  },
  D: {
    '-1': { hertz: 9.177, midi: 2 },
    0: { hertz: 18.354, midi: 14 },
    1: { hertz: 36.708, midi: 26 },
    2: { hertz: 73.416, midi: 38 },
    3: { hertz: 146.83, midi: 50 },
    4: { hertz: 293.66, midi: 62 },
    5: { hertz: 587.33, midi: 74 },
    6: { hertz: 1174.7, midi: 86 },
    7: { hertz: 2349.3, midi: 98 },
    8: { hertz: 4698.6, midi: 110 },
    9: { hertz: 9397.3, midi: 122 },
    10: { hertz: 18795, midi: null }
  },
  'D#': {
    '-1': { hertz: 9.7227, midi: 3 },
    0: { hertz: 19.445, midi: 15 },
    1: { hertz: 38.891, midi: 27 },
    2: { hertz: 77.782, midi: 39 },
    3: { hertz: 155.56, midi: 51 },
    4: { hertz: 311.13, midi: 63 },
    5: { hertz: 622.25, midi: 75 },
    6: { hertz: 1244.5, midi: 87 },
    7: { hertz: 2489.0, midi: 99 },
    8: { hertz: 4978.0, midi: 111 },
    9: { hertz: 9956.1, midi: 123 },
    10: { hertz: 19912, midi: null }
  },
  E: {
    '-1': { hertz: 10.301, midi: 4 },
    0: { hertz: 20.602, midi: 16 },
    1: { hertz: 41.203, midi: 28 },
    2: { hertz: 82.407, midi: 40 },
    3: { hertz: 164.81, midi: 52 },
    4: { hertz: 329.63, midi: 64 },
    5: { hertz: 659.26, midi: 76 },
    6: { hertz: 1318.5, midi: 88 },
    7: { hertz: 2637.0, midi: 100 },
    8: { hertz: 5274.0, midi: 112 },
    9: { hertz: 10548, midi: 124 },
    10: { hertz: 21096, midi: null }
  },
  F: {
    '-1': { hertz: 10.914, midi: 5 },
    0: { hertz: 21.827, midi: 17 },
    1: { hertz: 43.654, midi: 29 },
    2: { hertz: 87.307, midi: 41 },
    3: { hertz: 174.61, midi: 53 },
    4: { hertz: 349.23, midi: 65 },
    5: { hertz: 698.46, midi: 77 },
    6: { hertz: 1396.9, midi: 89 },
    7: { hertz: 2793.8, midi: 101 },
    8: { hertz: 5587.7, midi: 113 },
    9: { hertz: 11175, midi: 125 },
    10: { hertz: 22351, midi: null }
  },
  'F#': {
    '-1': { hertz: 11.563, midi: 6 },
    0: { hertz: 23.125, midi: 18 },
    1: { hertz: 46.249, midi: 30 },
    2: { hertz: 92.499, midi: 42 },
    3: { hertz: 185.0, midi: 54 },
    4: { hertz: 369.99, midi: 66 },
    5: { hertz: 739.99, midi: 78 },
    6: { hertz: 1480.0, midi: 90 },
    7: { hertz: 2960.0, midi: 102 },
    8: { hertz: 5919.9, midi: 114 },
    9: { hertz: 11840, midi: 126 },
    10: { hertz: 23680, midi: null }
  },
  G: {
    '-1': { hertz: 12.25, midi: 7 },
    0: { hertz: 24.5, midi: 19 },
    1: { hertz: 48.999, midi: 31 },
    2: { hertz: 97.999, midi: 43 },
    3: { hertz: 196.0, midi: 55 },
    4: { hertz: 392.0, midi: 67 },
    5: { hertz: 783.99, midi: 79 },
    6: { hertz: 1568.0, midi: 91 },
    7: { hertz: 3136.0, midi: 103 },
    8: { hertz: 6271.9, midi: 115 },
    9: { hertz: 12544, midi: 127 },
    10: { hertz: 25088, midi: null }
  },
  'G#': {
    '-1': { hertz: 12.979, midi: 8 },
    0: { hertz: 25.957, midi: 20 },
    1: { hertz: 51.913, midi: 32 },
    2: { hertz: 103.83, midi: 44 },
    3: { hertz: 207.65, midi: 56 },
    4: { hertz: 415.3, midi: 68 },
    5: { hertz: 830.61, midi: 80 },
    6: { hertz: 1661.2, midi: 92 },
    7: { hertz: 3322.4, midi: 104 },
    8: { hertz: 6644.9, midi: 116 },
    9: { hertz: 13290, midi: null },
    10: { hertz: 26580, midi: null }
  },
  A: {
    '-1': { hertz: 13.75, midi: 9 },
    0: { hertz: 27.5, midi: 21 },
    1: { hertz: 55.0, midi: 33 },
    2: { hertz: 110.0, midi: 45 },
    3: { hertz: 220.0, midi: 57 },
    4: { hertz: 440.0, midi: 69 },
    5: { hertz: 880.0, midi: 81 },
    6: { hertz: 1760.0, midi: 93 },
    7: { hertz: 3520.0, midi: 105 },
    8: { hertz: 7040.0, midi: 117 },
    9: { hertz: 14080, midi: null },
    10: { hertz: 28160, midi: null }
  },
  'A#': {
    '-1': { hertz: 14.568, midi: 10 },
    0: { hertz: 29.135, midi: 22 },
    1: { hertz: 58.27, midi: 34 },
    2: { hertz: 116.54, midi: 46 },
    3: { hertz: 233.08, midi: 58 },
    4: { hertz: 466.16, midi: 70 },
    5: { hertz: 932.33, midi: 82 },
    6: { hertz: 1864.7, midi: 94 },
    7: { hertz: 3729.3, midi: 106 },
    8: { hertz: 7458.6, midi: 118 },
    9: { hertz: 14917, midi: null },
    10: { hertz: 29834, midi: null }
  },
  B: {
    '-1': { hertz: 15.434, midi: 11 },
    0: { hertz: 30.868, midi: 23 },
    1: { hertz: 61.735, midi: 35 },
    2: { hertz: 123.47, midi: 47 },
    3: { hertz: 246.94, midi: 59 },
    4: { hertz: 493.88, midi: 71 },
    5: { hertz: 987.77, midi: 83 },
    6: { hertz: 1975.5, midi: 95 },
    7: { hertz: 3951.1, midi: 107 },
    8: { hertz: 7902.1, midi: 119 },
    9: { hertz: 15804, midi: null },
    10: { hertz: 31609, midi: null }
  }
};
exports.table = table;

const bTable = {
  Ab: table['G#'],
  Bb: table['A#'],
  Eb: table['D#']
};

const spnTable = Object.entries({ ...table, ...bTable }).reduce(
  (acc, [key, value]) => ({
    ...acc,
    ...Object.entries(value).reduce(
      (acc, [octive, value]) => ({
        ...acc,
        [`${key}${octive}`]: { ...value, octive, label: `${key}${octive}` }
      }),
      {}
    )
  }),
  {}
);

const pitchTable = Object.values(spnTable).reduce(
  (acc, { hertz, ...rest }) => ({
    ...acc,
    [hertz]: rest
  }),
  {}
);
exports.pitchTable = pitchTable;

const midiTable = Object.values(spnTable).reduce(
  (acc, { midi, ...rest }) =>
    midi === null
      ? acc
      : {
          ...acc,
          [midi]: rest
        },
  {}
);
exports.midiTable = midiTable;

const fromPitch = pitch => pitchTable[pitch];
exports.fromPitch = fromPitch;
const fromMidi = midi => midiTable[midi];
exports.fromMidi = fromMidi;
const fromSPN = spn => spnTable[spn];
exports.fromSPN = fromSPN;

require.E(exports).default = spnTable;

},function (global, require, module, exports) {
// modules/voicebox/source.js
'use strict';
require.E(exports).default = ctx => ({
  buffer,
  playbackRate = 1,
  cb,
  start = 0,
  stop
} = {}) => {
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.playbackRate.value = playbackRate;
  source.connect(ctx.destination);
  if (cb) source.onended = cb;
  source.start(ctx.currentTime + start);
  if (stop) source.stop(ctx.currentTime + stop);
  return source;
};

}]));