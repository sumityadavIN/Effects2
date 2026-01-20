const imgNames = document.querySelectorAll(".img-name");
const imgPreviewContainer = document.querySelector(".img-preview-container");
const imgViewContainer = document.querySelector(".img-modal .img-view");
const closeBtn = document.querySelector(".close-btn");
const modalName = document.querySelector(".modal-name");
const tl = gsap.timeline({ paused: true });

imgNames.forEach((imgName) => {
  imgName.addEventListener("mouseover", () => {
    const dataImg = imgName.getAttribute("data-img");
    imgPreviewContainer.innerHTML = `<img src="./assets/${dataImg}.jpeg" alt="" />`;
  });

  imgName.addEventListener("click", () => {
    const dataImg = imgName.getAttribute("data-img");
    imgViewContainer.innerHTML = `<img src="./assets/${dataImg}.jpeg" alt="" />`;
    const name = imgName.querySelector(".name").textContent;
    modalName.textContent = name;
    tl.reversed(!tl.reversed());
  });
});

closeBtn.onclick = function (e) {
  tl.reversed(!tl.reversed());
};

function revealMenuItems() {
  tl.to(".img-name .name", 1, {
    top: "30px",
    ease: "power4.inOut",
  });

  tl.to(
    ".img-preview-container",
    1,
    {
      clipPath: "polygon(0 100%, 100% 100%, 100% 100%, 0 100%)",
      y: 25,
      ease: "power4.inOut",
    },
    "<"
  );

  tl.to(".img-modal", 0.005, {
    opacity: 1,
    ease: "none",
    pointerEvents: "auto",
    delay: -0.125,
  });

  tl.to(
    ".img-view",
    1,
    {
      clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
      y: 25,
      ease: "power4.inOut",
    },
    "<"
  );

  tl.to(
    ".close-btn .btn",
    1,
    {
      top: "0",
      ease: "power4.inOut",
    },
    "<"
  );

  tl.to(
    ".modal-name",
    1,
    {
      top: "0",
      ease: "power4.inOut",
    },
    "<"
  ).reverse();
}

revealMenuItems();
