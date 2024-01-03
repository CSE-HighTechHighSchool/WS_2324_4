// ----------------- Firebase Setup & Initialization ------------------------//
// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  getDatabase,
  ref,
  set,
  update,
  child,
  get,
  remove,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// Your web app's Firebase configuration

const firebaseConfig = {
  apiKey: "AIzaSyBaZh0qXFMTkaKvX_08-WtJW4luzUFcirM",
  authDomain: "gpa-saver-squared.firebaseapp.com",
  databaseURL: "https://gpa-saver-squared-default-rtdb.firebaseio.com",
  projectId: "gpa-saver-squared",
  storageBucket: "gpa-saver-squared.appspot.com",
  messagingSenderId: "1098242379811",
  appId: "1:1098242379811:web:97a23ed43e6ce0ab5c2196",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
const auth = getAuth();

// Returns instance of your apps' FRD
const db = getDatabase(app);

let currentUser = null; // Initialize currentUser to null

// ----------------------- Get User object ------------------------------
function getUser() {
  // Grab value for the 'keep logged in' switch
  let keepLoggedIn = localStorage.getItem("keepLoggedIn");

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

// ----------------------------- Update plan --------------------------
// Updates plan and return success status (true = success, false = failure)
function updatePlan(userID, plan) {
  // Must use brackets around variable name to use it as a key
  update(ref(db, "users/" + userID + "/accountInfo/"), { plan })
    .then(() => {
      alert(`Plan successfully updated to ${plan}.`);
      return true;
    })
    .catch((error) => {
      alert("There was an error. Error: " + error);
      return false;
    });
}

// Make a plan button say "Current Plan"
function makeCurrent(elem) {
  elem.textContent = "Current Plan";
  elem.className = "text-light opacity-50 text-center fst-italic";
  elem.style.pointerEvents = "none";
}

// --------------------------- Home Page Loading -----------------------------
window.onload = async function() {

  // ------------------------- Set Welcome Message -------------------------
  getUser();
  if (currentUser !== null) {
    const basicBtn = document.getElementById("basic");
    const proBtn = document.getElementById("pro");
    let plan = await getPlan(currentUser.uid);
    console.log(plan);

    // Downgrade to Basic Plan
    basicBtn.href = "#";
    if (plan === "basic") {
      makeCurrent(basicBtn);
    }
    basicBtn.onclick = function (e) {
      e.preventDefault();
      const userID = currentUser.uid;
      const success = updatePlan(userID, "basic");

      // Change button to status "Current Plan"
      makeCurrent(basicBtn);

      // Change pro button back to normal state
      proBtn.textContent = "Become a pro";
      proBtn.className = "btn btn-dark rounded-pill px-3";
      proBtn.style.pointerEvents = "all";
    };

    // Upgrade to Pro Plan
    proBtn.href = "#";
    if (plan === "pro") {
      makeCurrent(proBtn);
    }
    proBtn.onclick = function (e) {
      e.preventDefault();
      const userID = currentUser.uid;
      updatePlan(userID, "pro");

      // Change button to status "Current Plan"
      makeCurrent(proBtn);

      // Change basic button back to normal state
      basicBtn.textContent = "Get started for free";
      basicBtn.className = "btn ghost-btn rounded-pill px-3 d-block";
      basicBtn.style.pointerEvents = "all";
    };
  }
}