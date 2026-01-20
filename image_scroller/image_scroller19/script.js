import { interiors } from "./data.js";

document.addEventListener("DOMContentLoaded", function () {
  const cursor = document.querySelector(".cursor");
  const gallery = document.querySelector(".gallery");
  const numberOfItems = 60;
  const radius = 1100;
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;
  const angleIncrement = (2 * Math.PI) / numberOfItems;

  for (let i = 0; i < numberOfItems; i++) {
    const item = document.createElement("div");
    item.className = "item";
    const p = document.createElement("p");
    const count = document.createElement("span");
    p.textContent = interiors[i].name;
    count.textContent = `(${Math.floor(Math.random() * 50) + 1})`;
    item.appendChild(p);
    p.appendChild(count);
    gallery.appendChild(item);

    const angle = i * angleIncrement;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    const rotation = (angle * 180) / Math.PI;

    gsap.set(item, {
      x: x + "px",
      y: y + "px",
      rotation: rotation,
    });

    item.addEventListener("mouseover", function () {
      const imgSrc = `./assets/img${i + 1}.jpg`;
      const img = document.createElement("img");
      img.src = imgSrc;
      img.style.clipPath = " polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)";
      cursor.appendChild(img);

      gsap.to(img, {
        clipPath: "polygon(0% 100%, 100% 100%, 100% 0%, 0% 0%)",
        duration: 1,
        ease: "power3.out",
      });
    });

    item.addEventListener("mouseout", function () {
      const imgs = cursor.getElementsByTagName("img");
      if (imgs.length) {
        const lastImg = imgs[imgs.length - 1];
        Array.from(imgs).forEach((img, index) => {
          if (img !== lastImg) {
            gsap.to(img, {
              clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
              duration: 1,
              delay: 0.5,
              ease: "power3.out",
              onComplete: () => {
                setTimeout(() => {
                  img.remove();
                }, 1000);
              },
            });
          }
        });

        gsap.to(lastImg, {
          clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
          duration: 1,
          ease: "power3.out",
          delay: 0.25,
        });
      }
    });
  }

  function updatePosition() {
    const scrollAmount = window.scrollY * 0.0001;
    document.querySelectorAll(".item").forEach(function (item, index) {
      const angle = index * angleIncrement + scrollAmount;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      const rotation = (angle * 180) / Math.PI;

      gsap.to(item, {
        duration: 0.05,
        x: x + "px",
        y: y + "px",
        rotation: rotation,
        ease: "elastic.out(1,0.3)",
      });
    });
  }

  updatePosition();
  document.addEventListener("scroll", updatePosition);

  document.addEventListener("mousemove", function (e) {
    gsap.to(cursor, {
      x: e.clientX - 150,
      y: e.clientY - 200,
      duration: 1,
      ease: "power3.out",
    });
  });
});
