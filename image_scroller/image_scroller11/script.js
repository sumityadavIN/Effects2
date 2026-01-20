document.addEventListener("DOMContentLoaded", function () {
  const sliderContent = [
    "Echoes",
    "Ethereal",
    "Neon Void",
    "Mystics",
    "Horizons",
    "Dystopian",
  ];
  const slider = document.querySelector(".slider");
  let activeSlide = 0;
  let isAnimating = false;

  function animateSlide(direction = 1) {
    if (isAnimating) return;
    isAnimating = true;

    const currentSlide = slider.querySelector(".slide:not(.exiting)");
    const slideTheme = activeSlide % 2 ? "dark" : "light";

    // Update active slide index based on direction
    if (direction === 1) {
      activeSlide = (activeSlide + 1) % sliderContent.length;
    } else {
      activeSlide = (activeSlide - 1 + sliderContent.length) % sliderContent.length;
    }

    if (currentSlide) {
      const existingImgs = currentSlide.querySelectorAll("img");
      // Animate out existing images
      gsap.to(existingImgs, {
        top: direction === 1 ? "0%" : "100%", // Move up if next, move down if prev (relative to container)
        // Actually existing images are at 50%. 
        // If next: move to 0% (up). 
        // If prev: move to 100% (down)? 
        // Let's stick to current logic for next: top 0%.
        duration: 1.5,
        ease: "power4.inOut",
      });
      currentSlide.classList.add("exiting");
    }

    const newSlide = document.createElement("div");
    newSlide.classList.add("slide");
    newSlide.classList.add(slideTheme);

    // Clip path direction
    // If Next: standard bottom-up reveal
    // If Prev: top-down reveal?
    const initialClip = direction === 1
      ? "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)" // Bottom
      : "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)"; // Top

    const finalClip = "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)"; // Full

    newSlide.style.clipPath = initialClip;

    const newSlideImg1 = document.createElement("div");
    newSlideImg1.className = "slide-img slide-img-1";
    const img1 = document.createElement("img");
    img1.src = `./assets/slider-${activeSlide + 1}-1.jpg`;
    // Image start position
    img1.style.top = direction === 1 ? "100%" : "-100%";
    newSlideImg1.appendChild(img1);
    newSlide.appendChild(newSlideImg1);

    const newSlideContent = document.createElement("div");
    newSlideContent.classList.add("slide-content");
    newSlideContent.innerHTML = `<h1 style="scale: 1.5">${sliderContent[activeSlide]}</h1>`;
    newSlide.appendChild(newSlideContent);

    const newSlideImg2 = document.createElement("div");
    newSlideImg2.className = "slide-img slide-img-2";
    const img2 = document.createElement("img");
    img2.src = `./assets/slider-${activeSlide + 1}-2.jpg`;
    img2.style.top = direction === 1 ? "100%" : "-100%";
    newSlideImg2.appendChild(img2);
    newSlide.appendChild(newSlideImg2);

    slider.appendChild(newSlide);

    gsap.to(newSlide, {
      clipPath: finalClip,
      duration: 1.5,
      ease: "power4.inOut",
      onStart: () => {
        gsap.to([img1, img2], {
          top: "50%",
          duration: 1.5,
          ease: "power4.inOut",
        });
      },
      onComplete: () => {
        removeExtraSlides(slider);
        isAnimating = false;
      },
    });

    gsap.to(".slide-content h1", {
      scale: 1,
      duration: 1.5,
      ease: "power4.inOut",
    });
  }

  document.addEventListener("click", function () {
    animateSlide(1);
  });

  document.addEventListener("wheel", (e) => {
    if (isAnimating) return;
    if (e.deltaY > 0) {
      animateSlide(1);
    } else {
      animateSlide(-1);
    }
  });

  function removeExtraSlides(container) {
    while (container.children.length > 5) {
      container.removeChild(container.firstChild);
    }
  }
});