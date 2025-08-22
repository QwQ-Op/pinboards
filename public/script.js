const gallery = document.getElementById("gallery");
const slideshowOverlay = document.getElementById("slideshow-overlay");
const slideshowImg = document.getElementById("slideshow-img");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");
const closeSlideBtn = document.getElementById("close-slide-btn");

let galleryData = [];
let currentIndex = 0;

const JSON1_URL = "/api/json1";
const JSON2_URL = "/api/json2";

// ---- Password Gate ----
async function checkPassword() {
  const pw = document.getElementById("password-input").value;
  const res = await fetch("/api/checkPassword", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: pw })
  });
  const data = await res.json();

  if (data.success) {
    localStorage.setItem("auth", "true");
    document.getElementById("lock-screen").style.display = "none";
    document.getElementById("app").style.display = "block";
  } else {
    document.getElementById("error-msg").style.display = "block";
  }
}
document.getElementById("login-btn").addEventListener("click", checkPassword);
if (localStorage.getItem("auth") === "true") {
  document.getElementById("lock-screen").style.display = "none";
  document.getElementById("app").style.display = "block";
}

// ---- Load Gallery ----
async function loadGallery(url) {
  gallery.innerHTML = "";
  const res = await fetch(url);
  const data = await res.json();
  galleryData = data;

  data.forEach((item, index) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img src="${item.cover}" alt="${item.model}">
      <div class="info">
        <div>${item.model}</div>
        <a href="${item.photoset}" target="_blank">View Set</a>
      </div>
    `;
    card.querySelector("img").addEventListener("click", () => openSlideshow(index));
    gallery.appendChild(card);
  });
}

document.getElementById("json1-btn").addEventListener("click", () => loadGallery(JSON1_URL));
document.getElementById("json2-btn").addEventListener("click", () => loadGallery(JSON2_URL));

// ---- Slideshow ----
function openSlideshow(idx) {
  currentIndex = idx;
  slideshowImg.src = galleryData[currentIndex].cover;
  slideshowOverlay.style.display = "flex";
}

prevBtn.addEventListener("click", () => {
  currentIndex = (currentIndex - 1 + galleryData.length) % galleryData.length;
  slideshowImg.src = galleryData[currentIndex].cover;
});
nextBtn.addEventListener("click", () => {
  currentIndex = (currentIndex + 1) % galleryData.length;
  slideshowImg.src = galleryData[currentIndex].cover;
});
closeSlideBtn.addEventListener("click", () => {
  slideshowOverlay.style.display = "none";
});

// ---- Tap Navigation ----
slideshowOverlay.addEventListener("click", (e) => {
  if (e.target === prevBtn || e.target === nextBtn || e.target === closeSlideBtn) return;
  const rect = slideshowOverlay.getBoundingClientRect();
  if (e.clientX < rect.width / 2) {
    prevBtn.click();
  } else {
    nextBtn.click();
  }
});

// ---- Zoom + Pan ----
let isZoomed = false, startX = 0, startY = 0, currentX = 0, currentY = 0;
slideshowImg.style.transition = "transform 0.2s ease";

slideshowImg.addEventListener("dblclick", () => {
  if (!isZoomed) {
    slideshowImg.style.transform = "scale(2)";
    isZoomed = true;
  } else {
    slideshowImg.style.transform = "scale(1) translate(0, 0)";
    isZoomed = false;
    currentX = currentY = 0;
  }
});

slideshowImg.addEventListener("mousedown", (e) => {
  if (!isZoomed) return;
  startX = e.clientX - currentX;
  startY = e.clientY - currentY;
  function onMove(ev) {
    currentX = ev.clientX - startX;
    currentY = ev.clientY - startY;
    slideshowImg.style.transform = `scale(2) translate(${currentX / 2}px, ${currentY / 2}px)`;
  }
  function onUp() {
    document.removeEventListener("mousemove", onMove);
    document.removeEventListener("mouseup", onUp);
  }
  document.addEventListener("mousemove", onMove);
  document.addEventListener("mouseup", onUp);
});

slideshowImg.addEventListener("touchstart", (e) => {
  if (!isZoomed) return;
  const touch = e.touches[0];
  startX = touch.clientX - currentX;
  startY = touch.clientY - currentY;
  function onMove(ev) {
    const t = ev.touches[0];
    currentX = t.clientX - startX;
    currentY = t.clientY - startY;
    slideshowImg.style.transform = `scale(2) translate(${currentX / 2}px, ${currentY / 2}px)`;
  }
  function onEnd() {
    document.removeEventListener("touchmove", onMove);
    document.removeEventListener("touchend", onEnd);
  }
  document.addEventListener("touchmove", onMove);
  document.addEventListener("touchend", onEnd);
});
