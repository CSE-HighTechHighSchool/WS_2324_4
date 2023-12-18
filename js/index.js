// ----------------- Firebase Setup & Initialization ------------------------//

/// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } 
  from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import { getDatabase, ref, set, update, child, get, remove }
  from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

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

const auth = getAuth(); // Firebase authentication

// Return an instance of the database associated with your app
const db = getDatabase(app);


// --------------------- Get reference values -----------------------------

let currentUser = null; // Initialize currentUser to null

// ----------------------- Get user's name ------------------------------
function getUsername(){
  // Grab value for the 'keep logged in' switch
  let keepLoggedIn = localStorage.getItem("keepLoggedIn");

  // Grab user information passed from signIn.js
  if(keepLoggedIn == "yes"){
    currentUser = JSON.parse(localStorage.getItem('user'));
  }
  else{
    currentUser = JSON.parse(sessionStorage.getItem('user'));
  }
}

// Sign-out function that will remove user info from local/session storage and
// sign-out from FRD
function SignOutUser(){
  sessionStorage.removeItem('user');  // Clear session storage
  localStorage.removeItem('user');    // Clear local storage of user
  localStorage.removeItem('keepLoggedIn');

  signOutLink(auth).then(() => {
      // Sign-out successful
    }).catch((error) => {
      // Error occurred
    });
  
  window.location = "index.html"
}

// ----------------------------- Update plan --------------------------
function updatePlan(userID, plan){
  // Must use brackets around variable name to use it as a key
  update(ref(db, 'users/' + userID + '/data/plan/'), {plan})
  .then(() =>{
    alert("Plan updated successfully.");
  })
  .catch((error) =>{
    alert("There was an error. Error: " + error);
  });
}

// --------------------------- Home Page Loading -----------------------------
window.onload = function() {

    // ------------------------- Set Welcome Message -------------------------

    // Downgrade to Basic Plan
    document.getElementById('basic').onclick = function(){
        const userID = currentUser.uid;
        updateData(userID, 'basic');
    }

    // Upgrade to Pro Plan
    document.getElementById('pro').onclick = function(){
        const userID = currentUser.uid;
        updateData(userID, 'pro');
    }
  }