// Elements
const gallery = document.getElementById("gallery");
const slideshowOverlay = document.getElementById("slideshow-overlay");
const slideshowImg = document.getElementById("slideshow-img");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");
const closeSlideBtn = document.getElementById("close-slide-btn");

let galleryData = [];
let currentIndex = 0;

// Endpoints (proxied via Vercel API so gist URLs stay hidden)
const JSON1_URL = "/api/json1";
const JSON2_URL = "/api/json2";

/* ---------------- Password Gate ---------------- */
async function checkPassword() {
  const pw = document.getElementById("password-input").value.trim();
  const r = await fetch("/api/checkPassword", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: pw })
  });
  const data = await r.json();
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

/* ---------------- Load & Render ---------------- */
async function loadGallery(url) {
  gallery.innerHTML = "";
  try {
    const r = await fetch(url);
    const data = await r.json();
    galleryData = data;
    renderGallery();
  } catch (e) {
    gallery.innerHTML = "<p style='padding:16px;'>Failed to load JSON.</p>";
    console.error(e);
  }
}

function renderGallery() {
  gallery.innerHTML = "";
  galleryData.forEach((item, index) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img loading="lazy" src="${item.cover}" alt="${item.model}">
      <div class="info">
        <div>${item.model || ""}</div>
        ${item.photoset ? `<a href="${item.photoset}" target="_blank" rel="noopener">View</a>` : ""}
      </div>
    `;
    card.querySelector("img").addEventListener("click", () => openSlideshow(index));
    gallery.appendChild(card);
  });
}

document.getElementById("json1-btn").addEventListener("click", () => loadGallery(JSON1_URL));
document.getElementById("json2-btn").addEventListener("click", () => loadGallery(JSON2_URL));

/* ---------------- Slideshow ---------------- */
function openSlideshow(idx) {
  currentIndex = idx;
  updateSlide();
  slideshowOverlay.style.display = "flex";
}

function updateSlide() {
  slideshowImg.src = galleryData[currentIndex].cover;
}

prevBtn.addEventListener("click", () => {
  currentIndex = (currentIndex - 1 + galleryData.length) % galleryData.length;
  updateSlide();
});
nextBtn.addEventListener("click", () => {
  currentIndex = (currentIndex + 1) % galleryData.length;
  updateSlide();
});
closeSlideBtn.addEventListener("click", () => {
  slideshowOverlay.style.display = "none";
});

// ✅ Tap left/right on background to navigate
slideshowOverlay.addEventListener("click", (e) => {
  if (e.target === slideshowImg || e.target.closest("button")) return;
  const rect = slideshowOverlay.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  if (clickX < rect.width / 2) {
    prevBtn.click();
  } else {
    nextBtn.click();
  }
});

/* ---------------- Zoom + Pan ---------------- */
let isZoomed = false;
let startX = 0, startY = 0;
let currentX = 0, currentY = 0;

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

// ✅ Pan drag (mouse)
slideshowImg.addEventListener("mousedown", (e) => {
  if (!isZoomed) return;
  startX = e.clientX - currentX;
  startY = e.clientY - currentY;

  const onMouseMove = (ev) => {
    currentX = ev.clientX - startX;
    currentY = ev.clientY - startY;
    slideshowImg.style.transform = `scale(2) translate(${currentX / 2}px, ${currentY / 2}px)`;
  };

  const onMouseUp = () => {
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onMouseUp);
  };

  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("mouseup", onMouseUp);
});

// ✅ Pan drag (touch)
slideshowImg.addEventListener("touchstart", (e) => {
  if (!isZoomed) return;
  const touch = e.touches[0];
  startX = touch.clientX - currentX;
  startY = touch.clientY - currentY;

  const onTouchMove = (ev) => {
    const t = ev.touches[0];
    currentX = t.clientX - startX;
    currentY = t.clientY - startY;
    slideshowImg.style.transform = `scale(2) translate(${currentX / 2}px, ${currentY / 2}px)`;
  };

  const onTouchEnd = () => {
    window.removeEventListener("touchmove", onTouchMove);
    window.removeEventListener("touchend", onTouchEnd);
  };

  window.addEventListener("touchmove", onTouchMove);
  window.addEventListener("touchend", onTouchEnd);
});
