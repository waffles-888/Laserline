/* allow for files input */
const input = document.getElementById("fileInput");
const audioplayer = document.getElementById("audioPlayer");

/* handle file input */
input.addEventListener("change", function() {
    const file = input.files[0];
    const url = URL.createObjectURL(file);
    audioPlayer.src = url;
})

/* when play/pause button is clicked */
document.getElementById("playPauseButton").addEventListener("click", function() {
});