/* allow for files input */
const input = document.getElementById("fileInput");
const audioPlayer = document.getElementById("audioPlayer");

/* handle file input */
input.addEventListener("change", function() {
    const file = input.files[0];
    const url = URL.createObjectURL(file);
    audioPlayer.src = url;
})

/* when play/pause button is clicked */
document.getElementById("playPauseButton").addEventListener("click", function() {
    if (audioPlayer.paused) {
        audioCtx.resume();
        audioPlayer.play();
    } else {
        audioPlayer.pause();
    }
});

/* Create audio for analyser */
const audioCtx = new AudioContext();
const source = audioCtx.createMediaElementSource(audioPlayer);

/* consts for volume slider */
const volumeSlider = document.getElementById("volumeSlider");
const volumeSliderValue = document.getElementById("volumeSliderValue");

/* connecting the audio into the analyser */
const analyser = audioCtx.createAnalyser();

/* gain node for volume */
const gainNode = audioCtx.createGain();
gainNode.gain.value = volumeSlider.value / 100;

/* connect */
source.connect(gainNode);
gainNode.connect(analyser);
analyser.connect(audioCtx.destination);

/* volume slider */
volumeSlider.addEventListener("input", function(){
    const volume = volumeSlider.value / 100;
    gainNode.gain.value = volume;
    volumeSliderValue.textContent = volumeSlider.value;
});

/* canvas */
const canvas = document.getElementById("laserCanvas");
const canvasCtx = canvas.getContext("2d");

/* frequency data */
analyser.fftSize = 256;
const bufferLength = analyser.frequencyBinCount;
const dataArray = new Uint8Array(bufferLength);
const barwidth = canvas.width / bufferLength;

/* creating visualizer */
function draw() {
    requestAnimationFrame(draw);
    analyser.getByteFrequencyData(dataArray);
    canvasCtx.fillStyle = "#363199"; 
    canvasCtx.fillRect(0,0, canvas.width, canvas.height);
    canvasCtx.fillStyle = "#f9f9f9";
    for (let i = 0; i < bufferLength; i++) { 
        const barHeight = (dataArray[i] / 255) * canvas.height;
        const x = i * barwidth;
        const y = canvas.height - barHeight;
        canvasCtx.fillRect(x, y, barwidth, barHeight);
    }
}
draw();

/* seek bar */
const seekBar = document.getElementById("seekBar");

/* get max time for audio and set it to seek bar */
audioPlayer.addEventListener("loadedmetadata", function(){
    seekBar.max = audioPlayer.duration;
});

/* move seek bar as audio plays */
audioPlayer.addEventListener("timeupdate", function(){
    seekBar.value = audioPlayer.currentTime;
});

/* update audio when seek bar is moved */
seekBar.addEventListener("input", function(){
    audioPlayer.currentTime = seekBar.value;
});