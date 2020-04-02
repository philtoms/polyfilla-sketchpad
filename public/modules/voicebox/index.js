import Voice from './voice.js';
import Source from './source.js';

export default options => {
  const subscriptions = [];
  const ctx = new (window.AudioContext || window.webkitAudioContext)(options);
  const source = Source(ctx);

  let _tempo = 60 / 120;
  let _beats = 4;
  let _noteValue = 1 / 4;
  let _ticks = 0;
  let _scheduled = [];

  const init = options => {
    voicebox.tempo = options.tempo;
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
      const startTime = events[0].time;
      const lead = _tempo * 2;
      _scheduled = events.map(({ vid, spn, time, cb }, idx) => {
        const next = idx ? ((time - startTime) * _tempo) / _tempo : 0;
        return [
          voicebox.play(vid, spn, next + lead),
          source({ cb, stop: next + lead })
        ];
      });
      voicebox.time = startTime - lead;
      return events[0];
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
