/* allow for files input */
const input = document.getElementById("fileInput");
const audioPlayer = document.getElementById("audioPlayer");

/* handle file input */
input.addEventListener("change", function() {
    const file = input.files[0];
    const url = URL.createObjectURL(file);
    const coverArt = document.getElementById("coverArt");
    audioPlayer.src = url;
    jsmediatags.read(file, {
    onSuccess: function(tag) {
        const picture = tag.tags.picture;

        if (picture) {
        const blob = new Blob([new Uint8Array(picture.data)], {type: picture.format});
        const imageUrl = URL.createObjectURL(blob);
        coverArt.src = imageUrl;
        coverArt.style.display = "block";
        } else {
            coverArt.style.display = "none";
        }
    },
    onError: function(error) {
        console.log(error);
        coverArt.style.display = "none";
    }
})
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
const visibleBars = Math.floor(bufferLength * 0.7);
const dataArray = new Uint8Array(bufferLength);

/* resize canvas per screen size */
let barwidth;
let sky;
let sunX;
let sunY;
let sunRadius;
let sunGradient;
let horizonY;

function resizeCanvas() {
    /* resize canvas based on screen size */
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    /* bar width and sky changes based on canvas size */
    barwidth = canvas.width / visibleBars;
    sky = canvasCtx.createLinearGradient(0, 0, 0, canvas.height);
    sky.addColorStop(0, "#363199");
    sky.addColorStop(1, "#000000");
    /* sun position moving based on canvas size */
    sunRadius = canvas.height * 0.4;
    sunX = canvas.width / 2;
    sunY = horizonY = canvas.height * 0.7;

    sunGradient = canvasCtx.createLinearGradient(0, sunY - sunRadius, 0, sunY);
    sunGradient.addColorStop(0, "#ffff00");
    sunGradient.addColorStop(1, "#ff00ff");



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
    canvasCtx.fillStyle = sunGradient;
    canvasCtx.shadowColor = "#FF6D92";
    canvasCtx.shadowBlur = 30;
    canvasCtx.beginPath();
    canvasCtx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
    canvasCtx.fill();
    canvasCtx.shadowBlur = 0;
    canvasCtx.fillStyle = "#0a0a22";
    canvasCtx.fillRect(0, horizonY, canvas.width, canvas.height - horizonY);
    /* horisontal lines */
    canvasCtx.strokeStyle = "#ff00ff";
    canvasCtx.shadowColor = "#ff00ff";
    canvasCtx.lineWidth = 2;
    canvasCtx.shadowBlur = 5;
    const numberOfLines = 10;
    for (let i = 1; i <= numberOfLines; i++) {
        const fraction = i / numberOfLines;
        const y = horizonY + (canvas.height - horizonY) * fraction * fraction;
            canvasCtx.beginPath();
            canvasCtx.moveTo(0, y);
            canvasCtx.lineTo(canvas.width, y);
            canvasCtx.stroke();
    }
    /* vertical lines */
    canvasCtx.lineWidth = 2;
    canvasCtx.shadowBlur = 5;
    const numberOfVerticalLines = 10;
    for (let i = -numberOfVerticalLines; i <= numberOfVerticalLines; i++) {
        const bottomX = canvas.width / 2 + i * (canvas.width / 8);
            canvasCtx.beginPath();
            canvasCtx.moveTo(canvas.width / 2, horizonY);
            canvasCtx.lineTo(bottomX, canvas.height);
            canvasCtx.stroke();
    }
    /* title */
    canvasCtx.fillStyle = "#ff00ff";
    canvasCtx.shadowColor = "#ff00ff";
    canvasCtx.shadowBlur = 20;
    canvasCtx.font = "50px Milker";
    canvasCtx.textAlign = "center";
    canvasCtx.fillText("Laserline", canvas.width / 2, 50);
    /* bars */
    canvasCtx.shadowColor = "#00ffff";
    canvasCtx.fillStyle = "#00ffff";
    for (let i = 0; i < visibleBars; i++) { 
        const barHeight = (dataArray[i] / 255) * horizonY;
        const x = i * barwidth;
        const y = canvas.height - barHeight;
        canvasCtx.fillRect(x, y, barwidth * 0.4, barHeight);
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
