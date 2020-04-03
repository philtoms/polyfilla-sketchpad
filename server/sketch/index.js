import fs from 'fs';

const template = fs.readFileSync(`${__dirname}/sketch.html`, 'utf-8');

const emptyChannels = {
  0: [],
  1: [],
  2: []
};

const emptySketch = () => ({
  score: {
    signature: '4/4',
    tempo: 120
  },
  events: []
});

const main = data => (req, res) => {
  const { title } = req.params;
  if (!title) {
    res.setHeader('location', `/sketch-${data.count + 1}`);
    return res.sendStatus(302);
  }
  res.send(template.replace('${title}', title));
};

const score = data => (req, res) => {
  const { title } = req.params;
  data.entry[title].score = req.body;
  res.json({ title });
};

const clear = data => (req, res) => {
  const { title } = req.params;
  data.clear(title);
  res.json({});
};

const batch = data => (req, res) => {
  const { title } = req.params;
  const batch = req.body;
  batch.forEach(event => insertEvent(data.entry(title), event.idx, event));
  res.json({ title });
};
const insert = data => (req, res) => {
  const { title, idx } = req.params;
  const event = req.body;
  insertEvent(data.entry(title), idx, event);
  res.json({ title, idx });
};

const insertEvent = (sketch, idx, event) => {
  const events = sketch.events;
  events.length = idx;
  events[idx] = {
    ...emptyChannels,
    ...events[idx],
    time: (events[idx] || event).time,
    [event.channel]: event
  };
};

const download = data => (req, res) => {
  const { title } = req.params;
  const sketch = data.entry(title) || emptySketch();
  res.json(sketch);
};

const upload = data => (req, res) => {
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
  upload
};
