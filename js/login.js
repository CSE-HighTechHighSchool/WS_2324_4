// ---------------------- Firebase configuration ----------------------

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword }
  from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getDatabase, ref, set, update, child, get }
  from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAPUSbHaXz6-mo12gc1rLjzoJjbfkjusI8",
  authDomain: "testproject-cbfc1.firebaseapp.com",
  databaseURL: "https://testproject-cbfc1-default-rtdb.firebaseio.com",
  projectId: "testproject-cbfc1",
  storageBucket: "testproject-cbfc1.appspot.com",
  messagingSenderId: "906539490157",
  appId: "1:906539490157:web:7e10a3b01c1501727c9864"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
const auth = getAuth();

// Returns instance of your apps' FRD
const db = getDatabase(app);

// ---------------------- Sign-In User ---------------------------------------//

document.getElementById("signIn").onclick = function() {
  // Prevent page from refreshing
  e.preventDefault();
    
  // Form data uses the name attribute of input elements
  const formData = new FormData(e.target);
  const data = {};
  for (let field of formData) {
    const [key, value] = field;
    data[key] = value;
  }

  // Get user's email and password for sign in
  const email = data.email;
  const password = data.password;

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Create user credential and store user ID
      const user = userCredential.user;
      
      // Log sign-in date in Database
      // 'Update" function wil only add the last_login infor and won't overwrite everuthing else
      let logDate = new Date();
      update(ref(db, "users/" + user.uid + "/accountInfo"), {
        last_login: logDate,
      })
        .then(() => {
          // User signed in successfully
          alert("User signed in successfully!");

          // Get snapshot of all the user info (including the uid) that will be
          // passed to the login function and stored in session or local storage
          get(ref(db, "users/" + user.uid + "/accountInfo"))
            .then((snapshot) => {
              if (snapshot.exists()) {
                console.log(snapshot.val());
                logIn(snapshot.val());  // logI fucntion will keep user logged in
              } else {
                console.log("User does not exist.")
              }
            })
            .catch((error) => {
              console.log(error);
            });
        })
        .catch((error) => {
          // Sign-in failed...
          alert(error)
        });
    })
    .catch((error) => {
      const errorMessage = error.message;
      alert(errorMessage);
    });
}

// ---------------- Keep User Logged In ----------------------------------
function logIn(user) {
  let keepLoggedIn = document.getElementById('keepLoggedInSwitch').ariaChecked;
  
  // Session storage is temporary (only while active session)
  // Info saved as a string (must convert to JS object to string)
  // Session stroage will be cleared with a signOut() function in home.js file
  if (!keepLoggedIn) {
    sessionStorage.setItem("user", JSON.stringify(user));
    location = "home.html";  // Redirect browser to home.html
  } else {
    // Local storage is permanent (keep user logged in if browser is closed)
    // Local storage will be cleared with signOut() function)
    localStorage.setItem("keepLoggedIn", "yes");
    localStorage.setItem("user", JSON.stringify(user));
    location = "home.html";  // Redirect browser to home.html
  }
}
