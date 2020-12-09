export default {
  $init(state) {
    document.addEventListener(
      'keydown',
      () => {
        this.signal('../keyboard', true);
      },
      false
    );
    document.addEventListener(
      'keyup',
      () => {
        this.signal('../keyboard', false);
      },
      false
    );
    return { ...state, keyboard: false };
  },
};
