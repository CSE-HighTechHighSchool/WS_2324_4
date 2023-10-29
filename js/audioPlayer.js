document.addEventListener("DOMContentLoaded", function() {
  var currentSong = 0;
  var themes = [
    {
      name: 'Lofi',
      background: 'url("../img/background/lofi_anime.jpg")',
      playlist: [
        "music/lofi/Silent_Wood~Purrple_Cat.mp3",
        "music/lofi/Where_The_Waves_Take_Us~Purrple_Cat.mp3",
        "music/lofi/Still_Awake~Ghostrifter_Official.mp3"
      ]
    },
    {
      name: "Classical",
      background: 'url("../img/background/classical_piano.webp")',
      playlist: [
        "music/classical/Op._27,_No._2_in_D-flat~Chopin.mp3",
        "music/classical/Piano_Concerto_No._21~Mozart.mp3",
        "music/classical/Piano_Sonata_No._15~Beethoven.mp3"
      ]
    }
    // Add more themes as needed
  ];

  var currentThemeIndex = 0;
  
  var audioPlayer = document.getElementById("audioPlayer");
  var playPauseBtn = document.getElementById("playPauseBtn");
  var artist = document.getElementById("artist");
  var song = document.getElementById("song");
  var playing = false;
  var changeThemeBtn = document.getElementById("changeThemeBtn");
  var playlist = themes[0].playlist;
  audioPlayer.src = playlist[currentSong];

  function applyTheme() {
    document.body.style.backgroundImage = themes[currentThemeIndex].background;
    playlist = themes[currentThemeIndex].playlist;
    currentSong = 0;
    playCurrentSong();
  }
  function setVolume() {
    audioPlayer.volume = volumeSlider.value / 100;
  }

  function updateSongInfo() {
      // Parse file name to readable format
      // File name: Silent_Wood~Purrple_Cat.mp3
      //          becomes
      // Song title: Silent Wood
      // Artist: Purrple Cat
      [song.textContent, artist.textContent] = playlist[currentSong].split('/').pop().replace(/_/g, ' ').replace('.mp3', '').split('~');
  }

  function playCurrentSong() {
      audioPlayer.src = playlist[currentSong];
      audioPlayer.play();
      updateSongInfo();
  }

  function playMusic() {
      audioPlayer.play();
      playPauseBtn.innerHTML = '<i class="bi bi-pause"></i>';
      playing = true;
  }

  function pauseMusic() {
      audioPlayer.pause();
      playPauseBtn.innerHTML = '<i class="bi bi-play"></i>';
      playing = false;
  }

  document.getElementById("nextBtn").addEventListener("click", function() {
      currentSong++;
      if (currentSong >= playlist.length) {
          currentSong = 0;
      }
      playCurrentSong();
      playMusic();
  });

  document.getElementById("prevBtn").addEventListener("click", function() {
      currentSong--;
      if (currentSong < 0) {
          currentSong = playlist.length - 1;
      }
      playCurrentSong();
      playMusic();
  });

  playPauseBtn.addEventListener("click", function() {
      if (playing) {
          pauseMusic();
      } else {
          playMusic();
      }
      updateSongInfo();
  });

  audioPlayer.addEventListener("ended", function() {
      currentSong++;
      if (currentSong >= playlist.length) {
          currentSong = 0;
      }
      playCurrentSong();
  });
  volumeSlider.addEventListener("input", function() {
    setVolume();
  });
  changeThemeBtn.addEventListener("click", function() {
    currentThemeIndex = (currentThemeIndex + 1) % themes.length;
    changeThemeBtn.textContent = "Theme: " + themes[currentThemeIndex].name;

    applyTheme();
    playMusic();
  });

  updateSongInfo();
  setVolume();
  applyTheme();
});
