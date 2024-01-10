// ---------------------- Firebase configuration ----------------------
// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword }
  from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getDatabase, ref, set, update, child, get }
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

// Initialize Firebase Authentication
const auth = getAuth();

// Returns instance of your apps' FRD
const db = getDatabase(app);

// --------------- Check for null, empty ("") or all spaces only ------------//
function isEmptyorSpaces(str) {
  return str === null || str.match(/^ *$/) !== null;
}
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
// ---------------------- Validate Registration Data -----------------------//
function validation(firstName, lastName, email, password) {
  let fNameRegex = /^[a-zA-Z]+$/;
  let lNameRegex = /^[a-zA-Z]+$/;
  let emailRegex = /^[a-zA-Z0-9]+@ctemc\.org$/;

  if (
    isEmptyorSpaces(firstName) ||
    isEmptyorSpaces(lastName) ||
    isEmptyorSpaces(email) ||
    isEmptyorSpaces(password)
  ) {
    customAlert("Please complete all fields.");
    return false;
  }

  if (!fNameRegex.test(firstName)) {
    customAlert("The first name should only contain letters.");
    return false;
  }
  if (!lNameRegex.test(lastName)) {
    customAlert("The last name should only contain letters.");
    return false;
  }
  if (!emailRegex.test(email)) {
    customAlert("Please enter a valid email. Domain must be ctemc.org.");
    return false;
  }
  return true;
}

// --------------- Password Encryption -------------------------------------//
function encryptPass(password) {
  let encrypted = CryptoJS.AES.encrypt(password, password);
  return encrypted.toString();
}

// ---------------- Register new user -------------------------------//
document.getElementById("signUpForm").onsubmit = function (e) {
  // Prevent page from refreshing
  e.preventDefault();
  
  // Form data uses the name attribute of input elements
  const formData = new FormData(e.target);
  const data = {};
  for (let field of formData) {
    const [key, value] = field;
    data[key] = value;
  }

  // Get details of new account
  const firstName = data.firstName;
  const lastName = data.lastName;
  const email = data.email;
  const password = data.password;

  // Firebase requires a password of at least 6 characters
  // Validate the user inputs
  if (!validation(firstName, lastName, email, password)) {
    return;
  }

  // Create new app user using email/password auth
  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Create user credential
      const user = userCredential.user;

      // Add user account info to the FRD
      // set() function will create a new ref. or completely replace existing one
      // Each new user will be placed under the 'users' node
      set(ref(db, "users/" + user.uid + "/accountInfo"), {
        uid: user.uid, // save userID for home.js reference
        email: email,
        password: encryptPass(password),
        firstname: firstName,
        lastname: lastName,
        plan: 'basic'
      })
        .then(() => {
          // Data saved successfully
          customAlert("User created succesfully!");
          location = "/login.html"; // Redirect to login page
        })
        .catch((error) => {
          // The write failed...
          customAlert(error);
        });
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      customAlert(errorMessage);
    });
};