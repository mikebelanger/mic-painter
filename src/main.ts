import { downloadImage, drawBackground, visualize } from './helpers.ts'

let canvasElem = document.querySelector<HTMLCanvasElement>('#wavedraw');
let downloadButton = document.getElementById('download-image');
let recordButton: HTMLButtonElement | null = document.getElementById('record') as HTMLButtonElement | null;
let isRecording = false;
let source;
const START_MESSAGE = 'Start Recording';
const STOP_MESSAGE = 'Stop Recording';
let audioContext: AudioContext;
let analyser: AnalyserNode;


if (canvasElem) {
  drawBackground(canvasElem, 'rgba(0, 0, 0, 0)');

  downloadButton?.addEventListener('click' as keyof HTMLElementEventMap, () => {
    if (canvasElem) {
      let file = downloadImage(canvasElem, 'filename.png');
      file.click();
    }
  });

  recordButton?.addEventListener('click' as keyof HTMLElementEventMap, () => {
    isRecording = !isRecording;

    if (isRecording) {
      if (recordButton) recordButton.textContent = STOP_MESSAGE
      navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        audioContext = new AudioContext();
  
        // Set up the different audio nodes we will use for the app
        analyser = audioContext.createAnalyser();
        analyser.minDecibels = -100;
        analyser.maxDecibels = 0;
        analyser.smoothingTimeConstant = 0.85;
      
        source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);
      })
      .catch(err => {
        console.log(`Error accessing microphone: ${err}`);
      });  
    } else {
      if (recordButton) recordButton.textContent = START_MESSAGE;
    }
  });

  setInterval(() => {
    if (isRecording && canvasElem) {
      visualize(canvasElem, analyser, 'sinewave');
    }
  }, 20)
}