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
  $input(tempo, { target: { value } }) {
    this.el.nextElementSibling.innerText = value;
    return value;
  },
};

export const signature = {
  $init() {
    return this.el.value;
  },
  $input: (signature, { target: { value } }) => value,
};
