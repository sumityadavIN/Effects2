import gsap from "https://esm.sh/gsap";
import { ScrollTrigger } from "https://esm.sh/gsap/ScrollTrigger";
import Lenis from "https://esm.sh/@studio-freight/lenis";

document.addEventListener("DOMContentLoaded", () => {
  gsap.registerPlugin(ScrollTrigger);

  const lenis = new Lenis();
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  // Helper to split text into chars without paid SplitText plugin
  function splitTextToChars(element) {
    const text = element.textContent;
    element.innerHTML = "";
    const chars = text.split("").map((char) => {
      const span = document.createElement("span");
      span.textContent = char === " " ? "\u00A0" : char;
      span.style.display = "inline-block";
      element.appendChild(span);
      return span;
    });
    return chars;
  }

  gsap.utils.toArray(".work-item").forEach((item) => {
    const img = item.querySelector(".work-item-img");
    const nameH1 = item.querySelector(".work-item-name h1");

    // Use custom split function
    const chars = splitTextToChars(nameH1);

    gsap.set(chars, { y: "125%" });

    chars.forEach((char, index) => {
      ScrollTrigger.create({
        trigger: item,
        start: `top+=${index * 25 - 250} top`,
        end: `top+=${index * 25 - 100} top`,
        scrub: 1,
        animation: gsap.fromTo(
          char,
          {
            y: "125%",
          },
          {
            y: "0%",
            ease: "none",
          }
        ),
      });
    });

    ScrollTrigger.create({
      trigger: item,
      start: "top bottom",
      end: "top top",
      scrub: 0.5,
      animation: gsap.fromTo(
        img,
        {
          clipPath: "polygon(25% 25%, 75% 40%, 100% 100%, 0% 100%)",
        },
        {
          clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
          ease: "none",
        }
      ),
    });

    ScrollTrigger.create({
      trigger: item,
      start: "bottom bottom",
      end: "bottom top",
      scrub: 0.5,
      animation: gsap.fromTo(
        img,
        {
          clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
        },
        {
          clipPath: "polygon(0% 0%, 100% 0%, 75% 60%, 25% 75%)",
          ease: "none",
        }
      ),
    });
  });
});
