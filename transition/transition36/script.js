import gsap from "https://cdn.skypack.dev/gsap";
import { ScrollTrigger } from "https://cdn.skypack.dev/gsap/ScrollTrigger";
import { SplitText } from "https://cdn.skypack.dev/gsap/SplitText";
import Lenis from "https://unpkg.com/lenis@1.0.45/dist/lenis.mjs";

document.addEventListener("DOMContentLoaded", () => {
  gsap.registerPlugin(ScrollTrigger, SplitText);

  const lenis = new Lenis();
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  const header = document.querySelector(".header h1");
  const textElement1 = document.querySelector(
    ".sticky-text-1 .text-container h1"
  );
  const textElement2 = document.querySelector(
    ".sticky-text-2 .text-container h1"
  );
  const textElement3 = document.querySelector(
    ".sticky-text-3 .text-container h1"
  );
  const textContainer3 = document.querySelector(
    ".sticky-text-3 .text-container"
  );

  const outroTextBgColor = getComputedStyle(document.documentElement)
    .getPropertyValue("--dark")
    .trim();

  let headerSplit = null;
  if (header) {
    headerSplit = SplitText.create(header, {
      type: "words",
      wordsClass: "spotlight-word",
    });
    gsap.set(headerSplit.words, { opacity: 0 });
  }

  const targetScales = [];

  function calculateDynamicScale() {
    for (let i = 1; i <= 3; i++) {
      const section = document.querySelector(`.sticky-text-${i}`);
      const text = document.querySelector(
        `.sticky-text-${i} .text-container h1`
      );

      if (!section || !text) continue;

      const sectionHeight = section.offsetHeight;
      const textHeight = text.offsetHeight;
      targetScales[i - 1] = sectionHeight / textHeight;
    }
  }

  calculateDynamicScale();
  window.addEventListener("resize", calculateDynamicScale);

  function setScaleY(element, scale) {
    element.style.transform = `scaleY(${scale})`;
  }

  ScrollTrigger.create({
    trigger: ".sticky-text-1",
    start: "top bottom",
    end: "top top",
    scrub: 1,
    onUpdate: (self) => {
      const currentScale = targetScales[0] * self.progress;
      setScaleY(textElement1, currentScale);
    },
  });

  ScrollTrigger.create({
    trigger: ".sticky-text-1",
    start: "top top",
    end: `+=${window.innerHeight * 1}px`,
    pin: true,
    pinSpacing: false,
    scrub: 1,
    onUpdate: (self) => {
      const currentScale = targetScales[0] * (1 - self.progress);
      setScaleY(textElement1, currentScale);
    },
  });

  ScrollTrigger.create({
    trigger: ".sticky-text-2",
    start: "top bottom",
    end: "top top",
    scrub: 1,
    onUpdate: (self) => {
      const currentScale = targetScales[1] * self.progress;
      setScaleY(textElement2, currentScale);
    },
  });

  ScrollTrigger.create({
    trigger: ".sticky-text-2",
    start: "top top",
    end: `+=${window.innerHeight * 1}px`,
    pin: true,
    pinSpacing: false,
    scrub: 1,
    onUpdate: (self) => {
      const currentScale = targetScales[1] * (1 - self.progress);
      setScaleY(textElement2, currentScale);
    },
  });

  ScrollTrigger.create({
    trigger: ".sticky-text-3",
    start: "top bottom",
    end: "top top",
    scrub: 1,
    onUpdate: (self) => {
      const currentScale = targetScales[2] * self.progress;
      setScaleY(textElement3, currentScale);
    },
  });

  ScrollTrigger.create({
    trigger: ".sticky-text-3",
    start: "top top",
    end: `+=${window.innerHeight * 4}px`,
    pin: true,
    pinSpacing: true,
    scrub: 1,
    onUpdate: (self) => {
      const progress = self.progress;

      if (progress === 0) {
        textContainer3.style.backgroundColor = outroTextBgColor;
        textContainer3.style.opacity = 1;
      }

      if (progress <= 0.75) {
        const scaleProgress = progress / 0.75;
        const currentScale = 1 + 9 * scaleProgress;
        textContainer3.style.transform = `scale3d(${currentScale}, ${currentScale}, 1)`;
      } else {
        textContainer3.style.transform = `scale3d(10, 10, 1)`;
      }

      if (progress < 0.25) {
        textContainer3.style.backgroundColor = outroTextBgColor;
        textContainer3.style.opacity = 1;
      } else if (progress >= 0.25 && progress <= 0.5) {
        const fadeProgress = (progress - 0.25) / 0.25;
        const bgOpacity = Math.max(0, Math.min(1, 1 - fadeProgress));
        textContainer3.style.backgroundColor = outroTextBgColor.replace(
          "1)",
          `${bgOpacity})`
        );
      } else if (progress > 0.5) {
        textContainer3.style.backgroundColor = outroTextBgColor.replace(
          "1)",
          "0)"
        );
      }

      if (progress >= 0.5 && progress <= 0.75) {
        const textProgress = (progress - 0.5) / 0.25;
        const textOpacity = 1 - textProgress;
        textContainer3.style.opacity = textOpacity;
      } else if (progress > 0.75) {
        textContainer3.style.opacity = 0;
      }

      if (headerSplit && headerSplit.words.length > 0) {
        if (progress >= 0.75 && progress <= 0.95) {
          const textProgress = (progress - 0.75) / 0.2;
          const totalWords = headerSplit.words.length;

          headerSplit.words.forEach((word, index) => {
            const wordRevealProgress = index / totalWords;
            const opacity = textProgress >= wordRevealProgress ? 1 : 0;
            gsap.set(word, { opacity });
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
