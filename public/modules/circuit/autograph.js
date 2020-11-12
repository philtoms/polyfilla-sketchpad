import client from '../utils/client.js';
import quantize from '../utils/quantize.js';

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

export const timeSignature = {
  $init(acc) {
    return { ...acc, timeSignature: this.el.value };
  },
  $input: (acc, { target: { value } }) => ({ ...acc, timeSignature: value }),
};

export default {
  $init(acc) {
    client.get(acc.autograph.title).then((data) => {
      const autograph = {
        ...acc.autograph,
        ...data.autograph,
      };
      this.signal('/player/data', {
        ...data,
        autograph,
        quantize: quantize(acc.autograph, data),
      });
      return {
        ...acc,
        autograph,
      };
    });
  },
};
