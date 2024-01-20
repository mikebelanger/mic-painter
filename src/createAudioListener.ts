export const createWaveListener = () => {
  const audioCtx = new AudioContext();
  audioCtx.resume().then(() => {
    const analyzer = audioCtx.createAnalyser();

    analyzer.fftSize = 2048;
    analyzer.minDecibels = -100;
    analyzer.maxDecibels = -30;
  
    return analyzer;  
  });
};