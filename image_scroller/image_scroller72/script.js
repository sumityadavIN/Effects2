import gsap from "https://esm.sh/gsap@3.12.5";
import products from "./products.js";

const productsContainer = document.querySelector(".products");
const productName = document.querySelector(".product-name p");
const productPreview = document.querySelector(".product-preview");
const previewName = document.querySelector(".product-preview-name p");
const previewImg = document.querySelector(".product-preview-img img");
const previewTag = document.querySelector(".product-preview-tag p");
const previewUrl = document.querySelector(".product-url .btn a");
const productBanner = document.querySelector(".product-banner");
const bannerImg = document.querySelector(".product-banner img");
const controllerInner = document.querySelector(".controller-inner");
const controllerOuter = document.querySelector(".controller-outer");
const closeIconSpans = document.querySelectorAll(".close-icon span");
const prevBtn = document.querySelector(".nav-btn.prev");
const nextBtn = document.querySelector(".nav-btn.next");

let currentProductIndex = 0;
let slideItems = [];
let isPreviewAnimating = false;
let isPreviewOpen = false;

const BUFFER_SIZE = 5;
const spacing = 0.375;
const slideWidth = spacing * 1000;

function addSlideItem(relativeIndex) {
  const productIndex =
    (((currentProductIndex + relativeIndex) % products.length) +
      products.length) %
    products.length;
  const product = products[productIndex];

  const li = document.createElement("li");
  li.innerHTML = `<img src="${product.img}" alt="${product.name}" />`;
  li.dataset.relativeIndex = relativeIndex;

  gsap.set(li, {
    x: relativeIndex * slideWidth,
    scale: relativeIndex === 0 ? 1.25 : 0.75,
    zIndex: relativeIndex === 0 ? 100 : 1,
  });

  productsContainer.appendChild(li);
  slideItems.push({ element: li, relativeIndex: relativeIndex });
}

function removeSlideItem(relativeIndex) {
  const itemIndex = slideItems.findIndex(
    (item) => item.relativeIndex === relativeIndex
  );
  if (itemIndex !== -1) {
    const item = slideItems[itemIndex];
    item.element.remove();
    slideItems.splice(itemIndex, 1);
  }
}

function updateSliderPosition() {
  slideItems.forEach((item) => {
    const isActive = item.relativeIndex === 0;
    gsap.to(item.element, {
      x: item.relativeIndex * slideWidth,
      scale: isActive ? 1.25 : 0.75,
      zIndex: isActive ? 100 : 1,
      duration: 0.75,
      ease: "power3.out",
    });
  });
}

function updateProductName() {
  const actualIndex =
    ((currentProductIndex % products.length) + products.length) %
    products.length;
  productName.textContent = products[actualIndex].name;
}

function updatePreviewContent() {
  const actualIndex =
    ((currentProductIndex % products.length) + products.length) %
    products.length;
  const currentProduct = products[actualIndex];
  previewName.textContent = currentProduct.name;
  previewImg.src = currentProduct.img;
  previewImg.alt = currentProduct.name;
  previewTag.textContent = currentProduct.tag;
  previewUrl.href = currentProduct.url;
  bannerImg.src = currentProduct.img;
  bannerImg.alt = currentProduct.name;
}

function moveNext() {
  if (isPreviewAnimating || isPreviewOpen) return;

  currentProductIndex++;
  removeSlideItem(-BUFFER_SIZE);
  slideItems.forEach((item) => {
    item.relativeIndex--;
    item.element.dataset.relativeIndex = item.relativeIndex;
  });
  addSlideItem(BUFFER_SIZE);
  updateSliderPosition();
  updateProductName();
  updatePreviewContent();
}

function movePrev() {
  if (isPreviewAnimating || isPreviewOpen) return;

  currentProductIndex--;
  removeSlideItem(BUFFER_SIZE);
  slideItems.forEach((item) => {
    item.relativeIndex++;
    item.element.dataset.relativeIndex = item.relativeIndex;
  });
  addSlideItem(-BUFFER_SIZE);
  updateSliderPosition();
  updateProductName();
  updatePreviewContent();
}

function updateButtonStates() {
  if (isPreviewAnimating || isPreviewOpen) {
    prevBtn.classList.add("disabled");
    nextBtn.classList.add("disabled");
  } else {
    prevBtn.classList.remove("disabled");
    nextBtn.classList.remove("disabled");
  }
}

function getActiveSlide() {
  return slideItems.find((item) => item.relativeIndex === 0);
}

function animateSideItems(hide = false) {
  const activeSlide = getActiveSlide();

  slideItems.forEach((item) => {
    const absIndex = Math.abs(item.relativeIndex);
    if (absIndex === 1 || absIndex === 2) {
      gsap.to(item.element, {
        x: hide
          ? item.relativeIndex * slideWidth * 1.5
          : item.relativeIndex * slideWidth,
        opacity: hide ? 0 : 1,
        duration: 0.75,
        ease: "power3.inOut",
      });
    }
  });

  if (activeSlide) {
    gsap.to(activeSlide.element, {
      scale: hide ? 0.75 : 1.25,
      opacity: hide ? 0 : 1,
      duration: 0.75,
      ease: "power3.inOut",
    });
  }
}

function animateControllerTransition(opening = false) {
  const navEls = [".controller-label p", ".nav-btn"];

  gsap.to(navEls, {
    opacity: opening ? 0 : 1,
    duration: 0.2,
    ease: "power3.out",
    delay: opening ? 0 : 0.4,
  });

  gsap.to(controllerOuter, {
    clipPath: opening ? "circle(0% at 50% 50%)" : "circle(50% at 50% 50%)",
    duration: 0.75,
    ease: "power3.inOut",
  });

  gsap.to(controllerInner, {
    clipPath: opening ? "circle(50% at 50% 50%)" : "circle(40% at 50% 50%)",
    duration: 0.75,
    ease: "power3.inOut",
  });

  gsap.to(closeIconSpans, {
    width: opening ? "20px" : "0px",
    duration: opening ? 0.4 : 0.3,
    ease: opening ? "power3.out" : "power3.in",
    stagger: opening ? 0.1 : 0.05,
    delay: opening ? 0.2 : 0,
  });
}

function togglePreview() {
  if (isPreviewAnimating) return;

  isPreviewAnimating = true;
  updateButtonStates();

  if (!isPreviewOpen) updatePreviewContent();

  gsap.to(productPreview, {
    y: isPreviewOpen ? "100%" : "-50%",
    duration: 0.75,
    ease: "power3.inOut",
  });
  gsap.to(productBanner, {
    opacity: isPreviewOpen ? 0 : 1,
    duration: 0.4,
    delay: isPreviewOpen ? 0 : 0.25,
    ease: "power3.inOut",
  });

  animateSideItems(!isPreviewOpen);
  animateControllerTransition(!isPreviewOpen);

  setTimeout(() => {
    isPreviewAnimating = false;
    isPreviewOpen = !isPreviewOpen;
    updateButtonStates();
  }, 600);
}

function initializeSlider() {
  for (let i = -BUFFER_SIZE; i <= BUFFER_SIZE; i++) {
    addSlideItem(i);
  }
  updateSliderPosition();
  updateProductName();
  updatePreviewContent();
  updateButtonStates();
}

prevBtn.addEventListener("click", movePrev);
nextBtn.addEventListener("click", moveNext);
controllerInner.addEventListener("click", togglePreview);

initializeSlider();
