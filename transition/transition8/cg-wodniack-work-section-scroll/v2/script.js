document.addEventListener("DOMContentLoaded", async () => {
  const lenis = new Lenis();
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  const workSection = document.querySelector(".work");

  const lerp = (start, end, t) => start + (end - start) * t;

  const gridCanvas = document.createElement("canvas");
  gridCanvas.id = "grid-canvas";
  workSection.appendChild(gridCanvas);
  const gridCtx = gridCanvas.getContext("2d");

  const resizeGridCanvas = () => {
    const dpr = window.devicePixelRatio || 1;
    [gridCanvas.width, gridCanvas.height] = [
      window.innerWidth * dpr,
      window.innerHeight * dpr,
    ];
    [gridCanvas.style.width, gridCanvas.style.height] = [
      `${window.innerWidth}px`,
      `${window.innerHeight}px`,
    ];
    gridCtx.scale(dpr, dpr);
  };
  resizeGridCanvas();

  const drawGrid = (scrollProgress = 0) => {
    gridCtx.fillStyle = "black";
    gridCtx.fillRect(0, 0, gridCanvas.width, gridCanvas.height);
    gridCtx.fillStyle = "#f40c3f";
    const [dotSize, spacing] = [0.75, 20];
    const [rows, cols] = [
      Math.ceil(gridCanvas.height / spacing),
      Math.ceil(gridCanvas.width / spacing) + 15,
    ];
    const offset = (scrollProgress * spacing * 10) % spacing;

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        gridCtx.beginPath();
        gridCtx.arc(x * spacing - offset, y * spacing, dotSize, 0, Math.PI * 2);
        gridCtx.fill();
      }
    }
  };

  const lettersScene = new THREE.Scene();
  const cardsScene = new THREE.Scene();

  const createCamera = () =>
    new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

  const lettersCamera = createCamera();
  const cardsCamera = createCamera();

  const lettersRenderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
  });
  lettersRenderer.setSize(window.innerWidth, window.innerHeight);
  lettersRenderer.setClearColor(0x000000, 0);
  lettersRenderer.setPixelRatio(window.devicePixelRatio);
  lettersRenderer.domElement.id = "letters-canvas";

  const cardsRenderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
  });
  cardsRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  cardsRenderer.setSize(window.innerWidth, window.innerHeight);
  cardsRenderer.setClearColor(0x000000, 0);
  cardsRenderer.domElement.id = "cards-canvas";

  workSection.appendChild(lettersRenderer.domElement);
  workSection.appendChild(cardsRenderer.domElement);

  const createTextAnimationPath = (yPos, amplitude) => {
    const points = [];
    for (let i = 0; i <= 20; i++) {
      const t = i / 20;
      points.push(
        new THREE.Vector3(
          -25 + 50 * t,
          yPos + Math.sin(t * Math.PI) * -amplitude,
          (1 - Math.pow(Math.abs(t - 0.5) * 2, 2)) * -5
        )
      );
    }
    const curve = new THREE.CatmullRomCurve3(points);
    const line = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(curve.getPoints(100)),
      new THREE.LineBasicMaterial({ color: 0x000, linewidth: 1 })
    );
    line.curve = curve;
    return line;
  };

  const paths = [
    createTextAnimationPath(10, 2),
    createTextAnimationPath(3.5, 1),
    createTextAnimationPath(-3.5, -1),
    createTextAnimationPath(-10, -2),
  ];
  paths.forEach((line) => lettersScene.add(line));

  const textContainer = document.querySelector(".text-container");
  const letterPositions = new Map();
  paths.forEach((line, i) => {
    line.letterElements = Array.from({ length: 15 }, () => {
      const el = document.createElement("div");
      el.className = "letter";
      el.textContent = ["W", "O", "R", "K"][i];
      textContainer.appendChild(el);
      letterPositions.set(el, {
        current: { x: 0, y: 0 },
        target: { x: 0, y: 0 },
      });
      return el;
    });
  });

  const loadImage = (num) =>
    new Promise((resolve) => {
      const texture = new THREE.TextureLoader().load(
        `assets/img${num}.jpg`,
        (loadedTexture) => {
          Object.assign(loadedTexture, {
            generateMipmaps: true,
            minFilter: THREE.LinearMipmapLinearFilter,
            magFilter: THREE.LinearFilter,
            anisotropy: cardsRenderer.capabilities.getMaxAnisotropy(),
          });
          resolve(loadedTexture);
        }
      );
    });

  const images = await Promise.all([1, 2, 3, 4, 5, 6, 7].map(loadImage));

  const textureCanvas = document.createElement("canvas");
  const ctx = textureCanvas.getContext("2d");
  [textureCanvas.width, textureCanvas.height] = [4096, 2048];

  const drawCardsOnCanvas = (offset = 0) => {
    ctx.clearRect(0, 0, textureCanvas.width, textureCanvas.height);
    const [cardWidth, cardHeight] = [
      textureCanvas.width / 3,
      textureCanvas.height / 2,
    ];
    const spacing = textureCanvas.width / 2.5;
    images.forEach((img, i) => {
      if (img?.image) {
        ctx.drawImage(
          img.image,
          i * spacing + (0.35 - offset) * textureCanvas.width * 5 - cardWidth,
          (textureCanvas.height - cardHeight) / 2,
          cardWidth,
          cardHeight
        );
      }
    });
  };

  const cardsTexture = new THREE.CanvasTexture(textureCanvas);
  Object.assign(cardsTexture, {
    generateMipmaps: true,
    minFilter: THREE.LinearMipmapLinearFilter,
    magFilter: THREE.LinearFilter,
    anisotropy: cardsRenderer.capabilities.getMaxAnisotropy(),
    wrapS: THREE.RepeatWrapping,
    wrapT: THREE.RepeatWrapping,
  });

  const cardsPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(30, 15, 50, 1),
    new THREE.MeshBasicMaterial({
      map: cardsTexture,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 1,
      depthTest: false,
      depthWrite: false,
    })
  );
  cardsScene.add(cardsPlane);

  const positions = cardsPlane.geometry.attributes.position;
  for (let i = 0; i < positions.count; i++) {
    positions.setZ(i, Math.pow(positions.getX(i) / 15, 2) * 5);
  }
  positions.needsUpdate = true;

  [lettersCamera, cardsCamera].forEach((camera) => camera.position.setZ(20));

  const lineSpeedMultipliers = [0.8, 1, 0.7, 0.9];
  const updateTargetPositions = (scrollProgress = 0) => {
    paths.forEach((line, lineIndex) => {
      line.letterElements.forEach((element, i) => {
        const point = line.curve.getPoint(
          (i / 14 + scrollProgress * lineSpeedMultipliers[lineIndex]) % 1
        );
        const vector = point.clone().project(lettersCamera);
        const positions = letterPositions.get(element);
        positions.target = {
          x: (-vector.x * 0.5 + 0.5) * window.innerWidth,
          y: (-vector.y * 0.5 + 0.5) * window.innerHeight,
        };
      });
    });
  };

  const updateLetterPositions = () => {
    letterPositions.forEach((positions, element) => {
      const distX = positions.target.x - positions.current.x;
      if (Math.abs(distX) > window.innerWidth * 0.7) {
        [positions.current.x, positions.current.y] = [
          positions.target.x,
          positions.target.y,
        ];
      } else {
        positions.current.x = lerp(
          positions.current.x,
          positions.target.x,
          0.07
        );
        positions.current.y = lerp(
          positions.current.y,
          positions.target.y,
          0.07
        );
      }
      element.style.transform = `translate(-50%, -50%) translate3d(${positions.current.x}px, ${positions.current.y}px, 0px)`;
    });
  };

  const animate = () => {
    updateLetterPositions();
    lettersRenderer.render(lettersScene, lettersCamera);
    cardsRenderer.render(cardsScene, cardsCamera);
    requestAnimationFrame(animate);
  };

  ScrollTrigger.create({
    trigger: ".work",
    start: "top top",
    end: "+=700%",
    pin: true,
    pinSpacing: true,
    scrub: 1,
    onUpdate: (self) => {
      updateTargetPositions(self.progress);
      drawCardsOnCanvas(self.progress);
      drawGrid(self.progress);
      cardsTexture.needsUpdate = true;
    },
  });

  drawGrid(0);
  animate();
  updateTargetPositions(0);

  window.addEventListener("resize", () => {
    resizeGridCanvas();
    drawGrid(ScrollTrigger.getAll()[0]?.progress || 0);
    [lettersCamera, cardsCamera].forEach((camera) => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    });
    [lettersRenderer, cardsRenderer].forEach((renderer) => {
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
    cardsRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    updateTargetPositions(ScrollTrigger.getAll()[0]?.progress || 0);
  });
});
