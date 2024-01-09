// ----------------- Firebase Setup & Initialization ------------------------//
// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getDatabase, ref, set, update, child, get, remove } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

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






// -------------------------Update data in database --------------------------
function updateData(userID, year, month, day, hours) {
  // Must use brackets around variable name to use it as a key
  update(ref(db, "users/" + userID + "/data/" + year + "/" + month + "/"), {
    [day]: hours
  })
    .then(() => {
      alert("Data updated successfully.");
    })
    .catch((error) => {
      alert("There was an error. Error: " + error)
    });
}

// -------------------------Delete a day's data from FRD ---------------------
function deleteData(userID, year, month, day) {
  remove(ref(db, `users/${userID}/data/${year}/${month}/${day}`))
    .then(() =>{
      alert('Data removed successfully.')
    })
    .catch((error) => {
      alert('Unsuccessful, error: ' + error)
    })
}

// ----------------------Get a datum from FRD (single data point)---------------
function getData(userID, year, month, day) {
  let output = document.getElementById('single-output');
  let date = document.getElementById('single-date');
  let result = document.getElementById('single-result');

  const dbref = ref(db);  // Firebase parameter for getting data

  // Provide the paht through the nodes to the data
  get(child(dbref, `users/${userID}/data/${year}/${month}`))
    .then((snapshot) => {
      if (snapshot.exists() && snapshot.val()[day]) {
        // to get specific value from a key: snapshot.val()[key]
        output.style.setProperty("display", "block", "important");
        date.textContent = `${month + 1}/${day}/${year}`;
        result.textContent = snapshot.val()[day] + " hours";
      } else {
        alert("No data found.");
      }
    })
    .catch((error) => {
      alert("Unsuccessful, error: " + error);
    })
}

// ---------------------------Get a month's data set --------------------------
// Must be an async function because you need to get all the data from FRD
// before you can process it for a table or graph
async function getDataSet(userID, year, month) {
  const days = [];
  const hours = [];

  const dbref = ref(db);  // Firebase parameter for requesting data
  
  // Wait for all data to be pulled from FRD
  // Must provide the path through the nodes tow the data
  await get(child(dbref, `users/${userID}/data/${year}/${month}`))
    .then((snapshot) => {
      if (snapshot.exists()) {
        snapshot.forEach(child => {
          // Push values to corresponding arrays
          days.push(parseInt(child.key));
          hours.push(parseFloat(child.val()));
        })
      } else {
        alert("No data found.");
        return;
      }
    })
    .catch((error) => {
      alert("Unsuccessful, error: " + error);
    });
  
  return [days, hours];
}








//----------------------- Create chart for study hours ------------------------------//
let monthNames = ["January","February","March","April","May","June","July",
"August","September","October","November","December"];

function fillInData(x, y) {
  let newX = [];
  let newY = [];
  for (let i = 0; i < 31; i++) {
    newX[i] = i + 1;
    const index = x.indexOf(i + 1);
    newY[i] = index !== -1 ? y[index] : 0;
  }
  return [newX, newY];
}

// Creating the chart
function createHoursChart(year, month, x, y) {
  let [newX, newY] = fillInData(x, y);

  const studyCtx = document.getElementById("study-hours");

  const studyChart = new Chart(studyCtx, {
    type: "bar",
    data: {
      labels: newX,
      datasets: [
        {
          data: newY,
          fill: false,
          backgroundColor: "rgba(0, 100, 255, 0.5)",
          borderColor: "rgba(0, 100, 255, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true, // Re-size based on screen size
      maintainAspectRatio: false,
      scales: {
        // Display options for x and y axes
        x: {
          title: {
            display: true,
            text: "Day", // x-axis title
            font: {
              size: 20,
            },
          },
          ticks: {
            font: {
              size: 16,
            },
          },
        },
        y: {
          title: {
            display: true,
            text: "Hours Studied",
            font: {
              size: 20,
            },
          },
          ticks: {
            font: {
              size: 12,
            },
            maxTicksLimit: 20 // limit # of ticksg
          },
          min: 0,
          max: 12
        },
      },
      plugins: {
        // Display options
        title: {
          display: true,
          text: `Hours Studied For Each Day in ${monthNames[month]} ${year}`,
          font: {
            size: 24,
          },
          padding: {
            top: 10,
            bottom: 30,
          },
        },
        legend: {
          display: false
        },
      },
    },
  });

  return studyChart;
}

function updateChart(chart, year, month, x, y) {
  let [newX, newY] = fillInData(x, y);

  chart.options.plugins.title.text = `Hours Studied For Each Day in ${monthNames[month]} ${year}`;
  chart.data.labels = newX;
  chart.data.datasets[0].data = newY;
  chart.update();
}

// --------------------------- Home Page Loading -----------------------------
window.onload = async function() {

  // ------------------------- Set Welcome Message -------------------------
  const loginLink = document.getElementById("login-link");
  const signupLink = document.getElementById("signup-link");
  
  getUser();

  if (currentUser != null) {

    // Display name and logout button in the navbar  
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


    // Welcome message in Hero
    document.getElementById("welcome").textContent = `Welcome back ${currentUser.firstname}!`;


    // Get rid of elements that are only shown when user is logged out
    let loggedOutElems = document.getElementsByClassName("logged-out");
    for (let i = 0; i < loggedOutElems.length; i++) {
      loggedOutElems[i].style.setProperty("display", "none", "important")
    }


    // Display elements that are shown when user is logged in
    let loggedInElems = document.getElementsByClassName("logged-in");
    for (let i = 0; i < loggedInElems.length; i++) {
      loggedInElems[i].style.setProperty("display", "block");
    }

    // Plans
    const basicBtn = document.getElementById("basic");
    const proBtn = document.getElementById("pro");
    let plan = await getPlan(currentUser.uid);

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





    let today = new Date();
    const [days, hours] = await getDataSet(currentUser.uid, today.getFullYear(), today.getMonth());
    let studyChart = createHoursChart(today.getFullYear(), today.getMonth(), days, hours);    

    document.getElementById("set-data").onclick = function() {
      const userID = currentUser.uid;
      const year = parseInt(document.getElementById("set-year").value);
      const month = parseInt(document.getElementById("set-month").value);
      const day = parseInt(document.getElementById("set-day").value);
      const hours = parseFloat(document.getElementById("set-hours").value);
      updateData(userID, year, month, day, hours);
    }

    document.getElementById("del-data").onclick = function() {
      const userID = currentUser.uid;
      const year = parseInt(document.getElementById("del-year").value);
      const month = parseInt(document.getElementById("del-month").value);
      const day = parseInt(document.getElementById("del-day").value);
      deleteData(userID, year, month, day);
    }

    document.getElementById("single-get").onclick = function() {
      const userID = currentUser.uid;
      const year = parseInt(document.getElementById("year").value);
      const month = parseInt(document.getElementById("month").value);
      const day = parseInt(document.getElementById("day").value);
      getData(userID, year, month, day);
    }

    document.getElementById("ds-get").onclick = async function() {
      const userID = currentUser.uid;
      const year = parseInt(document.getElementById("ds-year").value);
      const month = parseInt(document.getElementById("ds-month").value);
      const [days, hours] = await getDataSet(userID, year, month);
      updateChart(studyChart, year, month, days, hours);
    }

  }
}