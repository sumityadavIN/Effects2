import slides from "./slides.js";
import gsap from "https://cdn.skypack.dev/gsap";
import { ScrollTrigger } from "https://cdn.skypack.dev/gsap/ScrollTrigger";
import Lenis from "https://unpkg.com/lenis@1.0.45/dist/lenis.mjs";

gsap.registerPlugin(ScrollTrigger);

document.addEventListener("DOMContentLoaded", () => {
  const lenis = new Lenis();
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  const slideImages = document.querySelector(".slide-images");
  const titleElement = document.getElementById("title-text");
  const exploreLink = document.querySelector(".slide-link a");

  const totalSlides = slides.length;
  const stripsCount = 25;
  let currentTitleIndex = 0;
  let queuedTitleIndex = null;
  const titleChangeThreshold = 0.5;
  let isAnimating = false;

  // Scroll snap variables
  let isSnapping = false;
  let snapTimeout = null;
  const snapDelay = 200; // ms to wait after scrolling stops before snapping
  let scrollTriggerInstance = null;

  const firstSlideImg = document.querySelector("#img-1 img");
  firstSlideImg.style.transform = "scale(1.25)";

  for (let i = 1; i < totalSlides; i++) {
    const imgContainer = document.createElement("div");
    imgContainer.className = "img-container";
    imgContainer.id = `img-container-${i + 1}`;
    imgContainer.style.opacity = "0";

    for (let j = 0; j < stripsCount; j++) {
      const strip = document.createElement("div");
      strip.className = "strip";

      const img = document.createElement("img");
      img.src = slides[i].image;
      img.alt = slides[i].title;
      img.style.transform = "scale(1.25)";

      const stripPositionFromBottom = stripsCount - j - 1;
      const stripLowerBound =
        (stripPositionFromBottom + 1) * (100 / stripsCount);
      const stripUpperBound = stripPositionFromBottom * (100 / stripsCount);

      strip.style.clipPath = `polygon(0% ${stripLowerBound}%, 100% ${stripLowerBound}%, 100% ${stripUpperBound - 0.1
        }%, 0% ${stripUpperBound - 0.1}%)`;

      strip.appendChild(img);
      imgContainer.appendChild(strip);
    }

    slideImages.appendChild(imgContainer);
  }

  const transitionCount = totalSlides - 1;
  const scrollDistancePerTransition = 1000;
  const initialScrollDelay = 300;
  const finalScrollDelay = 300;

  const totalScrollDistance =
    transitionCount * scrollDistancePerTransition +
    initialScrollDelay +
    finalScrollDelay;

  const transitionRanges = [];
  let currentScrollPosition = initialScrollDelay;

  for (let i = 0; i < transitionCount; i++) {
    const transitionStart = currentScrollPosition;
    const transitionEnd = transitionStart + scrollDistancePerTransition;

    transitionRanges.push({
      transition: i,
      startVh: transitionStart,
      endVh: transitionEnd,
      startPercent: transitionStart / totalScrollDistance,
      endPercent: transitionEnd / totalScrollDistance,
    });

    currentScrollPosition = transitionEnd;
  }

  function calculateImageProgress(scrollProgress) {
    let imageProgress = 0;

    if (scrollProgress < transitionRanges[0].startPercent) {
      return 0;
    }

    if (
      scrollProgress > transitionRanges[transitionRanges.length - 1].endPercent
    ) {
      return transitionRanges.length;
    }

    for (let i = 0; i < transitionRanges.length; i++) {
      const range = transitionRanges[i];

      if (
        scrollProgress >= range.startPercent &&
        scrollProgress <= range.endPercent
      ) {
        const rangeSize = range.endPercent - range.startPercent;
        const normalizedProgress =
          (scrollProgress - range.startPercent) / rangeSize;
        imageProgress = i + normalizedProgress;
        break;
      } else if (scrollProgress > range.endPercent) {
        imageProgress = i + 1;
      }
    }

    return imageProgress;
  }

  function getScaleForImage(imageIndex, currentImageIndex, progress) {
    if (imageIndex > currentImageIndex) return 1.25;
    if (imageIndex < currentImageIndex - 1) return 1;

    let totalProgress =
      imageIndex === currentImageIndex ? progress : 1 + progress;
    return 1.25 - (0.25 * totalProgress) / 2;
  }

  function animateTitleChange(index, direction) {
    if (index === currentTitleIndex) return;

    if (index < 0 || index >= slides.length) return;

    if (isAnimating) {
      queuedTitleIndex = index;
      return;
    }

    isAnimating = true;
    const newTitle = slides[index].title;
    const newUrl = slides[index].url;
    const outY = direction === "down" ? "-120%" : "120%";
    const inY = direction === "down" ? "120%" : "-120%";

    gsap.killTweensOf(titleElement);

    exploreLink.href = newUrl;

    gsap.to(titleElement, {
      y: outY,
      duration: 0.5,
      ease: "power3.out",
      onComplete: () => {
        titleElement.textContent = newTitle;
        gsap.set(titleElement, { y: inY });

        gsap.to(titleElement, {
          y: "0%",
          duration: 0.5,
          ease: "power3.out",
          onComplete: () => {
            currentTitleIndex = index;
            isAnimating = false;

            if (
              queuedTitleIndex !== null &&
              queuedTitleIndex !== currentTitleIndex
            ) {
              const nextIndex = queuedTitleIndex;
              queuedTitleIndex = null;
              animateTitleChange(nextIndex, direction);
            }
          },
        });
      },
    });
  }

  function getTitleIndexForProgress(imageProgress) {
    const imageIndex = Math.floor(imageProgress);
    const imageSpecificProgress = imageProgress - imageIndex;

    if (imageSpecificProgress >= titleChangeThreshold) {
      return Math.min(imageIndex + 1, slides.length - 1);
    } else {
      return imageIndex;
    }
  }

  let lastImageProgress = 0;

  // Convert image index to scroll position (pixels from document top)
  function getScrollPositionForImageIndex(imageIndex) {
    const scrollRange = scrollTriggerInstance.end - scrollTriggerInstance.start;

    if (imageIndex <= 0) {
      // First image - scroll to before first transition (start area)
      return scrollTriggerInstance.start;
    }

    if (imageIndex >= totalSlides - 1) {
      // Last image - scroll to after last transition (end area)
      return scrollTriggerInstance.end;
    }

    // For images in between (1 to totalSlides-2):
    // Image N is fully visible after transition N-1 completes
    // So we need to scroll to the END of transition (imageIndex - 1)
    const range = transitionRanges[imageIndex - 1];
    // Add a small offset past the end to ensure we're fully in the completed state
    const targetPercent = range.endPercent + 0.001;
    return scrollTriggerInstance.start + (targetPercent * scrollRange);
  }

  // Snap to nearest complete image position
  function snapToNearestImage(imageProgress) {
    if (isSnapping || !scrollTriggerInstance) return;

    const fractionalPart = imageProgress % 1;

    // Only snap if we're mid-transition (not already at a complete image)
    // Use a small threshold to avoid snapping when already at rest
    if (fractionalPart < 0.02 || fractionalPart > 0.98) return;

    // Determine which image to snap to based on progress
    const nearestImageIndex = Math.round(imageProgress);
    const clampedIndex = Math.max(0, Math.min(nearestImageIndex, totalSlides - 1));

    isSnapping = true;
    const targetScroll = getScrollPositionForImageIndex(clampedIndex);

    lenis.scrollTo(targetScroll, {
      duration: 0.6,
      easing: (t) => 1 - Math.pow(1 - t, 3), // easeOutCubic
      onComplete: () => {
        setTimeout(() => {
          isSnapping = false;
        }, 100);
      }
    });
  }

  // Debounced snap function - called when user stops scrolling
  function scheduleSnap(imageProgress) {
    if (snapTimeout) {
      clearTimeout(snapTimeout);
    }
    snapTimeout = setTimeout(() => {
      snapToNearestImage(imageProgress);
    }, snapDelay);
  }

  scrollTriggerInstance = ScrollTrigger.create({
    trigger: ".sticky-slider",
    start: "top top",
    end: `+=${totalScrollDistance}vh`,
    pin: true,
    pinSpacing: true,
    scrub: 1,
    invalidateOnRefresh: true,

    onUpdate: (self) => {
      const imageProgress = calculateImageProgress(self.progress);

      if (typeof imageProgress === "number") {
        const scrollDirection =
          imageProgress > lastImageProgress ? "down" : "up";
        const currentImageIndex = Math.floor(imageProgress);
        const imageSpecificProgress = imageProgress - currentImageIndex;

        const correctTitleIndex = getTitleIndexForProgress(imageProgress);

        if (correctTitleIndex !== currentTitleIndex) {
          queuedTitleIndex = correctTitleIndex;
          if (!isAnimating) {
            animateTitleChange(correctTitleIndex, scrollDirection);
          }
        }

        const firstSlideImgScale = getScaleForImage(
          0,
          currentImageIndex,
          imageSpecificProgress
        );
        firstSlideImg.style.transform = `scale(${firstSlideImgScale})`;

        for (let i = 1; i < totalSlides; i++) {
          const imgIndex = i + 1;
          const transitionIndex = imgIndex - 2;

          const imgContainer = document.getElementById(
            `img-container-${imgIndex}`
          );
          if (!imgContainer) continue;

          imgContainer.style.opacity = "1";

          const strips = imgContainer.querySelectorAll(".strip");
          const images = imgContainer.querySelectorAll("img");

          if (transitionIndex < currentImageIndex) {
            strips.forEach((strip, stripIndex) => {
              const stripPositionFromBottom = stripsCount - stripIndex - 1;
              const stripUpperBound =
                stripPositionFromBottom * (100 / stripsCount);
              const stripLowerBound =
                (stripPositionFromBottom + 1) * (100 / stripsCount);
              strip.style.clipPath = `polygon(0% ${stripLowerBound}%, 100% ${stripLowerBound}%, 100% ${stripUpperBound - 0.1
                }%, 0% ${stripUpperBound - 0.1}%)`;
            });
          } else if (transitionIndex === currentImageIndex) {
            strips.forEach((strip, stripIndex) => {
              const stripPositionFromBottom = stripsCount - stripIndex - 1;
              const stripUpperBound =
                stripPositionFromBottom * (100 / stripsCount);
              const stripLowerBound =
                (stripPositionFromBottom + 1) * (100 / stripsCount);
              const stripDelay = (stripIndex / stripsCount) * 0.5;
              const adjustedProgress = Math.max(
                0,
                Math.min(1, (imageSpecificProgress - stripDelay) * 2)
              );
              const currentstripUpperBound =
                stripLowerBound -
                (stripLowerBound - (stripUpperBound - 0.1)) * adjustedProgress;
              strip.style.clipPath = `polygon(0% ${stripLowerBound}%, 100% ${stripLowerBound}%, 100% ${currentstripUpperBound}%, 0% ${currentstripUpperBound}%)`;
            });
          } else {
            strips.forEach((strip, stripIndex) => {
              const stripPositionFromBottom = stripsCount - stripIndex - 1;
              const stripLowerBound =
                (stripPositionFromBottom + 1) * (100 / stripsCount);
              strip.style.clipPath = `polygon(0% ${stripLowerBound}%, 100% ${stripLowerBound}%, 100% ${stripLowerBound}%, 0% ${stripLowerBound}%)`;
            });
          }

          const imgScale = getScaleForImage(
            transitionIndex,
            currentImageIndex,
            imageSpecificProgress
          );
          images.forEach((img) => {
            img.style.transform = `scale(${imgScale})`;
          });
        }

        lastImageProgress = imageProgress;

        // Schedule snap when user stops scrolling
        if (!isSnapping) {
          scheduleSnap(imageProgress);
        }
      }
    },
  });
});
