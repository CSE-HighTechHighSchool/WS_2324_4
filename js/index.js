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

// ----------------------------- Get plan --------------------------
// Return the user's plan ("basic" or "pro")
async function getPlan(userID) {
  let plan = null;

  // Provide the path through the nodes to the data
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

// ----------------------------- Update plan --------------------------
// Updates plan and return success status (true = success, false = failure)
function updatePlan(userID, plan) {
  // Must use brackets around variable name to use it as a key
  update(ref(db, "users/" + userID + "/accountInfo/"), { plan })
    .then(() => {
      customAlert(`Plan successfully updated to ${plan}.`);
      return true;
    })
    .catch((error) => {
      customAlert("There was an error. Error: " + error);
      return false;
    });
}

// Make a plan button say "Current Plan"
function makeCurrent(elem) {
  elem.textContent = "Current Plan";
  elem.className = "text-light opacity-50 text-center fst-italic";
  elem.style.pointerEvents = "none";
}

// -------------------------Update data in database --------------------------
function updateData(userID, year, month, day, hours) {
  // Must use brackets around variable name to use it as a key
  update(ref(db, "users/" + userID + "/data/" + year + "/" + month + "/"), {
    [day]: hours
  })
    .then(() => {
      customAlert("Data updated successfully.");
    })
    .catch((error) => {
      customAlert("There was an error. Error: " + error)
    });
}

// -------------------------Delete a day's data from FRD ---------------------
function deleteData(userID, year, month, day) {
  remove(ref(db, `users/${userID}/data/${year}/${month}/${day}`))
    .then(() =>{
      customAlert('Data removed successfully.')
    })
    .catch((error) => {
      customAlert('Unsuccessful, error: ' + error)
    })
}

// ----------------------Get a datum from FRD (single data point)---------------
function getData(userID, year, month, day) {
  let output = document.getElementById('single-output');
  let date = document.getElementById('single-date');
  let result = document.getElementById('single-result');

  const dbref = ref(db);  // Firebase parameter for getting data

  // Provide the path through the nodes to the data
  get(child(dbref, `users/${userID}/data/${year}/${month}`))
    .then((snapshot) => {
      if (snapshot.exists() && snapshot.val()[day]) {
        // to get specific value from a key: snapshot.val()[key]
        output.style.setProperty("display", "block", "important");
        date.textContent = `${month + 1}/${day}/${year}`;
        result.textContent = snapshot.val()[day] + " hours";
      } else {
        customAlert("No data found.");
      }
    })
    .catch((error) => {
      customAlert("Unsuccessful, error: " + error);
    })
}

// ---------------------------Get a month's data set --------------------------
// Must be an async function because you need to get all the data from FRD
// before you can process it for a table or graph
async function getDataSet(userID, year, month, showAlert = true) {
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
        if (showAlert) {
          customAlert("No data found.");
        }
        return;
      }
    })
    .catch((error) => {
      if (showAlert) {
        customAlert("Unsuccessful, error: " + error);
      }
    });
  
  return [days, hours];
}

//----------------------- Create chart for study hours ------------------------------//
// Set default font family and color for chart
Chart.defaults.font.family = 'DM Sans';
Chart.defaults.color = '#212529';

let monthNames = ["January","February","March","April","May","June","July",
"August","September","October","November","December"];

// Fill in days and hours data so it can be displayed in chart
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
            maxTicksLimit: 20 // limit # of ticks
          },
          min: 0,
          max: 12
        },
      },
      plugins: {
        // Display options
        title: {
          display: true,
          text: `Daily Hours Studied in ${monthNames[month]} ${year}`,
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

// Update chart to reflect edits to the data
function updateChart(chart, year, month, x, y) {
  let [newX, newY] = fillInData(x, y);

  chart.options.plugins.title.text = `Daily Hours Studied in ${monthNames[month]} ${year}`;
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
  // Get elements that are only shown when user is logged in/out
  let loggedInElems = document.getElementsByClassName("logged-in");
  let loggedOutElems = document.getElementsByClassName("logged-out");
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
    document.getElementById("welcome").textContent = `Welcome back, ${currentUser.firstname}!`;


    // Get rid of elements that are only shown when user is logged out
    for (let i = 0; i < loggedOutElems.length; i++) {
      loggedOutElems[i].style.setProperty("display", "none", "important")
    }


    // Display elements that are shown when user is logged in
    for (let i = 0; i < loggedInElems.length; i++) {
      loggedInElems[i].style.setProperty("display", "block", "important");
    }

    // Get button elements for setting plans
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

    // Get variables so that chart by default displays current month and year upon page load
    let today = new Date();
    let currentMonth = today.getMonth();
    let currentYear = today.getFullYear();

    // showAlert set to false to avoid alerts upon page load if user has no data for current month
    const [days, hours] = await getDataSet(currentUser.uid, currentYear, currentMonth, false);
    let studyChart = createHoursChart(currentYear, currentMonth, days, hours);    

    // Get, update, delete hours studied data in FRD
    // Update data function call
    document.getElementById("set-data").onclick = async function() {
      const userID = currentUser.uid;
      const year = parseInt(document.getElementById("set-year").value);
      const month = parseInt(document.getElementById("set-month").value);
      const day = parseInt(document.getElementById("set-day").value);
      const hours = parseFloat(document.getElementById("set-hours").value);
      if(!isNaN(year) && !isNaN(month) && !isNaN(day) && !isNaN(hours))
      {
        updateData(userID, year, month, day, hours);
        const [daysChart, hoursChart] = await getDataSet(userID, currentYear, currentMonth, false);
        updateChart(studyChart, currentYear, currentMonth, daysChart, hoursChart);
      }
      else{
        customAlert("Please enter all fields"); 
      }
    }

    // Delete a single day's data function call
    document.getElementById("del-data").onclick = async function() {
      const userID = currentUser.uid;
      const year = parseInt(document.getElementById("del-year").value);
      const month = parseInt(document.getElementById("del-month").value);
      const day = parseInt(document.getElementById("del-day").value);
      if(!isNaN(year) && !isNaN(month) && !isNaN(day))
      {
        deleteData(userID, year, month, day);
        const [daysChart, hoursChart] = await getDataSet(userID, currentYear, currentMonth, false);
        updateChart(studyChart, currentYear, currentMonth, daysChart, hoursChart);
      }
      else{
        customAlert("Please enter all fields");
      }
    }

    // Get a datum function call
    document.getElementById("single-get").onclick = function() {
      const userID = currentUser.uid;
      const year = parseInt(document.getElementById("year").value);
      const month = parseInt(document.getElementById("month").value);
      const day = parseInt(document.getElementById("day").value);
      if(!isNaN(year) && !isNaN(month) && !isNaN(day))
      {
        getData(userID, year, month, day);
      }
      else{
        customAlert("Please enter all fields");
      }
    }

    // Get a data set function call
    document.getElementById("ds-get").onclick = async function() {
      const userID = currentUser.uid;
      const year = parseInt(document.getElementById("ds-year").value);
      const month = parseInt(document.getElementById("ds-month").value);
      if(!isNaN(year) && !isNaN(month))
      {
        const [days, hours] = await getDataSet(userID, year, month);
        updateChart(studyChart, year, month, days, hours);
        currentMonth = month;
        currentYear = year;
      }
      else{
        customAlert("Please enter all fields");
      }
    }

  }

  // If viewing homepage while logged out
  else {
    // Display elements that are shown when user is logged out
    for (let i = 0; i < loggedOutElems.length; i++) {
      loggedOutElems[i].style.setProperty("display", "block", "important")
    }

    // Hide elements that are shown when user is logged in
    for (let i = 0; i < loggedInElems.length; i++) {
      loggedInElems[i].style.setProperty("display", "none", "important");
    }
  }
}