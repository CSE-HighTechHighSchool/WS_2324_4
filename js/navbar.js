// ----------------- Firebase Setup & Initialization ------------------------//
// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signOut }
  from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getDatabase, ref, set, update, child, get, remove }
  from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js"

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

//----------------- Changing navbar links if user is logged in -----------------//
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAPUSbHaXz6-mo12gc1rLjzoJjbfkjusI8",
  authDomain: "testproject-cbfc1.firebaseapp.com",
  databaseURL: "https://testproject-cbfc1-default-rtdb.firebaseio.com",
  projectId: "testproject-cbfc1",
  storageBucket: "testproject-cbfc1.appspot.com",
  messagingSenderId: "906539490157",
  appId: "1:906539490157:web:7e10a3b01c1501727c9864",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
const auth = getAuth();

// Returns instance of your apps' FRD
const db = getDatabase(app);

let currentUser = null; // Initialize currentUser to null

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

//------------- Change navbar based on if user is logged in -------------//
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
