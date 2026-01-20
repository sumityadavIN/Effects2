document.addEventListener("DOMContentLoaded", () => {
  gsap.registerPlugin(ScrollTrigger);
  const lenis = new Lenis();
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  const cards = gsap.utils.toArray(".card");

  ScrollTrigger.create({
    trigger: cards[0],
    start: "top 35%",
    endTrigger: cards[cards.length - 1],
    end: "top 30%",
    pin: ".intro",
    pinSpacing: false,
  });

  cards.forEach((card, index) => {
    const isLastCard = index === cards.length - 1;
    const cardInner = card.querySelector(".card-inner");

    if (!isLastCard) {
      ScrollTrigger.create({
        trigger: card,
        start: "top 35%",
        endTrigger: ".outro",
        end: "top 65%",
        pin: true,
        pinSpacing: false,
      });

      gsap.to(cardInner, {
        y: `-${(cards.length - index) * 14}vh`,
        ease: "none",
        scrollTrigger: {
          trigger: card,
          start: "top 35%",
          endTrigger: ".outro",
          end: "top 65%",
          scrub: true,
        },
      });
    }
  });
});
