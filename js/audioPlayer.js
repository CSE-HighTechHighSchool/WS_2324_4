document.addEventListener("DOMContentLoaded", function() {
  var themes = [
    {
      name: 'Lofi',
      background: '../img/background/lofi_anime.jpg',
      imgSrc: 'https://www.freepik.com/free-ai-image/cartoon-lofi-young-manga-style-girl-studying-while-listening-music-raining-street-ai-generative_43227423.htm#query=lofi%20anime&position=0&from_view=keyword&track=ais',
      imgAuthor: 'chandlervid85',
      playlist: [
        "music/lofi/Silent_Wood~Purrple_Cat.mp3",
        "music/lofi/Where_The_Waves_Take_Us~Purrple_Cat.mp3",
        "music/lofi/Still_Awake~Ghostrifter_Official.mp3"
      ]
    },
    {
      name: "Classical",
      background: '../img/background/classical_piano.webp',
      imgSrc: 'https://wall.alphacoders.com/big.php?i=452391',
      imgAuthor: 'miroha',
      playlist: [
        "music/classical/Op._27,_No._2_in_D-flat~Chopin.mp3",
        "music/classical/Piano_Concerto_No._21~Mozart.mp3",
        "music/classical/Piano_Sonata_No._15~Beethoven.mp3"
      ]
    }
    // Add more themes as needed
  ];
  
  // Target all buttons we need
  var audioPlayer = document.getElementById("audioPlayer");       // <audio> element
  var playPauseBtn = document.getElementById("playPauseBtn");     // Play and pause button
  var song = document.getElementById("song");                     // Song name in tooltip
  var artist = document.getElementById("artist");                 // Artist of song in tooltip
  var changeThemeBtn = document.getElementById("changeThemeBtn"); // Button to change theme
  
  // State variables
  var currentThemeIndex = 0;                // 0 = Lofi, 1 = Classical
  var playing = false;                      // If audio is playing or not
  var playlist = themes[0].playlist;        // Playlist array
  var currentSong = 0;                      // Song index in the playlist
  audioPlayer.src = playlist[currentSong];  // Set <audio>'s source to the first song in playlist

  // Apply the theme (lofi or classical) and start playing the first song
  function applyTheme() {
    document.body.style.backgroundImage = "url(\"" + themes[currentThemeIndex].background + ")";
    playlist = themes[currentThemeIndex].playlist;
    currentSong = 0;
    playCurrentSong();
  }

  // Set volume set by slider
  function setVolume() {
    audioPlayer.volume = volumeSlider.value / 100;
  }

  // Updates song info in 
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
  

  // -------------------------------------- AUDIO VISUALIZER --------------------------------------

  var audioContext = new AudioContext(); // Create an audio context for managing audio
  var analyser = audioContext.createAnalyser(); // Used to get frequency data
  // https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode/fftSize
  // Use fast fourier transform to get frequency data from the audio
  analyser.fftSize = 256;
  
  // Connect the audio player to the analyser
  var source = audioContext.createMediaElementSource(audioPlayer); // Get source from <audio> element
  source.connect(analyser);                   // Reroute audio to analyser
  analyser.connect(audioContext.destination); // Then route it to the device's speakers

  // Get canvas from DOM
  var canvas = document.getElementById("visualizer");
  var ctx = canvas.getContext("2d"); // Context is used to draw on the canvas

  // Set up the canvas size to take up the whole screen
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // How many frequency "bins" we have; this will tell how many bars we'll have
  var bufferLength = analyser.frequencyBinCount;

  // Function to draw the visualizer
  function drawVisualizer() {
    // https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode/getByteFrequencyData
    // Audio analyser requires Uint8Array type
    var dataArray = new Uint8Array(bufferLength); // Create an array to store the frequency data

    // The fun part: we get the frequency data from the audio
    // This function copies the audio data into the dataArray
    analyser.getByteFrequencyData(dataArray);

    var barWidth = 2;                 // Bars have a width of 2px
    var barSpacing = window.innerWidth * 0.01; // Spacing of 1% of the screen width
    var xStart = 5;                   // Start first rectangle 5px into the canvas
    var centerY = canvas.height / 2;  // Center vertically in canvas
    
    // /https://www.w3schools.com/TAgs/canvas_clearrect.asp
    // Clears the whole canvas for the next frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (var i = 0; i < bufferLength; i++) {
      var freqData = dataArray[i] / 255;            // Frequency data ranges 0-255; here we normalize the data between 0-1
      ctx.fillStyle = "rgba(255, 255, 255, 0.25)";  // Color of the bars
      var barHeight = canvas.height * freqData / 2; // Adjust the height based on loudness at this frequency
      // Create the rectangle (x, y, w, h)
      // It will be centered vertically in the middle of the canvas
      // It also has a resting height of 20px
      ctx.fillRect(xStart, centerY - barHeight / 2, barWidth, barHeight + 20);
      
      // The next rectangle will be positioned to the right by our specified spacing
      xStart += barWidth + barSpacing;
    }

    requestAnimationFrame(drawVisualizer); // Repeatedly call this function to refresh the canvas
  }

  // Create the visualizer
  drawVisualizer();
});
