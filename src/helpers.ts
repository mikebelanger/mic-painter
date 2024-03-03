export type VisualSettingsTypes = 'frequencybars' | 'sinewave';

export function drawBackground(element: HTMLCanvasElement, color: string) {
  let ctx = element.getContext('2d');
  if (ctx) {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, element.width, element.height)
  }
}

export function downloadImage(element: HTMLCanvasElement, imageName: string): HTMLAnchorElement {
  var imgData = element.toDataURL("image/png", 1.0);

  var a = document.createElement('a');

  a.href = imgData;
  a.download = imageName;
  return a;
}

const randChannel = (range = 255): number => {
  return Math.random() * range;
}

const randColor = (): string => {
  return `rgba(${randChannel()}, ${randChannel()}, ${randChannel()}, ${randChannel(1)})`;
}

export function visualize(canvas: HTMLCanvasElement, analyser: AnalyserNode, visualSetting: VisualSettingsTypes) {
  const WIDTH = canvas.width;
  const HEIGHT = canvas.height;
  const canvasCtx = canvas.getContext('2d');

  if (canvasCtx && analyser) {
    analyser.fftSize = 2048;
    // const bufferLength = analyser.fftSize;

    // Maybe try this out later
    // We can use Float32Array instead of Uint8Array if we want higher precision
    // const dataArray = new Float32Array(bufferLength);
    // const dataArray = new Uint8Array(bufferLength);

    // canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);

    analyser.minDecibels = -90;
    analyser.maxDecibels = -10;
    analyser.smoothingTimeConstant = 0.85;
  

    if (visualSetting === "sinewave") {
      analyser.fftSize = 2048;
      const bufferLength = analyser.fftSize;

      // We can use Float32Array instead of Uint8Array if we want higher precision
      // const dataArray = new Float32Array(bufferLength);
      const dataArray = new Uint8Array(bufferLength);

      // canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);

      const draw = () => {
        // drawVisual = requestAnimationFrame(draw);

        analyser.getByteTimeDomainData(dataArray);

        canvasCtx.fillStyle = randColor();
        // canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

        canvasCtx.lineWidth = 2;
        canvasCtx.strokeStyle = randColor();

        canvasCtx.beginPath();

        const sliceWidth = (WIDTH * 1.0) / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0;
          const y = (v * HEIGHT) / 2;

          if (i === 0) {
            canvasCtx.moveTo(x, y);
          } else {
            canvasCtx.lineTo(x, y);
          }

          x += sliceWidth;
        }

        canvasCtx.lineTo(WIDTH, HEIGHT / 2);
        canvasCtx.stroke();
      };

      draw();
    } else if (visualSetting == "frequencybars") {
      analyser.fftSize = 256;
      const bufferLengthAlt = analyser.frequencyBinCount;

      // See comment above for Float32Array()
      const dataArrayAlt = new Uint8Array(bufferLengthAlt);

      // canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);

      const drawAlt = () => {
        // drawVisual = requestAnimationFrame(drawAlt);

        analyser.getByteFrequencyData(dataArrayAlt);

        canvasCtx.fillStyle = "rgba(0, 0, 0, 0)";
        // canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

        const barWidth = (WIDTH / bufferLengthAlt) * 2.5;
        let x = 0;
        for (let i = 0; i < bufferLengthAlt; i++) {
          const barHeight = dataArrayAlt[i] * 7;
          // const barHeight = Math.random() * HEIGHT;

          canvasCtx.fillStyle = "rgba(" + (barHeight + 20) + ",40,50, 0.5)";
          canvasCtx.fillRect(
            x,
            HEIGHT - barHeight / 2,
            barWidth,
            barHeight / 2
          );

          x += barWidth + 1;
        }
      };

      drawAlt();
    }
  }
}

type canvasDimensions = {width: number, height: number};

export function scaleCanvas(elem: HTMLCanvasElement, bigger: boolean, dimensions: canvasDimensions) {
  let ctx = elem.getContext('2d');

  // get scaling factor
  const dx = bigger ? window.innerWidth / dimensions.width : dimensions.width / window.innerWidth;
  const dy = bigger ? window.innerHeight / dimensions.height : dimensions.height / window.innerHeight;

  ctx?.scale(dx, dy);
  ctx?.setTransform(1, 0, 0, 1, 0, 0);
}

export function toggleFullscreen(elem: HTMLCanvasElement, containerElement: HTMLElement, dimensions: canvasDimensions) {

  if (!document.fullscreenElement && elem && containerElement) {
    containerElement.requestFullscreen()
    .then((_val) => {
      scaleCanvas(elem, true, dimensions);
    })
    .catch((err) => {
      console.error(
        `Error attempting to enable fullscreen mode: ${err.message} (${err.name})`,
      );
    });
  } else {
    scaleCanvas(elem, false, dimensions);
    document.exitFullscreen();
  }
}
