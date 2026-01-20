let lenis;

function initializeLenis() {
  if (lenis) {
    lenis.destroy();
  }

  lenis = new Lenis({
    autoRaf: true,
    smoothWheel: true,
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }

  requestAnimationFrame(raf);
}

function initializeAnimations() {
  gsap.to(".link a", {
    y: 0,
    duration: 1,
    stagger: 0.1,
    ease: "power4.out",
    delay: 1,
  });

  if (document.querySelector(".hero h1")) {
    const heroText = new SplitType(".hero h1", { types: "chars" });
    gsap.set(heroText.chars, { y: 400 });
    gsap.to(heroText.chars, {
      y: 0,
      duration: 1,
      stagger: 0.075,
      ease: "power4.out",
      delay: 1,
    });
  }

  if (document.querySelector(".info p")) {
    const splits = document.querySelectorAll(".info p .line");
    splits.forEach((split) => {
      const text = split.textContent;
      split.parentNode.replaceChild(document.createTextNode(text), split);
    });

    const text = new SplitType(".info p", {
      types: "lines",
      tagName: "div",
      lineClass: "line",
    });

    text.lines.forEach((line) => {
      const content = line.innerHTML;
      line.innerHTML = `<span>${content}</span>`;
    });

    gsap.set(".info p .line span", {
      y: 400,
      display: "block",
    });

    gsap.to(".info p .line span", {
      y: 0,
      duration: 2,
      stagger: 0.075,
      ease: "power4.out",
      delay: 0.25,
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initializeLenis();
  initializeAnimations();
});

if (navigation.addEventListener) {
  navigation.addEventListener("navigate", (event) => {
    if (
      !event.destination.url.includes(document.location.origin) ||
      !event.destination.url.endsWith(".html")
    ) {
      return;
    }

    event.intercept({
      handler: async () => {
        const response = await fetch(event.destination.url);
        const text = await response.text();

        const transition = document.startViewTransition(() => {
          const body = text.match(/<body[^>]*>([\s\S]*)<\/body>/i)[1];
          document.body.innerHTML = body;

          const title = text.match(/<title[^>]*>(.*?)<\/title>/i)[1];
          document.title = title;
        });

        transition.ready.then(() => {
          window.scrollTo(0, 0);
          initializeAnimations();
          initializeLenis();
        });
      },
      scroll: "manual",
    });
  });
}
