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
          alert("No data found.");
        }
      })
      .catch((error) => {
        alert("Unsuccessful, error: " + error);
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
      alert("Error: " + error)
    })
  
    window.location = "login.html"
}

// --------------------------- Tools Page Loading -----------------------------
window.onload = async function() {

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

    // ------------------------- Set Tool Plan Statuses -------------------------
    const basicText = document.getElementsByClassName("basic-text");
    const proText = document.getElementsByClassName("pro-text");
    const proTools = document.getElementsByClassName("pro-tool");
    
    getUser();
  
    if (currentUser != null) {
      let plan = await getPlan(currentUser.uid);

      if (plan != null) {
        for (let i = 0; i < basicText.length; i++) {
            basicText[i].innerHTML = `<i class="bi bi-check-circle-fill"></i>&nbsp;&nbsp;Basic Plan Feature`;
            basicText[i].style.setProperty("color", "rgba(100, 200, 100, 0.85)");
        }
      }
  
      if (plan === "basic") {
        for (let i = 0; i < proText.length; i++) {
            proText[i].innerHTML = `<i class="bi bi-lock-fill"></i>&nbsp;&nbsp;Pro Plan Feature`;
            proTools[i].style.setProperty("opacity", "0.65");
        }
      }
  
      if (plan === "pro") {
        for (let i = 0; i < proText.length; i++) {
            proText[i].innerHTML = `<i class="bi bi-check-circle-fill"></i>&nbsp;&nbsp;Pro Plan Feature`;
            proText[i].style.setProperty("opacity", "1");
            proText[i].style.setProperty("background-image", "linear-gradient(120deg, #FA00FF 0%, #FFCB00 60%)");
            proText[i].style.setProperty("background-clip", "text");
            proText[i].style.setProperty("text-fill", "transparent");
            proText[i].style.setProperty("color", "transparent");
        }
      }
    }
};