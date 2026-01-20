const lenis = new Lenis();

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}

requestAnimationFrame(raf);

gsap.registerPlugin(Flip, CustomEase, ScrollToPlugin);

CustomEase.create(
  "hop",
  "M0,0 C0.028,0.528 0.129,0.74 0.27,0.852 0.415,0.967 0.499,1 1,1"
);

const items = document.querySelectorAll("nav .nav-item p");
const gallery = document.querySelector(".gallery");
const galleryContainer = document.querySelector(".gallery-container");
const imgPreviews = document.querySelector(".img-previews");
const minimap = document.querySelector(".minimap");

let activeLayout = "layout-1-gallery";

function switchLayout(newLayout) {
  if (newLayout === activeLayout) return;

  if (activeLayout === "layout-2-gallery" && window.scrollY > 0) {
    gsap.to(window, {
      scrollTo: { y: 0 },
      duration: 0.5,
      ease: "power3.out",
      onComplete: () => switchLayoutHandler(newLayout),
    });
  } else {
    switchLayoutHandler(newLayout);
  }
}

function switchLayoutHandler(newLayout) {
  const state = Flip.getState(gallery.querySelectorAll(".img"));

  gallery.classList.remove(activeLayout);
  gallery.classList.add(newLayout);

  let staggerValue = 0.025;
  if (
    (activeLayout === "layout-1-gallery" && newLayout === "layout-2-gallery") ||
    (activeLayout === "layout-3-gallery" && newLayout === "layout-2-gallery")
  ) {
    staggerValue = 0;
  }

  Flip.from(state, {
    duration: 1.5,
    ease: "hop",
    stagger: staggerValue,
  });

  activeLayout = newLayout;

  if (newLayout === "layout-2-gallery") {
    gsap.to([imgPreviews, minimap], {
      autoAlpha: 1,
      duration: 0.3,
      delay: 0.5,
    });
    window.addEventListener("scroll", handleScroll);
  } else {
    gsap.to([imgPreviews, minimap], {
      autoAlpha: 0,
      duration: 0.3,
    });
    window.removeEventListener("scroll", handleScroll);
    gsap.set(gallery, { clearProps: "y" });
    gsap.set(minimap, { clearProps: "y" });
  }

  items.forEach((item) => {
    item.classList.toggle("active", item.id === newLayout);
  });
}

items.forEach((item) => {
  item.addEventListener("click", () => {
    if (!item.id) return;
    const newLayout = item.id;
    switchLayout(newLayout);
  });
});

function handleScroll() {
  if (activeLayout !== "layout-2-gallery") return;

  const imgPreviewsHeight = imgPreviews.scrollHeight;
  const galleryHeight = gallery.scrollHeight;
  const scrollY = window.scrollY;
  const windowHeight = window.innerHeight;

  const scrollFraction = scrollY / (imgPreviewsHeight - windowHeight);
  const galleryTranslateY =
    -scrollFraction * (galleryHeight - windowHeight) * 1.525;
  const minimapTranslateY =
    scrollFraction * (windowHeight - minimap.offsetHeight) * 0.425;

  gsap.to(gallery, {
    y: galleryTranslateY,
    ease: "none",
    duration: 0.1,
  });

  gsap.to(minimap, {
    y: minimapTranslateY,
    ease: "none",
    duration: 0.1,
  });
}

window.addEventListener("load", () => {
  if (activeLayout === "layout-2-gallery") {
    handleScroll();
  }
});
