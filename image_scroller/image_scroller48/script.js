function generateRandomName() {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_";
  const nameLength = Math.floor(Math.random() * 3) + 6;

  let randomName = "";
  for (let i = 0; i < nameLength; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomName += characters.charAt(randomIndex);
  }

  return randomName + ".jpeg";
}

function generateRandomImageName() {
  const imageNumber = Math.floor(Math.random() * 40) + 1;
  return `img${imageNumber}.jpeg`;
}

document.addEventListener("DOMContentLoaded", function () {
  const galleryContainer = document.querySelector(".gallery");
  const imgModal = document.querySelector(".img-modal");
  const imgViewContainer = imgModal.querySelector(".img");
  const modalName = imgModal.querySelector(".img-name p");

  const tl = gsap.timeline({ paused: true });
  let clickedItemImgSrc = "";
  let clickedItemName = "";

  for (let i = 1; i <= 80; i++) {
    const item = document.createElement("div");
    item.classList.add("item");

    const itemImg = document.createElement("div");
    itemImg.classList.add("item-img");

    const imgTag = document.createElement("img");
    const randomImageName = generateRandomImageName();
    imgTag.src = `./assets/${randomImageName}`;
    itemImg.appendChild(imgTag);

    const itemName = document.createElement("div");
    itemName.classList.add("item-name");
    const randomName = generateRandomName();
    itemName.innerHTML = `<p>${randomName}</p>`;
    itemName.setAttribute("data-img", randomImageName.replace(".jpeg", ""));

    item.appendChild(itemImg);
    item.appendChild(itemName);

    item.addEventListener("click", () => {
      const dataImg = itemName.getAttribute("data-img");
      if (imgViewContainer && modalName) {
        clickedItemImgSrc = `./assets/${dataImg}.jpeg`;
        clickedItemName = itemName.textContent;
        imgViewContainer.innerHTML = `<img src="${clickedItemImgSrc}" alt="" />`;
        modalName.textContent = clickedItemName;
        tl.reversed(!tl.reversed());
      }
    });

    galleryContainer.appendChild(item);
  }

  const closeBtn = document.querySelector(".close-btn");
  if (closeBtn) {
    closeBtn.addEventListener("click", function () {
      tl.reversed(!tl.reversed());
    });
  }

  function revealModal() {
    tl.to(".img-modal", 0.75, {
      clipPath: "polygon(0 0%, 100% 0%, 100% 100%, 0% 100%)",
      ease: "power4.inOut",
      pointerEvents: "auto",
    });

    tl.to(".gallery, .container", 0.01, {
      pointerEvents: "none",
    });

    tl.to(".img-modal .img", 0.75, {
      clipPath: "polygon(0 0%, 100% 0%, 100% 100%, 0% 100%)",
      ease: "power4.inOut",
    });

    tl.to(
      ".modal-item p",
      1,
      {
        top: 0,
        ease: "power4.inOut",
        stagger: {
          amount: 0.2,
        },
      },
      "<"
    ).reverse();
  }

  revealModal();
});
