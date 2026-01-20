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

  const cards = gsap.utils.toArray(".card");

  cards.forEach((card, index) => {
    if (index < cards.length - 1) {
      const cardInner = card.querySelector(".card-inner");

      gsap.fromTo(
        cardInner,
        {
          y: "0%",
          z: 0,
          rotationX: 0,
        },
        {
          y: "-50%",
          z: -250,
          rotationX: 45,
          scrollTrigger: {
            trigger: cards[index + 1],
            start: "top 85%",
            end: "top -75%",
            scrub: true,
            pin: card,
            pinSpacing: false,
          },
        }
      );

      gsap.to(cardInner, {
        "--after-opacity": 1,
        scrollTrigger: {
          trigger: cards[index + 1],
          start: "top 75%",
          end: "top -25%",
          scrub: true,
        },
      });
    }
  });
});
