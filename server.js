// server.js
const express = require('express');
const fs = require('fs');
const mainTemplate = fs.readFileSync('./views/index.html', 'utf-8');
const listTemplate = fs.readFileSync('./views/list.html', 'utf-8');

let sketchList = {};

const app = express();
app.use(express.json());
app.use(express.static('assets'));
app.use('/', express.static('public'));

app.get('/data', (req, res) => {
  res.json(sketchList);
});

app.post('/data', (req, res) => {
  sketchList = req.body;
  res.json({ count: Object.keys(sketchList).length });
});

app.get('/list', (req, res) => {
  res.send(
    listTemplate.replace(
      '${sketches}',
      `<ul>${Object.entries(sketchList).reduce(
        (acc, [title, sketch]) =>
          `${acc}<li>${`<a href="/${title}">${title}</a><div class="events">${sketch.events
            .slice(0, 6)
            .reduce(
              (acc, event) => `${acc} ${event[0].name}`,
              ''
            )}</div>`}</li>`,
        ''
      )}</ul>`
    )
  );
});

app.get('/:title?', (req, res) => {
  const { title } = req.params;
  if (!title) {
    res.setHeader('location', `/sketch-${Object.keys(sketchList).length + 1}`);
    return res.sendStatus(302);
  }
  // sketchList = {};
  res.send(mainTemplate.replace('${title}', title));
});

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

app.post('/:title/data/score', (req, res) => {
  const { title } = req.params;
  sketchList[title].score = req.body;
  res.json({ title });
});

app.get('/:title/data/clear', (req, res) => {
  const { title } = req.params;
  sketchList[title] = [];
  res.json([]);
});

app.post('/:title/data/:idx', (req, res) => {
  const { title, idx } = req.params;
  const sketch = sketchList[title] || emptySketch();
  const events = sketch.events;
  const event = req.body;
  events.length = idx;
  events[idx] = {
    ...emptyChannels,
    ...events[idx],
    time: (events[idx] || event).time,
    [event.channel]: event
  };
  sketchList[title] = sketch;
  res.json({ title, idx });
});

app.get('/:title/data', (req, res) => {
  const { title } = req.params;
  const sketch = sketchList[title] || emptySketch();
  res.json(sketch);
});

app.post('/:title/data', (req, res) => {
  const { title } = req.params;
  sketchList[title] = req.body;
  res.json({ title });
});

const listener = app.listen(process.env.PORT || 8080, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
