import Voice from './voice.js';
import Source from './source.js';

let _subscriptions = [];
export const subscribe = (cb) => {
  _subscriptions.push(cb);
};
export const unsubscribe = (cb) => {
  _subscriptions = _subscriptions.filter((s) => s !== cb);
};

export default (options) => {
  let _tempo = 60 / 120;
  let _scoreTempo = _tempo;
  let _beats = 4;
  let _noteValue = 1 / 4;
  let _ticks = 0;
  let _scheduled = [];
  let ctx;
  let source;
  let baseTime;

  const init = () => {
    ctx = new (window.AudioContext || window.webkitAudioContext)(options);
    source = Source(ctx);
    baseTime = ctx.currentTime;
    if (options.samples) {
      voicebox.create(options.samples);
    }
    voicebox.tempo = options.tempo;
    _scoreTempo = _tempo;
    voicebox.timeSignature = options.timeSignature;
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
      _subscriptions.forEach((cb) => cb(tick));
    };
    source({ cb: clock, stop: _tempo });
    return voicebox;
  };

  const voices = {};
  const voicebox = {
    create: (data) =>
      Object.entries(data).forEach(
        ([vid, sample]) => (voices[vid] = Voice(ctx, sample))
      ),
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
    get timeSignature() {
      return [_beats, _noteValue];
    },
    set timeSignature(value) {
      _beats = parseInt(value.split('/')[0]);
      _noteValue = 1 / parseInt(value.split('/')[1]);
    },
    nextTime: (lastTime) => {
      // const time = voicebox.time;
      // if (time > lastTime + _tempo * _beats) voicebox.time = lastTime + _tempo;
      return voicebox.time;
    },
    count: (cb, count = 1) => {
      voicebox.subscribe((tick) => {
        if (!tick) {
          if (--count === 0) {
            voicebox.unsubscribe(cb);
            cb(args);
          }
        }
      });
    },
    play: (vid, spn, time = 0, cb) =>
      source({
        ...voices[vid](spn),
        start: time,
        cb,
      }),
    schedule: (events) => {
      const startTime = events.length ? events[0].time : 0;
      const lead = _scoreTempo * 2;
      _scheduled = events.map((event, idx) => {
        const { vid, spn, time, cb } = event;
        const next = ((time - startTime) * _tempo) / _scoreTempo;
        return [
          voicebox.play(vid, spn, next + lead),
          source({
            cb: () =>
              cb({
                ...event,
                first: idx === 0,
                last: idx === events.length - 1,
              }),
            stop: next + lead,
          }),
        ];
      });
      voicebox.time = startTime - lead;
    },
    cancel: () => {
      _scheduled.forEach(([s, d]) => {
        s.disconnect();
        d.onended = undefined;
      });
    },
  };
  return init();
};
