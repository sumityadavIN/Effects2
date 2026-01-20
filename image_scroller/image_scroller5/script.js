document.addEventListener("DOMContentLoaded", () => {
  const gallery = document.querySelector(".gallery");
  const zoomOutBtn = document.getElementById("zoom-out");
  const zoomInBtn = document.getElementById("zoom-in");
  const dragLayer = document.querySelector("#drag-layer");
  const totalRows = 20;
  const imagesPerRow = 60;
  const totalImages = totalRows * imagesPerRow;
  let isZoomed = false;
  const images = [];

  function getRandomHeight(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  for (let i = 0; i < totalImages; i++) {
    const img = document.createElement("div");
    img.className = "img";
    img.style.height = `${getRandomHeight(30, 40)}px`;

    const imgElement = document.createElement("img");
    const randomImageNumber = Math.floor(Math.random() * 50) + 1;
    imgElement.src = `./assets/img${randomImageNumber}.jpg`;
    img.appendChild(imgElement);

    gallery.appendChild(img);
    images.push(img);
  }

  gsap.to(images, {
    scale: 1,
    delay: 1,
    opacity: 1,
    duration: 0.5,
    stagger: {
      amount: 1.5,
      grid: [totalRows, imagesPerRow],
      from: "random",
    },
    ease: "power1.out",
  });

  zoomOutBtn.addEventListener("click", () => {
    if (!isZoomed) return;

    isZoomed = false;
    dragLayer.style.display = "none";

    const currentTransform = window.getComputedStyle(gallery).transform;
    gsap.set(gallery, { clearProps: "transform" });

    const tl = gsap.timeline({
      defaults: {
        duration: 2.5,
        ease: "power4.inOut",
      },
    });

    tl.fromTo(gallery, { transform: currentTransform }, { x: 0, y: 0 }).to(
      images,
      { scale: 1, x: 0, y: 0 },
      0
    );

    currentX = 0;
    currentY = 0;
    targetX = 0;
    targetY = 0;
    isDragging = false;

    zoomOutBtn.classList.add("active");
    zoomInBtn.classList.remove("active");
  });

  zoomInBtn.addEventListener("click", () => {
    if (isZoomed) return;

    isZoomed = true;
    dragLayer.style.display = "block";

    images.forEach((img, index) => {
      const rect = img.getBoundingClientRect();
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const distX = (rect.left + rect.width / 2 - centerX) / 100;
      const distY = (rect.top + rect.height / 2 - centerY) / 100;

      gsap.to(img, {
        x: distX * 1200,
        y: distY * 600,
        scale: 5,
        duration: 2.5,
        ease: "power4.inOut",
      });
    });

    zoomOutBtn.classList.remove("active");
    zoomInBtn.classList.add("active");
  });

  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let initialX = 0;
  let initialY = 0;
  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;

  function lerp(start, end, factor) {
    return start + (end - start) * factor;
  }

  function animate() {
    if (
      isDragging ||
      Math.abs(targetX - currentX) > 0.01 ||
      Math.abs(targetY - currentY) > 0.01
    ) {
      currentX = lerp(currentX, targetX, 0.075);
      currentY = lerp(currentY, targetY, 0.075);

      requestAnimationFrame(() => {
        gallery.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
      });
    }
    requestAnimationFrame(animate);
  }
  animate();

  function handleDragStart(e) {
    if (!isZoomed) return;

    isDragging = true;
    dragLayer.classList.add("active");

    startX = e.type === "mousedown" ? e.pageX : e.touches[0].pageX;
    startY = e.type === "mousedown" ? e.pageY : e.touches[0].pageY;

    const transform = window.getComputedStyle(gallery).transform;
    const matrix = new DOMMatrix(transform);
    initialX = matrix.m41;
    initialY = matrix.m42;

    currentX = initialX;
    currentY = initialY;
    targetX = initialX;
    targetY = initialY;

    if (e.type === "mousedown") {
      document.addEventListener("mousemove", handleDragMove, {
        passive: false,
      });
      document.addEventListener("mouseup", handleDragEnd);
    } else {
      document.addEventListener("touchmove", handleDragMove, {
        passive: false,
      });
      document.addEventListener("touchend", handleDragEnd);
    }
  }

  function handleDragMove(e) {
    if (!isDragging) return;
    e.preventDefault();

    const currentPositionX =
      e.type === "mousemove" ? e.pageX : e.touches[0].pageX;
    const currentPositionY =
      e.type === "mousemove" ? e.pageY : e.touches[0].pageY;

    const deltaX = currentPositionX - startX;
    const deltaY = currentPositionY - startY;

    targetX = initialX + deltaX;
    targetY = initialY + deltaY;
  }

  function handleDragEnd() {
    isDragging = false;
    dragLayer.classList.remove("active");

    document.removeEventListener("mousemove", handleDragMove);
    document.removeEventListener("touchmove", handleDragMove);
    document.removeEventListener("mouseup", handleDragEnd);
    document.removeEventListener("touchend", handleDragEnd);
  }

  dragLayer.addEventListener("mousedown", handleDragStart);
  dragLayer.addEventListener("touchstart", handleDragStart);
});
