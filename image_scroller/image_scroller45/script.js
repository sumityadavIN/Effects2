let currentIndex = 1;
let totalSlides = 7;
let isAnimating = false;

const updateActiveSlide = () => {
  document.querySelectorAll(".title").forEach((el, index) => {
    if (index === currentIndex) {
      el.classList.add("active");
    } else {
      el.classList.remove("active");
    }
  });
};

const handleSlider = (direction = 1) => {
  if (isAnimating) return;
  isAnimating = true;

  if (direction === 1) {
    if (currentIndex < totalSlides) {
      currentIndex++;
    } else {
      currentIndex = 1;
    }
  } else {
    if (currentIndex > 1) {
      currentIndex--;
    } else {
      currentIndex = totalSlides;
    }
  }

  gsap.to(".slide-titles", {
    onStart: () => {
      setTimeout(() => {
        updateActiveSlide();
      }, 100);

      const imgIndex = currentIndex + 1 > totalSlides + 1 ? 2 : currentIndex + 1;
      // Need to map currentIndex to imageNumber correctly implies 1-based images.
      // Original logic was updateImages(currentIndex + 1).
      // images seem to range from img1 to img8? or img1 to img7?
      // totalSlides = 7.
      // If index 1 (1st title) -> updateImages(2) -> img2.
      // If index 7 (7th title) -> updateImages(8).
      // Let's assume images loop 1-based matching slides plus offset?
      // Looking at original call: updateImages(2) for initial state (currentIndex=1).
      // So image is always currentIndex + 1. 
      // If currentIndex is 7, we need img8.
      // If currentIndex wraps to 1, we need img2.

      updateImages(currentIndex + 1);
    },
    x: `-${(currentIndex - 1) * 11.1111}%`,
    duration: 2,
    ease: "power4.out",
    onComplete: () => {
      isAnimating = false;
    }
  });
};

const updateImages = (imageNumber) => {
  // Ensure imageNumber wraps correctly if needed, or rely on existing assets.
  // Assuming assets named img1.jpg ... img8.jpg exist.
  // We need to keep the visual logic consistent.
  // If we went back, we might want different animation direction? 
  // For now keeping simpler "next" style animation as per request "similar to previous".

  // Correction: The updateImages function appends images and animates clipPath.
  // It effectively draws the "next" image over. 
  // So regardless of direction, we are showing the "new" current image.

  const imgSrc = `./assets/img${imageNumber}.jpg`;
  const imgTop = document.createElement("img");
  const imgBottom = document.createElement("img");

  imgTop.src = imgSrc;
  imgBottom.src = imgSrc;

  imgTop.style.clipPath = "polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)";
  imgBottom.style.clipPath = "polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)";
  imgTop.style.transform = "scale(2)";
  imgBottom.style.transform = "scale(2)";

  document.querySelector(".img-top").appendChild(imgTop);
  document.querySelector(".img-bottom").appendChild(imgBottom);

  gsap.to([imgTop, imgBottom], {
    clipPath: "polygon(100% 0%, 0% 0%, 0% 100%, 100% 100%)",
    transform: "scale(1)",
    duration: 2,
    ease: "power4.out",
    stagger: 0.15,
    onComplete: trimExcessImages,
  });
};

function trimExcessImages() {
  const selectors = [".img-top", ".img-bottom"];

  selectors.forEach((selector) => {
    const container = document.querySelector(selector);
    const images = Array.from(container.querySelectorAll("img"));
    const excessCount = images.length - 5;

    if (excessCount > 0) {
      images
        .slice(0, excessCount)
        .forEach((image) => container.removeChild(image));
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  document.addEventListener("click", () => handleSlider(1));

  document.addEventListener("wheel", (e) => {
    if (isAnimating) return;
    if (e.deltaY > 0) {
      handleSlider(1);
    } else {
      handleSlider(-1);
    }
  });

  updateImages(2);
  updateActiveSlide();
});
