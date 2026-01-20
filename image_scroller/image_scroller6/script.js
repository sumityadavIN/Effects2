import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Flip } from "gsap/Flip";
import Lenis from "lenis";

document.addEventListener("DOMContentLoaded", () => {
  gsap.registerPlugin(ScrollTrigger, Flip);

  const lenis = new Lenis();
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  const lightColor = getComputedStyle(document.documentElement)
    .getPropertyValue("--light")
    .trim();
  const darkColor = getComputedStyle(document.documentElement)
    .getPropertyValue("--dark")
    .trim();

  function interpolateColor(color1, color2, factor) {
    return gsap.utils.interpolate(color1, color2, factor);
  }

  gsap.to(".marquee-images", {
    scrollTrigger: {
      trigger: ".marquee",
      start: "top bottom",
      end: "top top",
      scrub: true,
      onUpdate: (self) => {
        const progress = self.progress;
        const xPosition = -75 + progress * 25;
        gsap.set(".marquee-images", {
          x: `${xPosition}%`,
        });
      },
    },
  });

  let pinnedMarqueeImgClone = null;
  let isImgCloneActive = false;

  function createPinnedMarqueeImgClone() {
    if (isImgCloneActive) return;

    const originalMarqueeImg = document.querySelector(".marquee-img.pin img");
    const rect = originalMarqueeImg.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    pinnedMarqueeImgClone = originalMarqueeImg.cloneNode(true);

    gsap.set(pinnedMarqueeImgClone, {
      position: "fixed",
      left: centerX - originalMarqueeImg.offsetWidth / 2 + "px",
      top: centerY - originalMarqueeImg.offsetHeight / 2 + "px",
      width: originalMarqueeImg.offsetWidth + "px",
      height: originalMarqueeImg.offsetHeight + "px",
      transform: "rotate(-5deg)",
      transformOrigin: "center center",
      pointerEvents: "none",
      willChange: "transform",
      zIndex: 100,
    });

    document.body.appendChild(pinnedMarqueeImgClone);
    gsap.set(originalMarqueeImg, { opacity: 0 });
    isImgCloneActive = true;
  }

  function removePinnedMarqueeImgClone() {
    if (!isImgCloneActive) return;
    if (pinnedMarqueeImgClone) {
      pinnedMarqueeImgClone.remove();
      pinnedMarqueeImgClone = null;
    }
    const originalMarqueeImg = document.querySelector(".marquee-img.pin img");
    gsap.set(originalMarqueeImg, { opacity: 1 });
    isImgCloneActive = false;
  }

  ScrollTrigger.create({
    trigger: ".horizontal-scroll",
    start: "top top",
    end: () => `+=${window.innerHeight * 5}`,
    pin: true,
  });

  ScrollTrigger.create({
    trigger: ".marquee",
    start: "top top",
    onEnter: createPinnedMarqueeImgClone,
    onEnterBack: createPinnedMarqueeImgClone,
    onLeaveBack: removePinnedMarqueeImgClone,
  });

  let flipAnimation = null;

  ScrollTrigger.create({
    trigger: ".horizontal-scroll",
    start: "top 50%",
    end: () => `+=${window.innerHeight * 5.5}`,
    onEnter: () => {
      if (pinnedMarqueeImgClone && isImgCloneActive && !flipAnimation) {
        const state = Flip.getState(pinnedMarqueeImgClone);

        gsap.set(pinnedMarqueeImgClone, {
          position: "fixed",
          left: "0px",
          top: "0px",
          width: "100%",
          height: "100svh",
          transform: "rotate(0deg)",
          transformOrigin: "center center",
        });

        flipAnimation = Flip.from(state, {
          duration: 1,
          ease: "none",
          paused: true,
        });
      }
    },
    onLeaveBack: () => {
      if (flipAnimation) {
        flipAnimation.kill();
        flipAnimation = null;
      }
      gsap.set(".container", {
        backgroundColor: lightColor,
      });
      gsap.set(".horizontal-scroll-wrapper", {
        x: "0%",
      });
    },
  });

  ScrollTrigger.create({
    trigger: ".horizontal-scroll",
    start: "top 50%",
    end: () => `+=${window.innerHeight * 5.5}`,
    onUpdate: (self) => {
      const progress = self.progress;

      if (progress <= 0.05) {
        const bgColorProgress = Math.min(progress / 0.05, 1);
        const newBgColor = interpolateColor(
          lightColor,
          darkColor,
          bgColorProgress
        );
        gsap.set(".container", {
          backgroundColor: newBgColor,
        });
      } else if (progress > 0.05) {
        gsap.set(".container", {
          backgroundColor: darkColor,
        });
      }

      if (progress <= 0.2) {
        const scaleProgress = progress / 0.2;
        if (flipAnimation) {
          flipAnimation.progress(scaleProgress);
        }
      }

      if (progress > 0.2 && progress <= 0.95) {
        if (flipAnimation) {
          flipAnimation.progress(1);
        }

        const horizontalProgress = (progress - 0.2) / 0.75;

        const wrapperTranslateX = -66.67 * horizontalProgress;
        gsap.set(".horizontal-scroll-wrapper", {
          x: `${wrapperTranslateX}%`,
        });

        const slideMovement = (66.67 / 100) * 3 * horizontalProgress;
        const imageTranslateX = -slideMovement * 100;
        gsap.set(pinnedMarqueeImgClone, {
          x: `${imageTranslateX}%`,
        });
      } else if (progress > 0.95) {
        if (flipAnimation) {
          flipAnimation.progress(1);
        }
        gsap.set(pinnedMarqueeImgClone, {
          x: "-200%",
        });
        gsap.set(".horizontal-scroll-wrapper", {
          x: "-66.67%",
        });
      }
    },
  });
});
