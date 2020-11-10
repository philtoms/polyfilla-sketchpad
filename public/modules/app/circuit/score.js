import client from '../../utils/client.js';
import quantize from '../../melody/quantize.js';

export const title = {
  $init(acc) {
    return { ...acc, title: this.el.value };
  },
  $input(title, { target: { value } }) {
    window.location.href = window.location.href.replace(title, value);
  },
};

export const tempo = {
  $init(acc) {
    return { ...acc, tempo: this.el.value };
  },
  $input(acc, { target: { value } }) {
    this.el.nextElementSibling.innerText = value;
    return { ...acc, tempo: value };
  },
};

export const signature = {
  $init(acc) {
    return { ...acc, signature: this.el.value };
  },
  $input: (acc, { target: { value } }) => ({ ...acc, signature: value }),
};

export default {
  $init(acc) {
    client.get(acc.score.title).then((data) => {
      const score = {
        ...acc.score,
        ...data.score,
      };
      this.signal('/player/data', {
        ...data,
        score,
        quantize: quantize(acc.score, data),
      });
      return {
        ...acc,
        score,
      };
    });
  },
};
