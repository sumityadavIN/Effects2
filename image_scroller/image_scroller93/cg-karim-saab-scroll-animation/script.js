import gsap from "https://cdn.skypack.dev/gsap";
import { ScrollTrigger } from "https://cdn.skypack.dev/gsap/ScrollTrigger";
import Lenis from "https://unpkg.com/lenis@1.0.45/dist/lenis.mjs";

document.addEventListener("DOMContentLoaded", () => {
  gsap.registerPlugin(ScrollTrigger);

  const lenis = new Lenis();
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  const spotlightImages = document.querySelector(".spotlight-images");
  const maskContainer = document.querySelector(".mask-container");
  const maskImage = document.querySelector(".mask-img");
  const maskHeader = document.querySelector(".mask-container .header h1");

  const spotlightContainerHeight = spotlightImages.offsetHeight;
  const viewportHeight = window.innerHeight;
  const initialOffset = spotlightContainerHeight * 0.05;
  const totalMovement =
    spotlightContainerHeight + initialOffset + viewportHeight;

  let headerSplit = null;
  if (maskHeader) {
    // Manual SplitText (words)
    const text = maskHeader.textContent;
    maskHeader.innerHTML = text.split(" ").map(word => `<span class="spotlight-word" style="display:inline-block; opacity:0;">${word}&nbsp;</span>`).join("");

    // Mimic SplitText API
    headerSplit = {
      words: maskHeader.querySelectorAll(".spotlight-word")
    };
  }

  ScrollTrigger.create({
    trigger: ".spotlight",
    start: "top top",
    end: `+=${window.innerHeight * 7}px`,
    pin: true,
    pinSpacing: true,
    scrub: 1,
    onUpdate: (self) => {
      const progress = self.progress;

      if (progress <= 0.5) {
        const imagesMoveProgress = progress / 0.5;

        const startY = 5;
        const endY = -(totalMovement / spotlightContainerHeight) * 100;
        const currentY = startY + (endY - startY) * imagesMoveProgress;

        gsap.set(spotlightImages, {
          y: `${currentY}%`,
        });
      }

      if (maskContainer && maskImage) {
        if (progress >= 0.25 && progress <= 0.75) {
          const maskProgress = (progress - 0.25) / 0.5;
          const maskSize = `${maskProgress * 450}%`;
          const imageScale = 1.5 - maskProgress * 0.5;

          maskContainer.style.setProperty("-webkit-mask-size", maskSize);
          maskContainer.style.setProperty("mask-size", maskSize);

          gsap.set(maskImage, {
            scale: imageScale,
          });
        } else if (progress < 0.25) {
          maskContainer.style.setProperty("-webkit-mask-size", "0%");
          maskContainer.style.setProperty("mask-size", "0%");
          gsap.set(maskImage, {
            scale: 1.5,
          });
        } else if (progress > 0.75) {
          maskContainer.style.setProperty("-webkit-mask-size", "450%");
          maskContainer.style.setProperty("mask-size", "450%");
          gsap.set(maskImage, {
            scale: 1,
          });
        }
      }

      if (headerSplit && headerSplit.words.length > 0) {
        if (progress >= 0.75 && progress <= 0.95) {
          const textProgress = (progress - 0.75) / 0.2;
          const totalWords = headerSplit.words.length;

          headerSplit.words.forEach((word, index) => {
            const wordRevealProgress = index / totalWords;

            if (textProgress >= wordRevealProgress) {
              gsap.set(word, { opacity: 1 });
            } else {
              gsap.set(word, { opacity: 0 });
            }
          });
        } else if (progress < 0.75) {
          gsap.set(headerSplit.words, { opacity: 0 });
        } else if (progress > 0.95) {
          gsap.set(headerSplit.words, { opacity: 1 });
        }
      }
    },
  });
});
