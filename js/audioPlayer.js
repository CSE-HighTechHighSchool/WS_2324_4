// ----------------- Firebase Setup & Initialization ------------------------//
// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signOut }
  from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getDatabase, ref, set, update, child, get, remove }
  from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js"

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBaZh0qXFMTkaKvX_08-WtJW4luzUFcirM",
    authDomain: "gpa-saver-squared.firebaseapp.com",
    databaseURL: "https://gpa-saver-squared-default-rtdb.firebaseio.com",
    projectId: "gpa-saver-squared",
    storageBucket: "gpa-saver-squared.appspot.com",
    messagingSenderId: "1098242379811",
    appId: "1:1098242379811:web:97a23ed43e6ce0ab5c2196"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
const auth = getAuth();

// Returns instance of your apps' FRD
const db = getDatabase(app);

let currentUser = null; // Initialize currentUser to null
// Custom alert function
function customAlert(message) {
  // Create overlay
  let overlay = document.createElement('div');
  overlay.className = 'overlay';

  // Create popup
  let popup = document.createElement('div');
  popup.className = 'popup';

  // Add message to popup
  popup.innerText = message;

  // Create close button
  let closeButton = document.createElement('button');
  closeButton.className = 'closeButton btn btn-dark rounded-pill';
  closeButton.textContent = 'x';

  // Add event listener to close button and overlay
  closeButton.addEventListener('click', function() {
    document.body.removeChild(overlay);
  });

  overlay.addEventListener('click', function() {
    document.body.removeChild(overlay);
  });

  // Prevent event propagation to overlay when popup is clicked
  popup.addEventListener('click', function(event) {
    event.stopPropagation();
  });

  // Add close button to popup
  popup.appendChild(closeButton);

  // Add popup to overlay
  overlay.appendChild(popup);

  // Add overlay to body
  document.body.appendChild(overlay);
}
//----------------- Dynamic navbar in tool page ------------------------//
// Make navigation bar solid color if page is scrolled
const navbar = document.getElementById("tools-navbar");

if (navbar) {
  document.addEventListener("scroll", (event) => {
    if (window.scrollY > 0) {
      navbar.style.backgroundColor = "var(--bg-nav)";
    } else {
      navbar.style.backgroundColor = "transparent";
    }
  });
}

//----------------------- Get User Object ------------------------------//
function getUser() {
    // Grab value for the 'keep logged in' switch
    let keepLoggedIn = localStorage.getItem('keepLoggedIn');
  
    // Grab user information passed from signIn.js
    if (keepLoggedIn == "yes") {
      currentUser = JSON.parse(localStorage.getItem("user"));
    } else {
      currentUser = JSON.parse(sessionStorage.getItem("user"));
    }
}

// ----------------------------- Get plan --------------------------
// Return the user's plan ("basic" or "pro")
async function getPlan(userID) {
    let plan = null;
    await get(ref(db, `users/${userID}/accountInfo`))
      .then((snapshot) => {
        if (snapshot.exists()) {
          plan = snapshot.val()["plan"];
        } else {
          customAlert("No data found.");
        }
      })
      .catch((error) => {
        customAlert("Unsuccessful, error: " + error);
      });
    return plan;
}

// Sign-out function that will remove user info from local/session storage
function signOutUser() {
    sessionStorage.removeItem("user");  // Clear session storage
    localStorage.removeItem("user");    // Clear local storage
    localStorage.removeItem("keepLoggedIn");
  
    signOut(auth).then(() => {
      // Sign-out successful
    })
    .catch((error) => {
      customAlert("Error: " + error)
    })
  
    window.location = "login.html"
}

document.addEventListener("DOMContentLoaded", function () {
  // ------------------------- Set Welcome Message -------------------------
  const loginLink = document.getElementById("login-link");
  const signupLink = document.getElementById("signup-link");

  getUser();
  if (currentUser != null) {
      loginLink.innerHTML = '';
      const userMessage = document.createElement("div");
      userMessage.className = "nav-link nbMenuItem";
      userMessage.style.color = "white";
      userMessage.textContent = `Hello, ${currentUser.firstname}!`;
      loginLink.appendChild(userMessage);

      signupLink.innerHTML = '';
      const logoutButton = document.createElement("button");
      logoutButton.className = "btn btn-light nav-btn rounded-pill py-1";
      logoutButton.textContent = "Log out";
      logoutButton.onclick = function() {
          signOutUser();
      }
      signupLink.appendChild(logoutButton);

  }
  // Theme background
  var themes = [
    {
      name: "Lofi",
      background: "img/background/lofi_anime.jpg",
      imgSrc:
        "https://www.freepik.com/free-ai-image/cartoon-lofi-young-manga-style-girl-studying-while-listening-music-raining-street-ai-generative_43227423.htm",
      imgAuthor: "chandlervid85",
      playlist: [
        "music/lofi/Silent_Wood~Purrple_Cat.mp3",
        "music/lofi/Where_The_Waves_Take_Us~Purrple_Cat.mp3",
        "music/lofi/Still_Awake~Ghostrifter_Official.mp3",
      ],
    },
    {
      name: "Classical",
      background: "img/background/classical_piano.webp",
      imgSrc: "https://wall.alphacoders.com/big.php?i=452391",
      imgAuthor: "miroha",
      playlist: [
        "music/classical/Op._27,_No._2_in_D-flat~Chopin.mp3",
        "music/classical/Piano_Concerto_No._21~Mozart.mp3",
        "music/classical/Piano_Sonata_No._15~Beethoven.mp3",
      ],
    },
    {
      name: "Nature",
      background: "img/background/nature_lake.jpg",
      imgSrc: "https://www.nature.org/en-us/about-us/where-we-work/europe/",
      imgAuthor: "Ken Geiger",
      playlist: [
        "music/nature/Waves.mp3",
        "music/nature/River.mp3",
        "music/nature/Countryside.mp3",
      ],
    },
    {
      name: "Fireplace",
      background: "img/background/fireplace.jpg",
      imgSrc: "https://wall.alphacoders.com/big.php?i=1193723",
      imgAuthor: "robokoboto",
      playlist: [
        "music/fireplace/Fireplace.mp3"
      ],
    },
    {
      name: "Rainstorm",
      background: "img/background/rainstorm.jpg",
      imgSrc: "https://www.youtube.com/watch?v=hUs-YL_ddt8",
      imgAuthor: "Calmed By Nature",
      playlist: [
        "music/rainstorm/Rain.mp3",
        "music/rainstorm/Thunder.mp3"
      ],
    },
    {
      name: "Coffee Shop",
      background: "img/background/coffee.jpg",
      imgSrc: "https://www.youtube.com/watch?v=DyJTVkRP1vY",
      imgAuthor: "Relaxing Jazz Piano",
      playlist: [
        "music/coffee/George_Street_Shuffle~Kevin_MacLeod.mp3",
        "music/coffee/Lobby_Time~Kevin_MacLeod.mp3",
        "music/coffee/On_Hold_For_You~Kevin_MacLeod.mp3"
      ],
    },
    // Add more themes as needed
  ];

  
  // Target all buttons we need
  var audioPlayer = document.getElementById("audioPlayer");       // <audio> element
  var playPauseBtn = document.getElementById("playPauseBtn");     // Play and pause button
  var song = document.getElementById("song");                     // Song name in tooltip
  var artist = document.getElementById("artist");                 // Artist of song in tooltip
  var changeThemeBtn = document.getElementById("changeThemeBtn"); // Button to change theme
  var imgCredit = document.getElementById("img-credit");          // Credit for background image

  // State variables
  var currentThemeIndex = 0;                // 0 = Lofi, 1 = Classical, 2 = Nature, 3 = Fireplace, 4 = Rainstorm, 5 = Coffee Shop
  var playing = false;                      // If audio is playing or not
  var playlist = themes[0].playlist;        // Playlist array
  var currentSong = 0;                      // Song index in the playlist
  audioPlayer.src = playlist[currentSong];  // Set <audio>'s source to the first song in playlist

  // Set volume set by slider
  function setVolume() {
    audioPlayer.volume = volumeSlider.value / 100;
  }

  // Updates song info in tooltip
  function updateSongInfo() {
    // Parse file name to readable format
    // File name: "music/lofi/Silent_Wood~Purrple_Cat.mp3" -> ['Silent Wood', 'Purrple Cat]
    [song.textContent, artist.textContent] = playlist[currentSong]
      .split("/")
      .pop()
      .replace(/_/g, " ")
      .replace(".mp3", "")
      .split("~");
  }

  // Change <audio> src to the new song, play it, and update the info in tooltip
  function playNewSong() {
    audioPlayer.src = playlist[currentSong];
    playMusic()
    updateSongInfo();
  }
  // Variables for managing the fade effect
var fadeIn = false;
var fadeOut = false;
var fadeAlpha = 0;

  // Play music and show pause icon
  function playMusic() {
    fadeIn = true;
    audioPlayer.play();
    playPauseBtn.innerHTML = '<i class="bi bi-pause"></i>';
    playing = true;
  }

  // Pause music and show play button
  function pauseMusic() {
    fadeOut = true;
    audioPlayer.pause();
    playPauseBtn.innerHTML = '<i class="bi bi-play"></i>';
    playing = false;
  }
  
  // Apply the theme
  function applyTheme() {
    // currentTheme = an object with all the data for the theme
    let currentTheme = themes[currentThemeIndex];

    // Change background image
    document.body.style.backgroundImage =
      'url("' + currentTheme.background + '")';
    
    // Update image credit link and text
    imgCredit.src = currentTheme.imgSrc;
    imgCredit.textContent = "Image by " + currentTheme.imgAuthor;
    
    // Update theme button text to display current theme name
    changeThemeBtn.textContent = "Theme: " + themes[currentThemeIndex].name;

    // Change playlist
    playlist = currentTheme.playlist;
    currentSong = 0;
    pauseMusic();
    audioPlayer.src = playlist[currentSong];
    updateSongInfo();
  }

  // When next button is clicked, move to next song abd play the song
  document.getElementById("nextBtn").addEventListener("click", function () {
    currentSong++;
    // Wrap back to first song if it is past the length of playlist
    if (currentSong >= playlist.length) {
      currentSong = 0;
    }
    playNewSong(); // Play the song
  });

  // When previous button clicked, go back a song and then play it
  document.getElementById("prevBtn").addEventListener("click", function () {
    currentSong--;
    if (currentSong < 0) {
      currentSong = playlist.length - 1;
    }
    playNewSong();
  });

  // Pause or play the song when pause/play button is clicked
  playPauseBtn.addEventListener("click", function () {
    if (playing) {
      pauseMusic();
    } else {
      playMusic();
    }
    updateSongInfo();
  });

  // When the music ends, move on to the next song
  audioPlayer.addEventListener("ended", function () {
    currentSong++;
    if (currentSong >= playlist.length) {
      currentSong = 0;
    }
    playNewSong();
  });

  // When volume slider changes, set volume
  volumeSlider.addEventListener("input", function () {
    setVolume();
  });

  // When theme button is clicked, apply the theme
  changeThemeBtn.addEventListener("click", async function () {
    // Increment currentThemeIndex
    currentThemeIndex++;
    getUser();
    // Check if themes should loop
    if(currentUser!=null){
      let plan = await getPlan(currentUser.uid);
      if (plan === "basic" && currentThemeIndex >= 3) {
        currentThemeIndex = 0; // Reset to first theme
        customAlert("Upgrade to Pro Plan to access all themes");
      } else if (plan === "pro" && currentThemeIndex >= themes.length) {
        // For pro users, loop all themes
        currentThemeIndex = 0;
      }
    }
    else{
      currentThemeIndex = 0; // Reset to first theme
      customAlert("Create a free account to access more themes");
    }
    applyTheme(); // Apply the theme
  });

  updateSongInfo();
  setVolume();

  // -------------------------------------- AUDIO VISUALIZER --------------------------------------

  var audioContext = new AudioContext(); // Create an audio context for managing audio
  var analyser = audioContext.createAnalyser(); // Used to get frequency data
  // https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode/fftSize
  // Use fast fourier transform to get frequency data from the audio
  analyser.fftSize = 2048;

  // Connect the audio player to the analyser
  var source = audioContext.createMediaElementSource(audioPlayer); // Get source from <audio> element
  source.connect(analyser); // Reroute audio to analyser
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

    var barWidth = 1; // Bars have a width of 1px
    var barSpacing = window.innerWidth * 0.0025; // Spacing of 0.25% of the screen width
    var xStart = 2; // Start first rectangle 2px into the canvas
    var centerY = canvas.height / 2; // Center vertically in canvas

    // /https://www.w3schools.com/TAgs/canvas_clearrect.asp
    // Clears the whole canvas for the next frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (var i = 0; i < bufferLength; i++) {
      var freqData = dataArray[i] / 255; // Frequency data ranges 0-255; here we normalize the data between 0-1
      ctx.fillStyle = "rgba(255, 255, 255, " + fadeAlpha + ")"; // Color of the bars
      var barHeight = (canvas.height * freqData) / 2; // Adjust the height based on loudness at this frequency
      // Create the rectangle (x, y, w, h)
      // It will be centered vertically in the middle of the canvas
      // It also has a resting height of 20px
      ctx.fillRect(xStart, centerY - barHeight / 2, barWidth, barHeight + 20);

      // The next rectangle will be positioned to the right by our specified spacing
      xStart += barWidth + barSpacing;
    }
    if (fadeIn) {
      fadeAlpha += 0.01; // Increase opacity gradually
      if (fadeAlpha >= 0.5) {
        fadeIn = false;
      }
    } else if (fadeOut) {
      fadeAlpha -= 0.01; // Decrease opacity gradually
      if (fadeAlpha <= 0) {
        fadeOut = false;
      }
    }

    requestAnimationFrame(drawVisualizer); // Repeatedly call this function to refresh the canvas
  }

  // Create the visualizer
  drawVisualizer();
});
