// client-side js, loaded by index.html
// run by the browser each time the page is loaded

var ongoingTouches = [];
var tail = [];
var el;
var elTop;
var elLeft;
var ctx;
var synth;
var playing = { time: 0, pitch: -100 };
var speeds = [];
var lastSpeed = 0;
var momentum = 0;

const scale = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

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

function play(px, py, channel, lastPy) {
  let speed = lastPy ? parseInt((py - lastPy) * 100) : lastSpeed;
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
      ? tail.length * (tail[0].m.pageY - tail[tail.length - 1].l.pageY)
      : 0
  );

  const slip =
    (speed === 0 || (speeds.length == 8 && maxSpeed < 1500)) &&
    Math.abs(momentum) < 4000;

  const { note, pitch, p1 } = select(px, py, momentum, direction);

  // log(
  //   `${slip} ${Math.abs(
  //     tail.length > 1
  //       ? tail.length * (tail[0].m.pageY - tail[tail.length - 1].l.pageY)
  //       : 0
  //   )}`
  // );

  if (note && note !== playing.note) {
    log(`${note} ${playing.note}`);
    //log(`${speed}, ${avgSpeed}, ${note}, ${playing.note}`);
    // log(`${note}, ${pitch} ${p1.note} ${p1.pitch}`);
    //    log(`${note},${avgSpeed} ${direction !== playing.direction}`);
    synth.triggerAttackRelease(note);
    playing = { note };
  }
}

function paint(ctx, m, l, c, t) {
  ctx.beginPath();
  const color = `rgba(${Object.values(c).join(',')})`;
  if (t === 'fill') {
    ctx.arc(m.pageX - elLeft, m.pageY - elTop, 4, 0, 2 * Math.PI, false); // a circle at the start
    ctx.fillStyle = color;
    ctx.fill();
  } else {
    ctx.moveTo(m.pageX - elLeft, m.pageY - elTop);
    ctx.lineTo(l.pageX - elLeft, l.pageY - elTop);
    ctx.lineWidth = 4;
    ctx.strokeStyle = color;
    ctx.stroke();
  }
}

function handleStart(evt) {
  if (!synth) {
    // synth = new Tone.AMSynth().toMaster();
    synth = new Tone.Sampler({
      A0: 'A0.mp3',
      A1: 'A1.mp3',
      A2: 'A2.mp3',
      A3: 'A3.mp3',
      A4: 'A4.mp3',
      A5: 'A5.mp3',
      A6: 'A6.mp3',
      A7: 'A7.mp3'
    }).toMaster();
  }
  evt.preventDefault();
  var touches = evt.changedTouches || [
    { pageX: evt.pageX, pageY: evt.pageY, identifier: 0 }
  ];
  el.addEventListener('mousemove', handleMove, false);
  playing = { time: 0, pitch: 0 };
  speeds = [];
  for (var i = 0; i < touches.length; i++) {
    var touch = copyTouch(touches[i]);
    ongoingTouches.push(touch);
    var color = colorForTouch(touch);
    paint(ctx, touch, touch, color, 'fill');
    play(touch.pageX - elLeft, touch.pageY - elTop, touch.identifier);
    tail.push({ idx: i, m: touch, color, t: 'fill' });
  }
}

function handleMove(evt) {
  evt.preventDefault();
  var touches = evt.changedTouches || [
    { pageX: evt.pageX, pageY: evt.pageY, identifier: 0 }
  ];

  for (var i = 0; i < touches.length; i++) {
    var touch = copyTouch(touches[i]);
    var color = colorForTouch(touch);
    var idx = ongoingTouchIndexById(touch.identifier);
    if (idx >= 0) {
      var lastTouch = ongoingTouches[idx];
      paint(ctx, lastTouch, touch, color);
      tail.push({ idx, m: lastTouch, l: touch, color });
      ongoingTouches.splice(idx, 1, touch); // swap in the new touch record
      play(
        touch.pageX - elLeft,
        touch.pageY - elTop,
        touch.identifier,
        lastTouch.pageY - elTop
      );
    }
  }
}

function handleEnd(evt) {
  evt.preventDefault();
  el.removeEventListener('mousemove', handleMove);
  var touches = evt.changedTouches || [
    { pageX: evt.pageX, pageY: evt.pageY, identifier: 0 }
  ];

  for (var i = 0; i < touches.length; i++) {
    var idx = ongoingTouchIndexById(touches[i].identifier);

    if (idx >= 0) {
      ongoingTouches.splice(idx, 1); // remove it; we're done
    }
    // synth.triggerRelease(playing.note);
    // synth.triggerAttackRelease(playing.note, 3);
  }
}
function handleCancel(evt) {
  evt.preventDefault();
  var touches = evt.changedTouches;

  for (var i = 0; i < touches.length; i++) {
    var idx = ongoingTouchIndexById(touches[i].identifier);
    ongoingTouches.splice(idx, 1); // remove it; we're done
  }
  synth.triggerRelease(Tone.Time(3));
}

function copyTouch({
  identifier,
  pageX,
  pageY,
  radiusX,
  radiusY,
  rotationAngle,
  force
}) {
  return {
    identifier,
    pageX,
    pageY,
    radiusX,
    radiusY,
    rotationAngle,
    force,
    time: Date.now()
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
  var p = document.getElementById('log');
  p.innerHTML = msg + '\n' + p.innerHTML.slice(0, 500);
}

function colorForTouch(touch) {
  return { 0: 0, 1: 0, 2: 0, ...{ [touch.identifier]: 255 }, 4: 1 };
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
}

function startup() {
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

  const atEnd = ({ color }) => color[4] > 0;
  setInterval(() => {
    const stillPlaying = tail.length > 0;
    tail = tail.filter(atEnd).map(({ idx, color, ...rest }) => ({
      idx,
      color: { ...color, 4: (color[4] - 0.1).toFixed(2) },
      ...rest
    }));
    fade();
    // tail.forEach(({ color, m, l, t }) => paint(ctx, m, l, color, t));
    // if (stillPlaying && tail.length === 0) {
    //     synth.triggerRelease()
    //     playing = false
    // }
  }, 30);

  function fade() {
    const imageData = ctx.getImageData(0, 0, el.width, el.height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      data[i + 3] = Math.max(0, data[i + 3] - 10);
    }
    ctx.putImageData(imageData, 0, 0);
  }
}

document.addEventListener('DOMContentLoaded', startup);
