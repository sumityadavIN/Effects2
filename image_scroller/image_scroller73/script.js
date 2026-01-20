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

  const slides = [
    {
      title:
        "Under the soft hum of streetlights she watches the world ripple through glass, her calm expression mirrored in the fragments of drifting light.",
      image: "./public/slider_img_1.jpg",
    },
    {
      title:
        "A car slices through the desert, shadow chasing the wind as clouds of dust rise behind, blurring the horizon into gold and thunder.",
      image: "./public/slider_img_2.jpg",
    },
    {
      title:
        "Reflections ripple across mirrored faces, each one a fragment of identity, caught between defiance, doubt, and the silence of thought.",
      image: "./public/slider_img_3.jpg",
    },
    {
      title:
        "Soft light spills through the café windows as morning settles into wood and metal, capturing the rhythm of quiet human routine.",
      image: "./public/slider_img_4.jpg",
    },
    {
      title:
        "Every serve becomes a battle between focus and instinct, movement flowing like rhythm as the court blurs beneath the sunlight.",
      image: "./public/slider_img_5.jpg",
    },
    {
      title:
        "Amber light spills over the stage as guitars cry into smoke and shadow, where music and motion merge into pure energy.",
      image: "./public/slider_img_6.jpg",
    },
    {
      title:
        "Dust erupts beneath his stride as sweat glints under floodlights, every step pushing closer to victory, grit, and pure determination.",
      image: "./public/slider_img_7.jpg",
    },
  ];

  const pinDistance = window.innerHeight * slides.length;
  const progressBar = document.querySelector(".slider-progress");
  const sliderImages = document.querySelector(".slider-images");
  const sliderTitle = document.querySelector(".slider-title");
  const sliderIndices = document.querySelector(".slider-indices");

  let activeSlide = 0;

  function createIndices() {
    sliderIndices.innerHTML = "";

    slides.forEach((_, index) => {
      const indexNum = (index + 1).toString().padStart(2, "0");
      const indicatorElement = document.createElement("p");
      indicatorElement.dataset.index = index;
      indicatorElement.innerHTML = `<span class="marker"></span><span class="index">${indexNum}</span>`;
      sliderIndices.appendChild(indicatorElement);

      if (index === 0) {
        gsap.set(indicatorElement.querySelector(".index"), {
          opacity: 1,
        });
        gsap.set(indicatorElement.querySelector(".marker"), {
          scaleX: 1,
        });
      } else {
        gsap.set(indicatorElement.querySelector(".index"), {
          opacity: 0.35,
        });
        gsap.set(indicatorElement.querySelector(".marker"), {
          scaleX: 0,
        });
      }
    });
  }

  function animateNewSlide(index) {
    const newSliderImage = document.createElement("img");
    newSliderImage.src = slides[index].image;
    newSliderImage.alt = `Slide ${index + 1}`;

    gsap.set(newSliderImage, {
      opacity: 0,
      scale: 1.1,
    });

    sliderImages.appendChild(newSliderImage);

    gsap.to(newSliderImage, {
      opacity: 1,
      duration: 0.5,
      ease: "power2.out",
    });

    gsap.to(newSliderImage, {
      scale: 1,
      duration: 1,
      ease: "power2.out",
    });

    const allImages = sliderImages.querySelectorAll("img");
    if (allImages.length > 3) {
      const removeCount = allImages.length - 3;
      for (let i = 0; i < removeCount; i++) {
        sliderImages.removeChild(allImages[i]);
      }
    }

    animateNewTitle(index);
    animateIndicators(index);
  }

  function animateIndicators(index) {
    const indicators = sliderIndices.querySelectorAll("p");

    indicators.forEach((indicator, i) => {
      const markerElement = indicator.querySelector(".marker");
      const indexElement = indicator.querySelector(".index");

      if (i === index) {
        gsap.to(indexElement, {
          opacity: 1,
          duration: 0.3,
          ease: "power2.out",
        });

        gsap.to(markerElement, {
          scaleX: 1,
          duration: 0.3,
          ease: "power2.out",
        });
      } else {
        gsap.to(indexElement, {
          opacity: 0.5,
          duration: 0.3,
          ease: "power2.out",
        });

        gsap.to(markerElement, {
          scaleX: 0,
          duration: 0.3,
          ease: "power2.out",
        });
      }
    });
  }

  function animateNewTitle(index) {
    // Manual line splitting (replaces SplitText)
    sliderTitle.innerHTML = `<h1><div class="line" style="display:block; overflow:hidden;"><span style="display:block;">${slides[index].title}</span></div></h1>`;

    const lines = sliderTitle.querySelectorAll(".line span");

    gsap.set(lines, {
      yPercent: 100,
      opacity: 0,
    });

    gsap.to(lines, {
      yPercent: 0,
      opacity: 1,
      duration: 0.75,
      stagger: 0.1,
      ease: "power3.out",
    });
  }

  createIndices();

  ScrollTrigger.create({
    trigger: ".slider",
    start: "top top",
    end: `+=${pinDistance}px`,
    scrub: 1,
    pin: true,
    pinSpacing: true,
    onUpdate: (self) => {
      gsap.set(progressBar, {
        scaleY: self.progress,
      });

      const currentSlide = Math.floor(self.progress * slides.length);

      if (activeSlide !== currentSlide && currentSlide < slides.length) {
        activeSlide = currentSlide;
        animateNewSlide(activeSlide);
      }
    },
  });
});
