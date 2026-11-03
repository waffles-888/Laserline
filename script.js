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