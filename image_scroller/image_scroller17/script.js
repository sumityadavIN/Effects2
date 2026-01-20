import gsap from "https://esm.sh/gsap";
import slides from "./slides.js";

document.addEventListener("DOMContentLoaded", () => {
  const totalSlides = slides.length;
  let currentSlide = 1;

  let isAnimating = false;
  let scrollAllowed = true;
  let lastScrollTime = 0;

  function createSlide(slideIndex) {
    const slideData = slides[slideIndex - 1];

    const slide = document.createElement("div");
    slide.className = "slide";

    const slideImg = document.createElement("div");
    slideImg.className = "slide-img";
    const img = document.createElement("img");
    img.src = slideData.slideImg;
    img.alt = "";
    slideImg.appendChild(img);

    const slideHeader = document.createElement("div");
    slideHeader.className = "slide-header";

    const slideTitle = document.createElement("div");
    slideTitle.className = "slide-title";
    const h1 = document.createElement("h1");
    h1.textContent = slideData.slideTitle;
    slideTitle.appendChild(h1);

    const slideDescription = document.createElement("div");
    slideDescription.className = "slide-description";
    const p = document.createElement("p");
    p.textContent = slideData.slideDescription;
    slideDescription.appendChild(p);

    const slideLink = document.createElement("div");
    slideLink.className = "slide-link";
    const a = document.createElement("a");
    a.href = slideData.slideUrl;
    a.textContent = "View Project";
    slideLink.appendChild(a);

    slideHeader.appendChild(slideTitle);
    slideHeader.appendChild(slideDescription);
    slideHeader.appendChild(slideLink);

    const slideInfo = document.createElement("div");
    slideInfo.className = "slide-info";

    const slideTags = document.createElement("div");
    slideTags.className = "slide-tags";
    const tagsLabel = document.createElement("p");
    tagsLabel.textContent = "Tags";
    slideTags.appendChild(tagsLabel);

    slideData.slideTags.forEach((tag) => {
      const tagP = document.createElement("p");
      tagP.textContent = tag;
      slideTags.appendChild(tagP);
    });

    const slideIndexWrapper = document.createElement("div");
    slideIndexWrapper.className = "slide-index-wrapper";
    const slideIndexCopy = document.createElement("p");
    slideIndexCopy.textContent = slideIndex.toString().padStart(2, "0");
    const slideIndexSeparator = document.createElement("p");
    slideIndexSeparator.textContent = "/";
    const slidesTotalCount = document.createElement("p");
    slidesTotalCount.textContent = totalSlides.toString().padStart(2, "0");

    slideIndexWrapper.appendChild(slideIndexCopy);
    slideIndexWrapper.appendChild(slideIndexSeparator);
    slideIndexWrapper.appendChild(slidesTotalCount);

    slideInfo.appendChild(slideTags);
    slideInfo.appendChild(slideIndexWrapper);

    slide.appendChild(slideImg);
    slide.appendChild(slideHeader);
    slide.appendChild(slideInfo);

    return slide;
  }

  function splitText(slide) {
    const slideHeader = slide.querySelector(".slide-title h1");
    if (slideHeader) {
      // Words split
      const text = slideHeader.textContent;
      slideHeader.innerHTML = "";
      text.split(" ").forEach(word => {
        const div = document.createElement("div");
        div.className = "word-wrapper";
        div.style.display = "inline-block";
        div.style.overflow = "hidden";
        div.style.marginRight = "0.2em";

        const span = document.createElement("span");
        span.textContent = word;
        span.className = "word";
        span.style.display = "inline-block";
        span.style.willChange = "transform";

        div.appendChild(span);
        slideHeader.appendChild(div);
      });
    }

    const slideContent = slide.querySelectorAll("p, a");
    slideContent.forEach((element) => {
      // Lines split (robust)
      const text = element.textContent;
      const words = text.split(" ");
      element.innerHTML = "";

      const nodes = [];
      words.forEach((word, index) => {
        if (!word) return;
        const span = document.createElement("span");
        span.textContent = word;
        span.style.display = "inline-block";
        element.appendChild(span);
        nodes.push({ type: "span", node: span });

        if (index < words.length - 1) {
          const space = document.createTextNode(" ");
          element.appendChild(space);
          nodes.push({ type: "space", node: space });
        }
      });

      let lines = [];
      let currentLine = [];
      let lastTop = -1;

      nodes.forEach(item => {
        if (item.type === "span") {
          if (lastTop === -1) lastTop = item.node.offsetTop;
          if (item.node.offsetTop > lastTop + 5) {
            if (currentLine.length > 0) lines.push(currentLine);
            currentLine = [];
            lastTop = item.node.offsetTop;
          }
        }
        currentLine.push(item.node);
      });
      if (currentLine.length > 0) lines.push(currentLine);

      element.innerHTML = "";
      lines.forEach(lineNodes => {
        const div = document.createElement("div");
        div.className = "line-wrapper";
        div.style.overflow = "hidden";
        div.style.display = "block";

        const lineInner = document.createElement("div");
        lineInner.className = "line";
        lineInner.style.display = "block";
        lineInner.style.willChange = "transform";

        lineNodes.forEach(node => lineInner.appendChild(node));
        div.appendChild(lineInner);
        element.appendChild(div);
      });
    });
  }

  function animateSlide(direction) {
    if (isAnimating || !scrollAllowed) return;

    isAnimating = true;
    scrollAllowed = false;

    const slider = document.querySelector(".slider");
    const currentSlideElement = slider.querySelector(".slide");

    if (direction === "down") {
      currentSlide = currentSlide === totalSlides ? 1 : currentSlide + 1;
    } else {
      currentSlide = currentSlide === 1 ? totalSlides : currentSlide - 1;
    }

    const exitY = direction === "down" ? "-200vh" : "200vh";
    const entryY = direction === "down" ? "100vh" : "-100vh";
    const entryClipPath =
      direction === "down"
        ? "polygon(20% 20%, 80% 20%, 80% 100%, 20% 100%)"
        : "polygon(20% 0%, 80% 0%, 80% 80%, 20% 80%)";

    gsap.to(currentSlideElement, {
      scale: 0.25,
      opacity: 0,
      rotation: 30,
      y: exitY,
      duration: 2,
      ease: "power4.inOut",
      force3D: true,
      onComplete: () => {
        currentSlideElement.remove();
      },
    });

    setTimeout(() => {
      const newSlide = createSlide(currentSlide);

      gsap.set(newSlide, {
        y: entryY,
        clipPath: entryClipPath,
        force3D: true,
      });

      slider.appendChild(newSlide);

      splitText(newSlide);

      const words = newSlide.querySelectorAll(".word");
      const lines = newSlide.querySelectorAll(".line");

      gsap.set([...words, ...lines], {
        y: "100%",
        force3D: true,
      });

      gsap.to(newSlide, {
        y: 0,
        clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
        duration: 1.5,
        ease: "power4.out",
        force3D: true,
        onStart: () => {
          const tl = gsap.timeline();

          const headerWords = newSlide.querySelectorAll(".slide-title .word");
          tl.to(
            headerWords,
            {
              y: "0%",
              duration: 1,
              ease: "power4.out",
              stagger: 0.1,
              force3D: true,
            },
            0.75
          );

          const tagsLines = newSlide.querySelectorAll(".slide-tags .line");
          const indexLines = newSlide.querySelectorAll(
            ".slide-index-wrapper .line"
          );
          const descriptionLines = newSlide.querySelectorAll(
            ".slide-description .line"
          );

          tl.to(
            tagsLines,
            {
              y: "0%",
              duration: 1,
              ease: "power4.out",
              stagger: 0.1,
            },
            "-=0.75"
          );

          tl.to(
            indexLines,
            {
              y: "0%",
              duration: 1,
              ease: "power4.out",
              stagger: 0.1,
            },
            "<"
          );

          tl.to(
            descriptionLines,
            {
              y: "0%",
              duration: 1,
              ease: "power4.out",
              stagger: 0.1,
            },
            "<"
          );

          const linkLines = newSlide.querySelectorAll(".slide-link .line");
          tl.to(
            linkLines,
            {
              y: "0%",
              duration: 1,
              ease: "power4.out",
            },
            "-=1"
          );
        },
        onComplete: () => {
          isAnimating = false;
          setTimeout(() => {
            scrollAllowed = true;
            lastScrollTime = Date.now();
          }, 100);
        },
      });
    }, 750);
  }

  function handleScroll(direction) {
    const now = Date.now();

    if (isAnimating || !scrollAllowed) return;
    if (now - lastScrollTime < 1000) return;

    lastScrollTime = now;
    animateSlide(direction);
  }

  window.addEventListener(
    "wheel",
    (e) => {
      e.preventDefault();
      const direction = e.deltaY > 0 ? "down" : "up";
      handleScroll(direction);
    },
    { passive: false }
  );

  let touchStartY = 0;
  let isTouchActive = false;

  window.addEventListener(
    "touchstart",
    (e) => {
      touchStartY = e.touches[0].clientY;
      isTouchActive = true;
    },
    { passive: false }
  );

  window.addEventListener(
    "touchmove",
    (e) => {
      e.preventDefault();
      if (!isTouchActive || isAnimating || !scrollAllowed) return;

      const touchCurrentY = e.touches[0].clientY;
      const difference = touchStartY - touchCurrentY;

      if (Math.abs(difference) > 50) {
        isTouchActive = false;
        const direction = difference > 0 ? "down" : "up";
        handleScroll(direction);
      }
    },
    { passive: false }
  );

  window.addEventListener("touchend", () => {
    isTouchActive = false;
  });
});
