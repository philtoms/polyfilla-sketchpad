import fs from 'fs';

const template = fs.readFileSync(`${__dirname}/sketch.html`, 'utf-8');

const emptyVoices = {
  0: [],
  1: [],
  2: [],
};

const emptySketch = (data, title) =>
  data.insert(title, {
    score: {
      signature: '4/4',
      tempo: 120,
      voices: ['lead'],
    },
    bars: [],
  });

const main = (data) => (req, res) => {
  const { title } = req.params;
  if (!title) {
    res.setHeader('location', `/sketch-${data.count + 1}`);
    return res.sendStatus(302);
  }
  res.send(template.replace('${title}', title));
};

const score = (data) => (req, res) => {
  const { title } = req.params;
  data.entry[title].score = req.body;
  res.json({ title });
};

const clear = (data) => (req, res) => {
  const { title } = req.params;
  data.clear(title);
  res.json({});
};

const batch = (data) => (req, res) => {
  const { title } = req.params;
  const batch = req.body;
  batch.forEach((bar) => insertEvent(data.entry(title), bar.bid, bar));
  res.json({ title });
};

const insert = (data) => (req, res) => {
  const { title, idx } = req.params;
  const event = req.body;
  insertEvent(data.entry(title), idx, event);
  res.json({ title, idx });
};

const insertEvent = (sketch, bid, bar) => {
  const bars = sketch.bars;
  bars.length = bid;
  bars[bid] = {
    ...emptyVoices,
    ...bars[bid],
    time: (bars[bid] || bar).time,
    [bar.vid]: bar,
  };
  console.log(bars);
};

const download = (data) => (req, res) => {
  const { title } = req.params;
  const sketch = data.entry(title) || emptySketch(data, title);
  res.json(sketch);
};

const upload = (data) => (req, res) => {
  const { title } = req.params;
  const sketch = req.body;
  data.insert(title, sketch);
  res.json({ title });
};

export default {
  main,
  score,
  clear,
  batch,
  insert,
  download,
  upload,
};
