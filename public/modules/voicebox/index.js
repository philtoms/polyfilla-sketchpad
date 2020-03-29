import { fromSPN } from './notes.js';

// for cross browser
const AudioContext = window.AudioContext || window.webkitAudioContext;

const Source = (ctx, { buffer, playbackRate = 1 }) => {
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.playbackRate.value = playbackRate;
  source.connect(ctx.destination);
  return source;
};

const Clock = (ctx, interval, cb) => {
  const source = Source(ctx, ctx.createBuffer(1, 1, ctx.sampleRate));
  source.onended = cb;
  source.start(0);
  source.stop(ctx.currentTime + interval);
};

const Voice = (ctx, sampleData) => {
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

export default options => {
  const subscriptions = [];
  const ctx = new AudioContext(options);

  let _tempo = 80 / 60;
  let _beats = 4;
  let _noteValue = 1 / 4;
  let _ticks = 0;
  let _scheduled = [];

  const init = options => {
    voicebox.tempo = options.tempo;
    voicebox.signature = options.signature;
    try {
      const source = Source(ctx.createBuffer(1, 1, ctx.sampleRate));
      source.start(0);
      source.connect(ctx.destination);
    } catch (e) {}
    if (ctx.resume) {
      ctx.resume();
    }
    voicebox.time = 0;
    const clock = () => {
      Clock(ctx, _tempo, clock);
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
    play: (vid, spn, time = 0) => {
      const source = Source(ctx, voices[vid](spn));
      source.start(ctx.currentTime + time);
      return source;
    },
    get time() {
      return ctx.currentTime - baseTime;
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
      return `${_beats}/${_noteValue}`;
    },
    set signature(value) {
      _beats = parseInt(value.split('/')[0]);
      _noteValue = 1 / value.split('/')[1];
    },
    subscribe: cb => {
      subscriptions.push(cb);
      return subscriptions.length - 1;
    },
    unsubscribe: sid => subscriptions.splice(sid, 1),
    schedule: events => {
      voicebox.cancel();
      const startTime = events[0].time;
      const lead = 0.75 * (_beats + 1);
      _scheduled = events.map(({ vid, spn, time }, idx) => {
        const next = idx ? ((time - startTime) * _tempo) / 0.75 : 0;
        return voicebox.play(vid, spn, next + lead);
      });
      voicebox.time = startTime - lead;
    },
    cancel: () => _scheduled.forEach(source => source.disconnect())
  };
  return voicebox;
};
