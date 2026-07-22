export function initLightbox() {
  const lightbox = document.getElementById("lightbox");
  const lbImg = document.getElementById("lbImg");
  const closeBtn = lightbox.querySelector(".close-lb");

  lightbox.addEventListener("click", (e) => {
    if (e.target !== lbImg) lightbox.style.display = "none";
  });

  closeBtn.addEventListener("click", () => {
    lightbox.style.display = "none";
  });
}

export function openLightbox(src) {
  const lightbox = document.getElementById("lightbox");
  const lbImg = document.getElementById("lbImg");
  lbImg.src = src;
  lightbox.style.display = "flex";
}
