// client-side js, loaded by index.html
// run by the browser each time the page is loaded

var ongoingTouches = [];
var tail = [];
var el;
var elTop;
var elLeft;
var ctx;
var synth;
var speeds = [];
var lastSpeed = 0;
var momentum = 0;

const scale = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const samples = {
  A0: 'A0.mp3',
  A1: 'A1.mp3',
  A2: 'A2.mp3',
  A3: 'A3.mp3',
  A4: 'A4.mp3',
  A5: 'A5.mp3',
  A6: 'A6.mp3',
  A7: 'A7.mp3'
};

const basenotes = [...scale, ...scale, ...scale]
  .slice(0, 400 / 40)
  .map((name, idx) => ({ name, pos: 380 - idx * 40, idx }));

let notes = basenotes;

const bias = 100;
function normalise(note, pitch, momentum) {
  const delta = pitch - noteMap[note] + bias / (momentum + 1);
  // log(momentum % bias);
  if (basenotes[0].pos + delta > 0 && basenotes[0].pos + delta < 40) {
    notes = basenotes.map(note => ({
      ...note,
      pos: note.pos + delta
    }));
  }
}

function select(oidx, y, m, d) {
  const note = notes.find(({ pos }) => Math.abs(pos - y) < 20);
  if (note) {
    const octive = 3 + parseInt(note.idx / scale.length) + parseInt(oidx / 200);
    const p1 = Math.max(0, Math.min(notes.length - 1, note.idx + d));
    // log(`${note.note} ${notes[0].pitch}`);
    //normalise(note.note, parseInt(f), m);
    const spn = {
      note: `${note.name}${octive}`,
      p1: notes[p1]
    };

    return spn;
  }
  return {};
}

const channels = {
  0: [],
  1: [],
  2: []
};
function register(channel, note, touch) {
  const elChannels = document.getElementById('compose-channels');
  const elChannel = document.getElementById(`channel-${channel}`);
  const idx = channels[channel].length;
  elChannel.innerHTML =
    elChannel.innerHTML + `<span id="${channel}-${idx}"> ${note} </span>`;
  const el = document.getElementById(`${channel}-${idx}`);
  elChannels.scrollLeft = Math.max(0, el.offsetLeft - 375);
  elChannel.style.width = `${elChannel.clientWidth + el.clientWidth + 30}px`;

  const time = Tone.now();
  channels[channel].push({
    idx,
    note,
    time,
    touch
  });
  return time;
}

function replaceReplay(e) {
  e.preventDefault();

  const replace = e => {
    e.preventDefault();
    clearTimeout(replaceId);
    document
      .getElementById('compose-channels')
      .removeEventListener('mouseup', replace);
  };
  document
    .getElementById('compose-channels')
    .addEventListener('mouseup', replace);

  const replaceId = setTimeout(() => {
    document
      .getElementById('compose-channels')
      .removeEventListener('mouseup', replace);
  }, 1500);
}

let lastNote;
function play(channel, touch, lastTouch) {
  let speed = lastTouch
    ? parseInt((touch.pageY - lastTouch.pageY) * 100)
    : lastSpeed;
  lastSpeed = speed;
  let avgSpeed = speed;
  let maxSpeed = speed;
  speeds.push(speed);
  if (speeds.length > 8) {
    speeds.shift();
    avgSpeed = parseInt(speeds.slice(2, -2).reduce((acc, s) => acc + s, 0) / 4);
    maxSpeed = speeds.reduce((acc, s) => Math.max(acc, Math.abs(s)), 0);
  }
  // const accel = Math.abs(speed - lastSpeed);
  const direction = Math.max(-1, Math.min(1, speed));
  // if (speed === 0) {
  //   speeds = [];
  // }

  const momentum = parseInt(
    tail.length > 1
      ? tail.length * (tail[0].pageY - tail[tail.length - 1].pageY)
      : 0
  );

  const slip =
    (speed === 0 || (speeds.length == 8 && maxSpeed < 1500)) &&
    Math.abs(momentum) < 4000;

  const { note, pitch, p1 } = select(
    touch.pageX,
    touch.pageY,
    momentum,
    direction
  );

  if (note && note !== lastNote) {
    log(`${note} ${lastNote}`);
    const time = register(channel, note, touch);
    synth.triggerAttackRelease(note);

    lastNote = note;
  }
}

function paint(ctx, m, l) {
  ctx.beginPath();
  const color = `rgb(0,0,0)`;
  if (m.paintType === 'fill') {
    ctx.arc(m.pageX, m.pageY, 4, 0, 2 * Math.PI, false); // a circle at the start
    ctx.fillStyle = color;
    ctx.fill();
  } else {
    ctx.moveTo(m.pageX, m.pageY);
    ctx.lineTo(l.pageX, l.pageY);
    ctx.lineWidth = 4;
    ctx.strokeStyle = color;
    ctx.stroke();
  }
}

function handleStart(evt) {
  evt.preventDefault();
  el.addEventListener('mousemove', handleMove, false);
  speeds = [];
  var touch = copyTouch(
    (evt.changedTouches || [
      { pageX: evt.pageX, pageY: evt.pageY, identifier: 0 }
    ])[0],
    'fill'
  );
  ongoingTouches.push(touch);
  paint(ctx, touch, touch);
  play(touch.channel, touch);
}

function handleMove(evt) {
  evt.preventDefault();
  var touch = copyTouch(
    (evt.changedTouches || [
      { pageX: evt.pageX, pageY: evt.pageY, identifier: 0 }
    ])[0]
  );

  var lastTouch = ongoingTouches[0];
  paint(ctx, lastTouch, touch);
  ongoingTouches.splice(0, 1, touch); // swap in the new touch record
  play(touch.channel, touch, lastTouch);
}

function handleEnd(evt) {
  evt.preventDefault();
  el.removeEventListener('mousemove', handleMove);
  ongoingTouches.splice(0, 1); // remove it; we're done
  lastNote = '';
  // synth.triggerRelease(lastNote);
  // synth.triggerAttackRelease(lastNote, 3);
}
function handleCancel(evt) {
  evt.preventDefault();
  ongoingTouches.splice(0, 1); // remove it; we're done
  synth.triggerRelease(Tone.Time(3));
}

function copyTouch(
  { identifier, pageX, pageY, radiusX, radiusY, rotationAngle, force },
  paintType
) {
  return {
    channel: identifier,
    pageX: pageX - elLeft,
    pageY: pageY - elTop,
    radiusX,
    radiusY,
    rotationAngle,
    force,
    paintType,
    idx: ongoingTouches.length
  };
}

function ongoingTouchIndexById(idToFind) {
  for (var i = 0; i < ongoingTouches.length; i++) {
    var id = ongoingTouches[i].identifier;

    if (id == idToFind) {
      return i;
    }
  }
  return -1; // not found
}
function log(msg) {
  console.log(...[].concat(msg));
}

function drawBars() {
  const el = document.getElementById('bars');
  const ctx = el.getContext('2d');
  for (let i = 0, j = 20; i <= basenotes.length; i++, j += 40) {
    ctx.beginPath();
    ctx.moveTo(0, j);
    ctx.lineTo(el.clientWidth, j);
    ctx.lineWidth = 40;
    ctx.strokeStyle = `rgba(10,20,30,${i / 20})`;
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.moveTo(el.clientWidth * 0.75, 0);
  ctx.lineTo(el.clientWidth * 0.75, el.clientHeight);
  ctx.lineWidth = el.clientWidth * 0.5;
  ctx.strokeStyle = `rgba(0,20,00,0.2)`;
  ctx.stroke();
  document
    .getElementById('compose-channels')
    .addEventListener('mousedown', replaceReplay);
}

function startup() {
  document.getElementById('calibrate').addEventListener('click', calibrate);
  document.getElementById('go-compose').addEventListener('click', goCompose);
}

let ticks = [];
let tempo = 120;
let lastTick = 0;
let calibrateId;
function calibrate(e) {
  e.preventDefault();
  clearTimeout(calibrateId);
  calibrateId = setTimeout(() => {
    ticks = [];
    lastTick = 0;
  }, 1500);
  const tick = Date.now();
  if (lastTick) {
    ticks.push(tick - lastTick);
    tempo =
      Math.floor(
        (12000 * ticks.length) / ticks.reduce((acc, t) => acc + t, 0)
      ) * 5;
    document.getElementById('tempo').value = tempo;
    log(tempo);
  }
  lastTick = tick;
}

function goCompose(e) {
  e.preventDefault();
  if (!synth) {
    // synth = new Tone.AMSynth().toMaster();
    synth = new Tone.Sampler(samples).toMaster();
    startContext(Tone.context);
    try {
      Object.keys(samples).forEach(s => synth.triggerAttackRelease(s));
    } catch (e) {}
  }

  const {
    tempo: { value: tempo },
    time: { value: time }
  } = document.getElementById('params').elements;
  log(tempo, time);

  document.getElementById('intro').classList.add('hide');
  document.getElementById('compose').classList.remove('hide');
  el = document.getElementById('touch');
  elTop = el.offsetTop;
  elLeft = el.offsetLeft;
  ctx = el.getContext('2d');
  el.addEventListener('touchstart', handleStart, false);
  el.addEventListener('touchend', handleEnd, false);
  el.addEventListener('touchcancel', handleCancel, false);
  el.addEventListener('touchmove', handleMove, false);

  el.addEventListener('mousedown', handleStart, false);
  el.addEventListener('mouseup', handleEnd, false);
  drawBars();

  setInterval(fade, 30);

  function fade() {
    const imageData = ctx.getImageData(0, 0, el.width, el.height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      data[i + 3] = Math.max(0, data[i + 3] - 10);
    }
    ctx.putImageData(imageData, 0, 0);
  }
}

function startContext(context) {
  // this accomplishes the iOS specific requirement
  var buffer = context.createBuffer(1, 1, context.sampleRate);
  var source = context.createBufferSource();
  source.buffer = buffer;
  try {
    source.connect(context.destination);
  } catch (e) {}
  source.start(0);

  // resume the audio context
  if (context.resume) {
    context.resume();
  }
}

document.addEventListener('DOMContentLoaded', startup);
