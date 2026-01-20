
document.addEventListener("DOMContentLoaded", () => {
  gsap.registerPlugin(ScrollTrigger);

  if (typeof Lenis !== "undefined") {
    const lenis = new Lenis();
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
  }

  const heroContent = document.querySelector(".hero-content");
  const heroContentHeight = heroContent.offsetHeight;
  const viewportHeight = window.innerHeight;
  const heroContentMovedistance = heroContentHeight - viewportHeight;

  const heroImg = document.querySelector(".hero-img");
  const heroImgHeight = heroImg.offsetHeight;
  const heroImgMovedistance = heroImgHeight - viewportHeight;
  const heroImgElement = document.querySelector(".hero-img img");

  const heroMask = document.querySelector(".hero-mask");
  const heroGridOverlay = document.querySelector(".hero-grid-overlay");
  const marker1 = document.querySelector(".marker.marker-1");
  const marker2 = document.querySelector(".marker.marker-2");

  const heroScrollProgressBar = document.querySelector(
    ".hero-scroll-progress-bar"
  );

  const ease = (x) => x * x * (3 - 2 * x);

  ScrollTrigger.create({
    trigger: ".hero",
    start: "top top",
    end: `+=${window.innerHeight * 4}px`,
    pin: true,
    pinSpacing: true,
    scrub: 1,
    onUpdate: (self) => {
      gsap.set(heroScrollProgressBar, {
        "--progress": self.progress,
      });

      gsap.set(heroContent, {
        y: -self.progress * heroContentMovedistance,
      });

      let heroImgProgress;
      if (self.progress <= 0.45) {
        heroImgProgress = ease(self.progress / 0.45) * 0.65;
      } else if (self.progress <= 0.75) {
        heroImgProgress = 0.65;
      } else {
        heroImgProgress = 0.65 + ease((self.progress - 0.75) / 0.25) * 0.35;
      }

      gsap.set(heroImg, {
        y: heroImgProgress * heroImgMovedistance,
      });

      let heroMaskScale;
      let heroImgSaturation;
      let heroImgOverlayOpacity;

      if (self.progress <= 0.4) {
        heroMaskScale = 2.5;
        heroImgSaturation = 1;
        heroImgOverlayOpacity = 0.35;
      } else if (self.progress <= 0.5) {
        const phaseProgress = ease((self.progress - 0.4) / 0.1);
        heroMaskScale = 2.5 - phaseProgress * 1.5;
        heroImgSaturation = 1 - phaseProgress;
        heroImgOverlayOpacity = 0.35 + phaseProgress * 0.35;
      } else if (self.progress <= 0.75) {
        heroMaskScale = 1;
        heroImgSaturation = 0;
        heroImgOverlayOpacity = 0.7;
      } else if (self.progress <= 0.85) {
        const phaseProgress = ease((self.progress - 0.75) / 0.1);
        heroMaskScale = 1 + phaseProgress * 1.5;
        heroImgSaturation = phaseProgress;
        heroImgOverlayOpacity = 0.7 - phaseProgress * 0.35;
      } else {
        heroMaskScale = 2.5;
        heroImgSaturation = 1;
        heroImgOverlayOpacity = 0.35;
      }

      gsap.set(heroMask, {
        scale: heroMaskScale,
      });

      gsap.set(heroImgElement, {
        filter: `saturate(${heroImgSaturation})`,
      });

      gsap.set(heroImg, {
        "--overlay-opacity": heroImgOverlayOpacity,
      });

      let heroGridOpacity;
      if (self.progress <= 0.475) {
        heroGridOpacity = 0;
      } else if (self.progress <= 0.5) {
        heroGridOpacity = ease((self.progress - 0.475) / 0.025);
      } else if (self.progress <= 0.75) {
        heroGridOpacity = 1;
      } else if (self.progress <= 0.775) {
        heroGridOpacity = 1 - ease((self.progress - 0.75) / 0.025);
      } else {
        heroGridOpacity = 0;
      }

      gsap.set(heroGridOverlay, {
        opacity: heroGridOpacity,
      });

      let marker1Opacity;
      if (self.progress <= 0.5) {
        marker1Opacity = 0;
      } else if (self.progress <= 0.525) {
        marker1Opacity = ease((self.progress - 0.5) / 0.025);
      } else if (self.progress <= 0.7) {
        marker1Opacity = 1;
      } else if (self.progress <= 0.75) {
        marker1Opacity = 1 - ease((self.progress - 0.7) / 0.05);
      } else {
        marker1Opacity = 0;
      }

      gsap.set(marker1, {
        opacity: marker1Opacity,
      });

      let marker2Opacity;
      if (self.progress <= 0.55) {
        marker2Opacity = 0;
      } else if (self.progress <= 0.575) {
        marker2Opacity = ease((self.progress - 0.55) / 0.025);
      } else if (self.progress <= 0.7) {
        marker2Opacity = 1;
      } else if (self.progress <= 0.75) {
        marker2Opacity = 1 - ease((self.progress - 0.7) / 0.05);
      } else {
        marker2Opacity = 0;
      }

      gsap.set(marker2, {
        opacity: marker2Opacity,
      });
    },
  });
});
