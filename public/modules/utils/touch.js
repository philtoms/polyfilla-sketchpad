const raf = requestAnimationFrame.bind(window) || setTimeout.bind(window);

export const copy = (offsetX, offsetY) => (
  { identifier = 0, pageX, pageY, radiusX, radiusY, rotationAngle, force },
  paintType
) => ({
  channel: identifier,
  pageX: Math.abs(pageX - offsetX),
  pageY: Math.abs(pageY - offsetY),
  radiusX,
  radiusY,
  rotationAngle,
  force,
  paintType,
});

export const fade = (ctx, width, height) => {
  raf(() => {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const opacity = data[i + 3];
      const dfade = opacity - opacity / 250;
      data[i + 3] = Math.max(0, dfade - 1);
    }
    ctx.putImageData(imageData, 0, 0);
    fade(ctx, width, height);
  });
};

export const draw = (ctx) => {
  ctx.beginPath();
  return ({ pageX, pageY, paintType }) => {
    const color = `rgb(0,0,0)`;
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2;
    if (paintType === 'fill') {
      ctx.beginPath();
      ctx.arc(pageX, pageY, 2, 0, 2 * Math.PI, false); // a circle at the start
      ctx.fill();
    } else {
      ctx.lineTo(pageX, pageY);
      ctx.stroke();
    }
  };
};
