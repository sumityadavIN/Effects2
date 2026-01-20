import { titles } from "./data.js";
import gsap from "https://cdn.skypack.dev/gsap";
import CustomEase from "https://cdn.skypack.dev/gsap/CustomEase";

document.addEventListener("DOMContentLoaded", function () {
  gsap.registerPlugin(CustomEase);
  CustomEase.create(
    "hop",
    "M0,0 C0.071,0.505 0.192,0.726 0.318,0.852 0.45,0.984 0.504,1 1,1"
  );

  const sliderNav = document.querySelector(".slider-nav");
  const slidesContainer = document.querySelector(".slides");
  const bgOverlay = document.querySelector(".bg-overlay");
  const slideTitle = document.querySelector(".slide-title");
  const numberOfItems = 30;
  let currentIndex = 0;
  let isAnimating = false;

  function getRandomColor() {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  function updateTitle(newIndex, color) {
    const title = titles[newIndex];
    const titleRows = slideTitle.querySelectorAll(".slide-title-row");

    titleRows.forEach((row, rowIndex) => {
      row.querySelectorAll(".letter").forEach((letter, letterIndex) => {
        const existingSpan = letter.querySelector("span");
        if (existingSpan) {
          letter.removeChild(existingSpan);
        }

        const newSpan = document.createElement("span");
        const direction = newIndex > currentIndex ? 150 : -150;
        gsap.set(newSpan, {
          x: direction,
          color: color,
          filter: "brightness(0.75)",
        });
        newSpan.textContent = title[rowIndex][letterIndex] || "";
        letter.appendChild(newSpan);
        gsap.to(newSpan, {
          x: 0,
          duration: 1,
          ease: "power2.out",
          delay: 0.125,
        });
      });
    });
  }

  function gotoSlide(index) {
    if (index === currentIndex || isAnimating) return;
    isAnimating = true;

    // Update Nav
    document.querySelectorAll(".nav-item-wrapper").forEach((nav) => nav.classList.remove("active"));
    document.querySelectorAll(".nav-item-wrapper")[index]?.classList.add("active"); // Use optional chaining in case index OOB

    const translateXValue = -index * 100;
    gsap.to(slidesContainer, {
      x: `${translateXValue}vw`,
      duration: 1.5,
      ease: "hop",
      onComplete: () => { isAnimating = false; }
    });

    const newColor = getRandomColor();
    gsap.to(bgOverlay, {
      backgroundColor: newColor,
      duration: 1.5,
      ease: "hop",
    });

    updateTitle(index, newColor);
    currentIndex = index;
  }

  for (let i = 0; i < numberOfItems; i++) {
    const navItemWrapper = document.createElement("div");
    navItemWrapper.classList.add("nav-item-wrapper");
    if (i === 0) {
      navItemWrapper.classList.add("active");
    }

    const navItem = document.createElement("div");
    navItem.classList.add("nav-item");

    navItemWrapper.appendChild(navItem);
    sliderNav.appendChild(navItemWrapper);

    navItemWrapper.addEventListener("click", () => {
      gotoSlide(i);
    });

    const slide = document.createElement("div");
    slide.classList.add("slide");
    if (i === 0) {
      slide.classList.add("active");
    }

    const imgWrapper = document.createElement("div");
    imgWrapper.classList.add("img");

    const img = document.createElement("img");
    img.src = `./assets/img${i + 1}.jpg`;
    img.alt = "";

    imgWrapper.appendChild(img);
    slide.appendChild(imgWrapper);
    slidesContainer.appendChild(slide);
  }

  // Scroll Interaction
  document.addEventListener("wheel", (e) => {
    if (isAnimating) return;
    if (e.deltaY > 0) {
      if (currentIndex < numberOfItems - 1) {
        gotoSlide(currentIndex + 1);
      }
    } else {
      if (currentIndex > 0) {
        gotoSlide(currentIndex - 1);
      }
    }
  });

  updateTitle(0, getComputedStyle(bgOverlay).backgroundColor);
});
