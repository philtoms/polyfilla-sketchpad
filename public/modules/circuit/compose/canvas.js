const raf = requestAnimationFrame.bind(window) || setTimeout.bind(window);

export const copy = (offsetX, offsetY) => (touches, paintType) => {
  const { identifier, pageX, pageY, radiusX, radiusY, rotationAngle, force } =
    // touches.length > 1
    //   ? Array.from(touches).reduce(
    //       (acc, touch) => {
    //         return acc.pageX > touch.pageX ? touch : acc;
    //       },
    //       { pageX: Number.MAX_VALUE }
    //     )
    //   : touches[0];
    touches[0];
  return (
    pageY >= offsetY && {
      channel: 0, // single voice only
      pageX: Math.abs(pageX - offsetX),
      pageY: Math.abs(pageY - offsetY),
      radiusX,
      radiusY,
      rotationAngle,
      force,
      paintType,
    }
  );
};

let working = false;
export const fade = (ctx, width, height, idx = 0) => {
  if (!working) {
    working = true;
    let fading = false;
    raf(() => {
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const opacity = data[i + 3];
        const step = parseInt(opacity - opacity / 5);
        const dfade = Math.max(0, step);
        if (dfade) {
          fading = true;
          if (idx % 10 === 0) data[i + 3] = dfade;
        }
      }
      ctx.putImageData(imageData, 0, 0);
      working = false;
      if (fading) {
        fade(ctx, width, height, idx + 1);
      }
    });
  }
};

export const draw = (ctx, width, height) => {
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
    fade(ctx, width, height);
  };
};
