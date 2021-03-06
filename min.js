!(function (cache, modules) {
  function require(i) {
    return (
      cache[i] ||
      (function (i) {
        var exports = {},
          module = { exports: exports };
        return (
          modules[i].call(exports, window, require, module, exports),
          (cache[i] = module.exports)
        );
      })(i)
    );
  }
  (require.E = function (exports) {
    return Object.defineProperty(exports, '__esModule', { value: !0 });
  }),
    (require.I = function (m) {
      return m.__esModule ? m.default : m;
    }),
    require.I(require(0));
})(
  [],
  [
    function (global, require, module, exports) {
      require.I(require(1));
      const intro = require.I(require(2)),
        compose = require.I(require(6)),
        list = require.I(require(15)),
        voicebox = require.I(require(16)),
        { createContext: createContext } = hookedElements,
        assets =
          'https://cdn.glitch.com/ee40e085-f63b-4369-9a4a-dc97bb39e335%2F',
        samples = {
          A0: `${assets}A0.mp3`,
          A1: `${assets}A1.mp3`,
          A2: `${assets}A2.mp3`,
          A3: `${assets}A3.mp3`,
          A4: `${assets}A4.mp3`,
          A5: `${assets}A5.mp3`,
          A6: `${assets}A6.mp3`,
          A7: `${assets}A7.mp3`,
        };
      document.addEventListener('DOMContentLoaded', () => {
        const context = createContext({
          state: 'intro',
          voicebox: voicebox().create(0, samples),
        });
        intro(context), compose(context), list(context);
      });
    },
    function (global, require, module, exports) {
      (window.log = (msg) => {
        console.log(...[].concat(msg));
      }),
        (require.E(exports).default = log);
    },
    function (global, require, module, exports) {
      const quantize = require.I(require(3)),
        merge = require.I(require(4)),
        client = require.I(require(5)),
        {
          define: define,
          render: render,
          useContext: useContext,
        } = hookedElements;
      require.E(exports).default = (context) => {
        const { get: get, post: post } = client(context),
          provide = (state) => (
            context.provide(merge(context.value, state)), context.value
          );
        define('#tempo', {
          oninput({ target: { value: value } }) {
            const { score: score, state: state } = provide({
              score: { tempo: value },
            });
            'intro' === state && post(score, 'score');
          },
          render() {
            const { voicebox: voicebox, score: score } = useContext(context);
            score &&
              score.tempo &&
              ((voicebox.tempo = score.tempo),
              (this.element.value = score.tempo),
              (this.element.nextElementSibling.innerText = score.tempo));
          },
        }),
          define('#timeSignature', {
            oninput({ target: { value: value } }) {
              const { score: score, state: state } = provide({
                score: { timeSignature: value },
              });
              'intro' === state && post(score, 'score');
            },
            render() {
              const { voicebox: voicebox, score: score } = useContext(context);
              score &&
                score.timeSignature &&
                ((voicebox.timeSignature = score.timeSignature),
                (this.element.value = score.timeSignature));
            },
          }),
          define('#title', {
            init() {
              const title = this.element.value;
              provide({ title: title }), render(this);
            },
            onchange({ target: { value: value } }) {
              provide({ title: value });
            },
            render() {
              const { title: title } = useContext(context);
              this.title
                ? this.title !== title &&
                  (window.location.href = window.location.href.replace(
                    this.title,
                    title
                  ))
                : (this.title = title);
            },
          }),
          define('#intro', {
            init() {
              render(this),
                get().then((data) => {
                  const {
                    score: score = context.value.score,
                    events: events = [],
                  } = data;
                  provide({ score: score, data: events.filter(Boolean) });
                });
            },
            onclick(e) {
              if ('submit' === e.target.type) {
                e.preventDefault();
                const {
                  score: score,
                  voicebox: voicebox,
                  data: data,
                } = context.value;
                voicebox.init(score),
                  provide({
                    state: 'compose',
                    quantize: quantize(voicebox.timeSignature, data),
                  }),
                  (e.target.className = 'compose');
              }
            },
            render() {
              const { state: state } = useContext(context);
              this.element.className = state;
            },
          });
      };
    },
    function (global, require, module, exports) {
      const BIGTIME = Number.MAX_VALUE;
      require.E(exports).default = (timeSignature, data) => {
        const [beats, noteValue] = timeSignature,
          bar = beats * noteValue,
          q32 = bar / 32,
          q16 = q32 + q32,
          q8 = q16 + q16,
          q4 = q8 + q8,
          q2 = q4 + q4,
          q1 = bar,
          qvMap = Object.entries({
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
            16: q16,
          }).reduce(
            (acc, [k, v]) => ({ ...acc, [v]: [k, Number.parseFloat(v)] }),
            {}
          ),
          qvalues = Object.values(qvMap).map(([k, v]) => v);
        qvalues.sort((a, b) => b - a);
        const quantize = (t) =>
            qvMap[qvalues.find((qt) => t >= qt) || qvMap.q1d],
          nudge = (time, idx) => (
            (data[idx] = { time: time, 0: { ...data[idx][0], time: time } }),
            time
          ),
          snap = (time, idx) => {
            const twip = time % q16;
            if (twip)
              for (let i = idx; i < data.length; i++)
                nudge(data[i].time - twip, i);
            return data[idx].time;
          },
          maybeTriple = (time1, time2, time3, qspace) => {
            const i1 = time2 - time1,
              i2 = time3 - time2;
            if (time3 && time3 - time1 <= qspace && Math.abs(i1 - i2) < q16) {
              const qt = quantize(Math.max((i1 + i2) / 2, q16));
              return qt[0].endsWith('t') && qt;
            }
            return 0;
          };
        return (start = 0, end) => {
          let qbar = 0;
          for (
            let idx = Math.max(0, Math.min(start, start - 3));
            idx < (end || data.length);
            idx++
          ) {
            const event = data[idx],
              idx1 = idx + 1,
              idx2 = idx + 2,
              idx3 = idx + 3,
              time1 = snap(event.time, idx),
              time2 = idx1 < data.length ? data[idx1].time : 0,
              time3 = idx2 < data.length ? data[idx2].time : 0,
              time4 = idx3 < data.length ? data[idx3].time : BIGTIME;
            qbar = Math.floor(time1 / bar) * bar;
            const qnext = time2 - (time2 % q16) || qbar + bar,
              duration = quantize(qnext - time1);
            if ((console.log(qbar, time1, duration, qnext), qnext === time1))
              nudge(qnext + q32, idx1);
            else {
              const qspace = Math.min(
                  Math.max(0, qbar + bar - time1),
                  time4 - (time4 % q16) - time1
                ),
                qt = maybeTriple(time1, time2, time3, qspace);
              qt &&
                (console.log(nudge(time1 + qt[1], idx1), qt),
                console.log(nudge(time1 + 2 * qt[1], idx2), qt),
                (idx = idx2));
            }
          }
          return data;
        };
      };
    },
    function (global, require, module, exports) {
      const merge = (value, state = {}) =>
        Object.entries(state).reduce(
          (acc, [k, v]) => ({
            ...acc,
            [k]: Array.isArray(v)
              ? v
              : 'object' == typeof v
              ? { ...acc[k], ...merge(acc[k], v) }
              : v,
          }),
          value
        );
      require.E(exports).default = merge;
    },
    function (global, require, module, exports) {
      require.E(exports).default = (context) => {
        const post = (data, path = '') =>
            fetch(`${context.value.title}/data/${path}`, {
              headers: { 'Content-type': 'application/json' },
              method: 'POST',
              body: JSON.stringify(data),
            }),
          batched = [];
        setInterval(() => {
          if (batched.length) {
            const batch = batched.splice(0, Math.min(batched.length, 100));
            post(batch, 'batch');
          }
        }, 3e3);
        return {
          post: post,
          batch: (data) => {
            batched.push(data);
          },
          get: () =>
            fetch(`${context.value.title}/data`, {
              headers: { 'Content-type': 'application/json' },
              method: 'GET',
            }).then((res) => res.json()),
        };
      };
    },
    function (global, require, module, exports) {
      const channels = require.I(require(7)),
        touch = require.I(require(10)),
        backdrop = require.I(require(12)),
        metronome = require.I(require(13)),
        controls = require.I(require(14)),
        {
          define: define,
          render: render,
          useContext: useContext,
        } = hookedElements;
      require.E(exports).default = (context) => {
        define('#compose', {
          init() {
            render(this),
              touch(context),
              backdrop(context),
              channels(context),
              metronome(context),
              controls(context);
          },
          render() {
            const { state: state } = useContext(context);
            this.element.className = state;
          },
        });
      };
    },
    function (global, require, module, exports) {
      const player = require.I(require(8)),
        {
          define: define,
          render: render,
          useContext: useContext,
        } = hookedElements;
      require.E(exports).default = (context) => {
        const { playback: playback } = player(context);
        define('#channels', {
          init() {
            (this.channels = Array.from(this.element.children).reduce(
              (acc, el, channel) => ({ ...acc, [channel]: el }),
              {}
            )),
              render(this);
          },
          onclick(e) {
            e.preventDefault();
            const startpoint = e.target.id.split('-').pop();
            playback(parseInt(startpoint), 0);
          },
          render() {
            const { note: note, voicebox: voicebox, data: data } = useContext(
              context
            );
            if (((this.voicebox = voicebox), note && note !== this.note)) {
              this.note = note;
              const { channel: channel, name: name, idx: idx } = note,
                noteId = `${channel}-${idx}`,
                event = `<span id="${noteId}" class="event"> ${name} </span>`;
              let node = document.getElementById(noteId);
              for (; node; ) {
                const next = node.nextSibling;
                node.parentNode.removeChild(node), (node = next);
              }
              this.channels[channel].innerHTML += event;
              const elNote = document.getElementById(noteId);
              this.element.scrollLeft = Math.max(0, elNote.offsetLeft - 375);
            }
            if (data != this.data) {
              this.data = data;
              const channel = 0;
              this.channels[channel].innerHTML = data
                .filter(Boolean)
                .reduce((acc, data) => {
                  const { name: name, idx: idx } = data[channel];
                  return `${acc}<span id="${`${channel}-${idx}`}" class="event"> ${name} </span>`;
                }, '');
            }
          },
        });
      };
    },
    function (global, require, module, exports) {
      const { select: select } = require(9),
        client = require.I(require(5)),
        emptyChannels = { 0: [], 1: [], 2: [] };
      let previousEvent = {},
        lastTime = 0,
        nextBeat = 0;
      require.E(exports).default = (context) => {
        const { batch: batch } = client(context),
          register = (channel, name, touch) => {
            const {
              voicebox: voicebox,
              data: data,
              quantize: quantize,
            } = context.value;
            lastTime ||
              (lastTime = data.length ? data[data.length - 1].time : 0);
            let time = voicebox.nextTime(lastTime);
            if (time < lastTime) {
              (time = data[nextBeat].time), voicebox.cancel(time);
              const events = data.filter(({ time: etime }) => etime < time);
              data.splice(0, data.length, ...events);
            }
            const idx = data.length,
              event = {
                idx: idx,
                channel: channel,
                name: name,
                time: time,
                touch: touch,
              };
            return (
              data.push({ ...emptyChannels, time: time, [channel]: event }),
              quantize(idx),
              batch(data[idx][channel]),
              (lastTime = time),
              event
            );
          };
        return {
          play: (channel, touch) => {
            const { voicebox: voicebox } = context.value,
              note = select(touch.pageX, touch.pageY);
            if (note && note !== previousEvent.name)
              return (
                (previousEvent = register(channel, note, touch)),
                voicebox.play(0, note),
                previousEvent
              );
          },
          stop: (touch) => {
            (previousEvent.touch = touch), (previousEvent = {});
          },
          playback: (startpoint, channel = 0) => {
            const {
                voicebox: voicebox,
                data: data,
                draw: draw = () => {},
              } = context.value,
              channels = [].concat(channel);
            (nextBeat = startpoint),
              voicebox.schedule(
                data.slice(startpoint).reduce(
                  (acc, event) =>
                    acc.concat(
                      channels.map((channel) => ({
                        time: event[channel].time,
                        spn: event[channel].name,
                        vid: channel,
                        cb: () => {
                          (nextBeat = event[channel].idx + 1),
                            draw(event[channel].touch);
                        },
                      }))
                    ),
                  []
                )
              );
          },
        };
      };
    },
    function (global, require, module, exports) {
      const scale = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
      exports.scale = scale;
      const basenotes = [...scale, ...scale, ...scale]
        .slice(0, 10)
        .map((name, idx) => ({ name: name, pos: 380 - 40 * idx, idx: idx }));
      exports.basenotes = basenotes;
      let notes = basenotes;
      exports.select = (oidx, y) => {
        const note = notes.find(({ pos: pos }) => Math.abs(pos - y) < 20);
        if (note) {
          const octive =
            3 + Math.floor(note.idx / scale.length) + Math.floor(oidx / 200);
          return `${note.name}${octive}`;
        }
      };
    },
    function (global, require, module, exports) {
      const { copy: copy, draw: draw, fade: fade } = require(11),
        player = require.I(require(8)),
        {
          define: define,
          render: render,
          useContext: useContext,
        } = hookedElements;
      require.E(exports).default = (context) => {
        const { play: play, stop: stop } = player(context);
        define('#touch', {
          init() {
            const el = this.element;
            (context.value.draw = draw(el.getContext('2d'))),
              (this.mousemove = this.ontouchmove.bind(this)),
              setInterval(fade(el.getContext('2d'), el.width, el.height), 30),
              render(this);
          },
          ontouchstart(e) {
            e.preventDefault(),
              this.element.addEventListener('mousemove', this.mousemove, !1);
            const touch = this.copy((e.changedTouches || [e])[0], 'fill'),
              note = play(touch.channel, touch);
            this.draw(touch), context.provide({ ...context.value, note: note });
          },
          ontouchmove(e) {
            e.preventDefault();
            const touch = this.copy((e.changedTouches || [e])[0]),
              note = play(touch.channel, touch);
            this.draw(touch), context.provide({ ...context.value, note: note });
          },
          ontouchend(e) {
            e.preventDefault();
            const touch = this.copy((e.changedTouches || [e])[0]);
            this.element.removeEventListener('mousemove', this.mousemove),
              stop(touch);
          },
          onmousedown(e) {
            this.ontouchstart(e);
          },
          onmouseup(e) {
            this.ontouchend(e);
          },
          render() {
            const el = this.element,
              parent = el.offsetParent || { offsetLeft: 0, offsetTop: 0 };
            (this.copy = copy(
              el.offsetLeft + parent.offsetLeft,
              el.offsetTop + parent.offsetTop
            )),
              (this.draw = useContext(context).draw);
          },
        });
      };
    },
    function (global, require, module, exports) {
      exports.copy = (offsetX, offsetY) => (
        {
          identifier: identifier = 0,
          pageX: pageX,
          pageY: pageY,
          radiusX: radiusX,
          radiusY: radiusY,
          rotationAngle: rotationAngle,
          force: force,
        },
        paintType
      ) => ({
        channel: identifier,
        pageX: pageX - offsetX,
        pageY: pageY - offsetY,
        radiusX: radiusX,
        radiusY: radiusY,
        rotationAngle: rotationAngle,
        force: force,
        paintType: paintType,
      });
      let lastX, lastY;
      exports.fade = (ctx, width, height) => () => {
        const imageData = ctx.getImageData(0, 0, width, height),
          data = imageData.data;
        for (let i = 0; i < data.length; i += 4)
          data[i + 3] = Math.max(0, data[i + 3] - 10);
        ctx.putImageData(imageData, 0, 0);
      };
      exports.draw = (ctx) => ({
        pageX: pageX,
        pageY: pageY,
        paintType: paintType,
      }) => {
        ctx.beginPath();
        'fill' === paintType
          ? (ctx.arc(pageX, pageY, 4, 0, 2 * Math.PI, !1),
            (ctx.fillStyle = 'rgb(0,0,0)'),
            ctx.fill())
          : (ctx.moveTo(lastX, lastY),
            ctx.lineTo(pageX, pageY),
            (ctx.lineWidth = 4),
            (ctx.strokeStyle = 'rgb(0,0,0)'),
            ctx.stroke()),
          (lastX = pageX),
          (lastY = pageY);
      };
    },
    function (global, require, module, exports) {
      const { basenotes: basenotes } = require(9),
        {
          define: define,
          render: render,
          useContext: useContext,
        } = hookedElements;
      require.E(exports).default = (context) => {
        define('#bars', {
          init() {
            (this.ctx = this.element.getContext('2d')),
              (this.width = this.element.width),
              (this.height = this.element.height),
              render(this);
          },
          render() {
            const { ctx: ctx, width: width, height: height } = this;
            for (let i = 0, j = 20; i <= basenotes.length; i++, j += 40)
              ctx.beginPath(),
                ctx.moveTo(0, j),
                ctx.lineTo(width, j),
                (ctx.lineWidth = 40),
                (ctx.strokeStyle = `rgba(10,20,30,${i / 20})`),
                ctx.stroke();
            ctx.beginPath(),
              ctx.moveTo(0.75 * width, 0),
              ctx.lineTo(0.75 * width, height),
              (ctx.lineWidth = 0.5 * width),
              (ctx.strokeStyle = 'rgba(0,20,00,0.2)'),
              ctx.stroke();
          },
        });
      };
    },
    function (global, require, module, exports) {
      const { define: define, useContext: useContext } = hookedElements;
      require.E(exports).default = (context) => {
        define('#metronome', {
          render() {
            const { voicebox: voicebox } = useContext(context);
            this.voicebox ||
              ((this.voicebox = voicebox),
              this.voicebox.subscribe((beat) => {
                this.element.className = `tick-${beat} blink-${beat % 2}`;
              }));
          },
        });
      };
    },
    function (global, require, module, exports) {
      const quantize = require.I(require(3)),
        { define: define, useContext: useContext } = hookedElements;
      require.E(exports).default = (context) => {
        define('#controls', {
          onclick(e) {
            'clear' === e.target.id &&
              context.provide({ ...context.value, data: [] }),
              'quantize' === e.target.id &&
                context.provide({
                  ...context.value,
                  data: quantize(this.voicebox.timeSignature, this.data),
                });
          },
          render() {
            const { voicebox: voicebox, data: data } = useContext(context);
            (this.voicebox = voicebox), (this.data = data);
          },
        });
      };
    },
    function (global, require, module, exports) {
      const player = require.I(require(8)),
        client = require.I(require(5)),
        { define: define, useContext: useContext } = hookedElements;
      require.E(exports).default = (context) => {
        const { playback: playback } = player(context),
          { get: get } = client(context);
        define('#list', {
          onclick(e) {
            'events' === e.target.className &&
              ((context.value.title = e.target.previousSibling.innerText),
              get().then((data) => {
                this.voicebox.init(data.score),
                  (context.value.data = data.events.filter(Boolean)),
                  playback(0, 0);
              }));
          },
          render() {
            const { voicebox: voicebox } = useContext(context);
            this.voicebox = voicebox;
          },
        });
      };
    },
    function (global, require, module, exports) {
      const Voice = require.I(require(17)),
        Source = require.I(require(19));
      require.E(exports).default = (options) => {
        const subscriptions = [],
          ctx = new (window.AudioContext || window.webkitAudioContext)(options),
          source = Source(ctx);
        let _tempo = 0.5,
          _scoreTempo = _tempo,
          _beats = 4,
          _noteValue = 1 / 4,
          _ticks = 0,
          _scheduled = [];
        let baseTime = ctx.currentTime;
        const voices = {},
          voicebox = {
            init: (options) => {
              (voicebox.tempo = options.tempo),
                (_scoreTempo = _tempo),
                (voicebox.timeSignature = options.timeSignature);
              try {
                source();
              } catch (e) {}
              ctx.resume && ctx.resume(), (voicebox.time = 0);
              const clock = () => {
                source({ cb: clock, stop: _tempo });
                const tick = _ticks++ % _beats;
                subscriptions.forEach((cb) => cb(tick));
              };
              return clock(), ctx;
            },
            create: (vid, data) => (voices[vid] = Voice(ctx, data)) && voicebox,
            get time() {
              return Math.max(0, ctx.currentTime - baseTime);
            },
            set time(value) {
              baseTime = ctx.currentTime - value;
            },
            get tempo() {
              return 60 * _tempo;
            },
            set tempo(value) {
              _tempo = 60 / value;
            },
            get timeSignature() {
              return [_beats, _noteValue];
            },
            set timeSignature(value) {
              (_beats = parseInt(value.split('/')[0])),
                (_noteValue = 1 / parseInt(value.split('/')[1]));
            },
            nextTime: (lastTime) => (
              voicebox.time > lastTime + _tempo * _beats &&
                (voicebox.time = lastTime + _tempo),
              voicebox.time
            ),
            subscribe: (cb) => (
              subscriptions.push(cb), subscriptions.length - 1
            ),
            unsubscribe: (sid) => subscriptions.splice(sid, 1),
            play: (vid, spn, time = 0, cb) =>
              source({ ...voices[vid](spn), start: time, cb: cb }),
            schedule: (events) => {
              voicebox.cancel();
              const startTime = events.length && events[0].time,
                lead = 2 * _scoreTempo;
              (_scheduled = events.map(
                ({ vid: vid, spn: spn, time: time, cb: cb }, idx) => {
                  const next = idx
                    ? ((time - startTime) * _tempo) / _scoreTempo
                    : 0;
                  return [
                    voicebox.play(vid, spn, next + lead),
                    source({ cb: cb, stop: next + lead }),
                  ];
                }
              )),
                (voicebox.time = startTime - lead);
            },
            cancel: (time) => {
              _scheduled.forEach(([s, d]) => {
                s.disconnect(), (d.onended = void 0);
              }),
                (voicebox.time = time);
            },
          };
        return voicebox;
      };
    },
    function (global, require, module, exports) {
      const { fromSPN: fromSPN } = require(18);
      require.E(exports).default = (ctx, sampleData) => {
        const naturals = [],
          samples = {};
        return (
          Object.entries(sampleData).map(
            ([spn, url]) =>
              new Promise((resolve) => {
                const request = new XMLHttpRequest();
                request.open('GET', url, !0),
                  (request.responseType = 'arraybuffer'),
                  (request.onload = () => {
                    ctx.decodeAudioData(
                      request.response,
                      (buffer) => {
                        (samples[spn] = {
                          spn: spn,
                          buffer: buffer,
                          playbackRate: 1,
                        }),
                          naturals.push(samples[spn]),
                          resolve();
                      },
                      (err) => console.error(err)
                    );
                  }),
                  request.send();
              })
          ),
          (spn) => {
            let sample = samples[spn];
            return (
              sample ||
                ({ sample: sample } = naturals.reduce(
                  (acc, src) => {
                    const interval = fromSPN(spn).midi - fromSPN(src.spn).midi;
                    return (
                      interval >= 0 &&
                        interval < acc.interval &&
                        (acc = {
                          interval: interval,
                          sample: {
                            ...src,
                            spn: spn,
                            playbackRate: Math.pow(2, interval / 12),
                          },
                        }),
                      acc
                    );
                  },
                  { interval: Number.MAX_SAFE_INTEGER }
                )),
              (samples[spn] = sample)
            );
          }
        );
      };
    },
    function (global, require, module, exports) {
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
          7: { hertz: 2093, midi: 96 },
          8: { hertz: 4186, midi: 108 },
          9: { hertz: 8372, midi: 120 },
          10: { hertz: 16744, midi: null },
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
          10: { hertz: 17740, midi: null },
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
          10: { hertz: 18795, midi: null },
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
          7: { hertz: 2489, midi: 99 },
          8: { hertz: 4978, midi: 111 },
          9: { hertz: 9956.1, midi: 123 },
          10: { hertz: 19912, midi: null },
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
          7: { hertz: 2637, midi: 100 },
          8: { hertz: 5274, midi: 112 },
          9: { hertz: 10548, midi: 124 },
          10: { hertz: 21096, midi: null },
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
          10: { hertz: 22351, midi: null },
        },
        'F#': {
          '-1': { hertz: 11.563, midi: 6 },
          0: { hertz: 23.125, midi: 18 },
          1: { hertz: 46.249, midi: 30 },
          2: { hertz: 92.499, midi: 42 },
          3: { hertz: 185, midi: 54 },
          4: { hertz: 369.99, midi: 66 },
          5: { hertz: 739.99, midi: 78 },
          6: { hertz: 1480, midi: 90 },
          7: { hertz: 2960, midi: 102 },
          8: { hertz: 5919.9, midi: 114 },
          9: { hertz: 11840, midi: 126 },
          10: { hertz: 23680, midi: null },
        },
        G: {
          '-1': { hertz: 12.25, midi: 7 },
          0: { hertz: 24.5, midi: 19 },
          1: { hertz: 48.999, midi: 31 },
          2: { hertz: 97.999, midi: 43 },
          3: { hertz: 196, midi: 55 },
          4: { hertz: 392, midi: 67 },
          5: { hertz: 783.99, midi: 79 },
          6: { hertz: 1568, midi: 91 },
          7: { hertz: 3136, midi: 103 },
          8: { hertz: 6271.9, midi: 115 },
          9: { hertz: 12544, midi: 127 },
          10: { hertz: 25088, midi: null },
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
          10: { hertz: 26580, midi: null },
        },
        A: {
          '-1': { hertz: 13.75, midi: 9 },
          0: { hertz: 27.5, midi: 21 },
          1: { hertz: 55, midi: 33 },
          2: { hertz: 110, midi: 45 },
          3: { hertz: 220, midi: 57 },
          4: { hertz: 440, midi: 69 },
          5: { hertz: 880, midi: 81 },
          6: { hertz: 1760, midi: 93 },
          7: { hertz: 3520, midi: 105 },
          8: { hertz: 7040, midi: 117 },
          9: { hertz: 14080, midi: null },
          10: { hertz: 28160, midi: null },
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
          10: { hertz: 29834, midi: null },
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
          10: { hertz: 31609, midi: null },
        },
      };
      exports.table = table;
      const bTable = { Ab: table['G#'], Bb: table['A#'], Eb: table['D#'] },
        spnTable = Object.entries({ ...table, ...bTable }).reduce(
          (acc, [key, value]) => ({
            ...acc,
            ...Object.entries(value).reduce(
              (acc, [octive, value]) => ({
                ...acc,
                [`${key}${octive}`]: {
                  ...value,
                  octive: octive,
                  label: `${key}${octive}`,
                },
              }),
              {}
            ),
          }),
          {}
        ),
        pitchTable = Object.values(spnTable).reduce(
          (acc, { hertz: hertz, ...rest }) => ({ ...acc, [hertz]: rest }),
          {}
        );
      exports.pitchTable = pitchTable;
      const midiTable = Object.values(spnTable).reduce(
        (acc, { midi: midi, ...rest }) =>
          null === midi ? acc : { ...acc, [midi]: rest },
        {}
      );
      exports.midiTable = midiTable;
      exports.fromPitch = (pitch) => pitchTable[pitch];
      exports.fromMidi = (midi) => midiTable[midi];
      (exports.fromSPN = (spn) => spnTable[spn]),
        (require.E(exports).default = spnTable);
    },
    function (global, require, module, exports) {
      require.E(exports).default = (ctx) => ({
        buffer: buffer,
        playbackRate: playbackRate = 1,
        cb: cb,
        start: start = 0,
        stop: stop,
      } = {}) => {
        const source = ctx.createBufferSource();
        return (
          (source.buffer = buffer),
          (source.playbackRate.value = playbackRate),
          source.connect(ctx.destination),
          cb && (source.onended = cb),
          source.start(ctx.currentTime + start),
          stop && source.stop(ctx.currentTime + stop),
          source
        );
      };
    },
  ]
);
