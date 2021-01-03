export default {
  $init() {
    document.addEventListener(
      'keydown',
      () => {
        this.signal('../keyboard', true);
      },
      false
    );
    document.getElementById('sharpen').addEventListener(
      'touchstart',
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
    document.getElementById('sharpen').addEventListener(
      'touchend',
      () => {
        this.signal('../keyboard', false);
      },
      false
    );
    return false;
  },
};
