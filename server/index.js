import express from 'express';
import bodyParser from 'body-parser';

import data from './data';
import list from './list';
import sketch from './sketch';

const app = express();
app.use(bodyParser.json({ limit: '50mb' }));
app.use(express.static('assets'));
app.use('/', express.static('public'));

app.get('/data', data.download);
app.post('/data', data.upload);

app.get('/list', list(data));

app.get('/:title?', sketch.main(data));
app.post('/:title/sketch/score', sketch.score(data));
app.get('/:title/sketch/clear', sketch.clear(data));
app.post('/:title/sketch/batch', sketch.batch(data));
app.post('/:title/sketch/:idx', sketch.insert(data));
app.get('/:title/sketch', sketch.download(data));
app.post('/:title/sketch', sketch.upload(data));

const listener = app.listen(process.env.PORT || 8080, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
