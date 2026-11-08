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
const playPauseButton = document.getElementById("playPauseButton");

playPauseButton.addEventListener("click", function() {
    if (audioPlayer.paused) {
        audioCtx.resume();
        audioPlayer.play();
    } else {
        audioPlayer.pause();
    }
});

/* play/button reset */
audioPlayer.addEventListener("play", function(){
    playPauseButton.textContent = "Pause";
});

audioPlayer.addEventListener("pause", function(){
    playPauseButton.textContent = "Play";
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
analyser.fftSize = 128;
const bufferLength = analyser.frequencyBinCount;
const dataArray = new Uint8Array(bufferLength);

/* resize canvas per screen size */
let barwidth;
let sky;
function resizeCanvas() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    barwidth = canvas.width / bufferLength;
    sky = canvasCtx.createLinearGradient(0, 0, 0, canvas.height);
    sky.addColorStop(0, "#363199");
    sky.addColorStop(1, "#000000");
};

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

/* creating visualizer */
function draw() {
    requestAnimationFrame(draw);
    analyser.getByteFrequencyData(dataArray);
    canvasCtx.fillStyle = sky;
    canvasCtx.shadowBlur = 0;
    canvasCtx.fillRect(0,0, canvas.width, canvas.height);
    canvasCtx.fillStyle = "#ff00ff";
    canvasCtx.shadowColor = "#ff00ff";
    canvasCtx.shadowBlur = 20;
    canvasCtx.font = "50px Milker";
    canvasCtx.textAlign = "center";
    canvasCtx.fillText("Laserline", canvas.width / 2, 50);
    canvasCtx.shadowColor = "#00ffff";
    canvasCtx.fillStyle = "#00ffff";
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
const seekTime = document.getElementById("seekTime");

/* get max time for audio and set it to seek bar */
audioPlayer.addEventListener("loadedmetadata", function(){
    seekBar.max = audioPlayer.duration;
    seekTime.textContent = formatTime(audioPlayer.duration);
});

/* move seek bar as audio plays */
audioPlayer.addEventListener("timeupdate", function(){
    seekBar.value = audioPlayer.currentTime;
    seekTime.textContent = formatTime(audioPlayer.currentTime) + " / " + formatTime(audioPlayer.duration);
});

/* update audio when seek bar is moved */
seekBar.addEventListener("input", function(){
    audioPlayer.currentTime = seekBar.value;
});

/* seekbar time*/
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return minutes + ":" + String(secs).padStart(2, '0');
}
