import fs from 'fs';

const listTemplate = fs.readFileSync(`${__dirname}/list.html`, 'utf-8');

export default ({ list }) => (req, res) => {
  res.send(
    listTemplate.replace(
      '${sketches}',
      `<ul>${list().reduce(
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
};
