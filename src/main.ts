import { downloadImage, drawBackground, toggleFullscreen, visualize, VisualSettingsTypes } from './helpers.ts'
import 'bulma';
import 'boxicons';

let canvasElem = document.querySelector<HTMLCanvasElement>('#wavedraw');
let canvasContainerElem = canvasElem?.parentNode as HTMLElement;
let downloadButton = document.getElementById('download-image');
let recordButton: HTMLButtonElement | null = document.getElementById('record') as HTMLButtonElement | null;
let fullscreenButton: HTMLButtonElement | null = document.getElementById('fullscreen') as HTMLButtonElement | null;
let visualizationTypeButton: HTMLButtonElement | null = document.getElementById('visualization-type') as HTMLButtonElement | null;
let dropdowns = [
  document.getElementById('sinewave') as HTMLButtonElement | null,
  document.getElementById('frequencybars') as HTMLButtonElement | null
];
let instructionsDiv: HTMLButtonElement | null = document.getElementById('instructions') as HTMLButtonElement | null;

let isRecording = false;
let source;
const START_MESSAGE = `<box-icon name='microphone' type='solid' color='#ffffff'></box-icon>Start recording! (Spacebar)`
const STOP_MESSAGE = `<box-icon name='microphone' type='solid' color='#ffffff'></box-icon>Stop recording (Spacebar)`
const INSTRUCTIONS = `Click 'Start Recording'/Press spacebar and ensure you permit your browser to access your computer mic.`
const DEFAULT_CANVAS_DIMENSIONS = {
  width: 1000,
  height: 500,
};
let visualizationType: VisualSettingsTypes = 'frequencybars';

let audioContext: AudioContext;
let analyser: AnalyserNode;

if (canvasElem) {
  if (instructionsDiv) instructionsDiv.textContent = INSTRUCTIONS;
  drawBackground(canvasElem, 'rgba(0, 0, 0, 0)');
  // Open the visualization type menu
  visualizationTypeButton?.addEventListener('click' as keyof HTMLElementEventMap, () => {
    if (visualizationTypeButton) {
      visualizationTypeButton.classList.toggle('is-active');
    }
  });

  // Download image button
  downloadButton?.addEventListener('click' as keyof HTMLElementEventMap, () => {
    if (canvasElem) {
      let file = downloadImage(canvasElem, 'filename.png');
      file.click();
    }
  });

  fullscreenButton?.addEventListener('click' as keyof HTMLElementEventMap, () => {
    if (canvasElem && canvasContainerElem) toggleFullscreen(canvasElem, canvasContainerElem, DEFAULT_CANVAS_DIMENSIONS);
  });

  // For clicking individual visualization types
  dropdowns.forEach((dropdown) => {
    dropdown?.addEventListener('click', (_ev: MouseEvent) => {
      visualizationType = dropdown.id as VisualSettingsTypes;
    })
  });

  const toggleRecording = () => {
    isRecording = !isRecording;

    if (isRecording) {
      if (instructionsDiv) instructionsDiv.textContent = '';
      if (recordButton) recordButton.innerHTML = STOP_MESSAGE
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
      if (recordButton) recordButton.innerHTML = START_MESSAGE;
      if (instructionsDiv) instructionsDiv.textContent = INSTRUCTIONS;
    }
  }

  // Toggle record button on and off
  recordButton?.addEventListener('click' as keyof HTMLElementEventMap, toggleRecording);

  // Make a keyboard shortcut for triggering record (in case of Fullscreen mode)
  window.addEventListener('keydown', (ev: KeyboardEvent) => {
    switch(ev.key) {
      case "Shift":
        if (canvasElem && canvasContainerElem) toggleFullscreen(canvasElem, canvasContainerElem, DEFAULT_CANVAS_DIMENSIONS);
        break;
      case " ":
        toggleRecording();
        break;
      default:
        break;
    }
  })

  setInterval(() => {
    if (isRecording && canvasElem) {
      visualize(canvasElem, analyser, visualizationType);
    }
  }, 20)
}