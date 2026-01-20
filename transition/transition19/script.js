
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

  const container = document.querySelector(".sticky-cards");

  if (typeof stickyCardsData !== "undefined") {
    stickyCardsData.forEach((cardData, index) => {
      const card = document.createElement("div");
      card.className = "sticky-card";

      card.innerHTML = `
        <div class="sticky-card-index">
          <h1>${cardData.index}</h1>
        </div>
        <div class="sticky-card-content">
          <div class="sticky-card-content-wrapper">
            <h1 class="sticky-card-header">${cardData.title}</h1>
            <div class="sticky-card-img">
              <img src="${cardData.image}" alt="" />
            </div>
            <div class="sticky-card-copy">
              <div class="sticky-card-copy-title">
                <p>(About the state)</p>
              </div>
              <div class="sticky-card-copy-description">
                <p>${cardData.description}</p>
              </div>
            </div>
          </div>
        </div>
      `;

      container.appendChild(card);
    });

    const stickyCards = document.querySelectorAll(".sticky-card");

    stickyCards.forEach((card, index) => {
      if (index < stickyCards.length - 1) {
        ScrollTrigger.create({
          trigger: card,
          start: "top top",
          endTrigger: stickyCards[stickyCards.length - 1],
          end: "top top",
          pin: true,
          pinSpacing: false,
        });
      }

      if (index < stickyCards.length - 1) {
        ScrollTrigger.create({
          trigger: stickyCards[index + 1],
          start: "top bottom",
          end: "top top",
          onUpdate: (self) => {
            const progress = self.progress;
            const scale = 1 - progress * 0.25;
            const rotation = (index % 2 === 0 ? 5 : -5) * progress;
            const afterOpacity = progress;

            gsap.set(card, {
              scale: scale,
              rotation: rotation,
              "--after-opacity": afterOpacity,
            });
          },
        });
      }
    });
  }
});
