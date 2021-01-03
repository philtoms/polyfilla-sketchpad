import client from '../utils/client.js';

export const title = {
  $init() {
    return this.el.value;
  },
  $input(title, { target: { value } }) {
    window.location.href = window.location.href.replace(title, value);
  },
};

export const tempo = {
  $init() {
    return this.el.value;
  },
  $input(acc, { target: { value } }) {
    this.el.nextElementSibling.innerText = value;
    return { ...acc, tempo: value };
  },
};

export const timeSignature = {
  $init() {
    return this.el.value;
  },
  $input: (acc, { target: { value } }) => ({ ...acc, timeSignature: value }),
};

export default {
  $init: ({ autograph }) => client.get(autograph.title),
};
