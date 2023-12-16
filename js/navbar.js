const navbar = document.getElementById("tools-navbar");

// Make navigation bar solid color if page is scrolled
if (navbar) {
  document.addEventListener("scroll", (event) => {
    if (window.scrollY > 0) {
      navbar.style.backgroundColor = "var(--bg-nav)";
    } else {
      navbar.style.backgroundColor = "transparent";
    }
  });
}