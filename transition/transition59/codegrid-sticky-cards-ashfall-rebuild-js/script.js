
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

  const cards = document.querySelectorAll(".card");
  const images = document.querySelectorAll(".card img");
  const totalCards = cards.length;

  gsap.set(cards[0], { y: "0%", scale: 1, rotation: 0 });
  gsap.set(images[0], { scale: 1 });

  for (let i = 1; i < totalCards; i++) {
    gsap.set(cards[i], { y: "100%", scale: 1, rotation: 0 });
    gsap.set(images[i], { scale: 1 });
  }

  const scrollTimeline = gsap.timeline({
    scrollTrigger: {
      trigger: ".sticky-cards",
      start: "top top",
      end: `+=${window.innerHeight * (totalCards - 1)}`,
      pin: true,
      scrub: 0.5,
    },
  });

  for (let i = 0; i < totalCards - 1; i++) {
    const currentCard = cards[i];
    const currentImage = images[i];
    const nextCard = cards[i + 1];

    const position = i;

    scrollTimeline.to(
      currentCard,
      {
        scale: 0.5,
        rotation: 10,
        duration: 1,
        ease: "none",
      },
      position
    );

    scrollTimeline.to(
      currentImage,
      {
        scale: 1.5,
        duration: 1,
        ease: "none",
      },
      position
    );

    scrollTimeline.to(
      nextCard,
      {
        y: "0%",
        duration: 1,
        ease: "none",
      },
      position
    );
  }
});
