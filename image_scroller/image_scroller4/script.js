const container = document.querySelector(".container");
let program;
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let targetMouseX = mouseX;
let targetMouseY = mouseY;
let texture = null;
let targetX = 0;
let targetY = 0;
let currentX = 0;
let currentY = 0;

// Cache for image geometry
let imageGeometries = [];

const imgSources = Array.from(
  { length: 25 },
  (_, i) => `./assets/img${i + 1}.jpg`
);

function getRandomImage() {
  return imgSources[Math.floor(Math.random() * imgSources.length)];
}

function createImageGrid() {
  for (let i = 0; i < 300; i++) {
    const wrapper = document.createElement("div");
    wrapper.className = "img-wrapper";

    const img = document.createElement("img");
    img.src = getRandomImage();
    img.alt = "Grid item";

    wrapper.appendChild(img);
    container.appendChild(wrapper);
  }
}

// Calculate and cache the position and size of every image relative to the container
function cacheLayout() {
  imageGeometries = [];
  const images = container.getElementsByTagName("img");
  const containerRect = container.getBoundingClientRect(); // Get absolute container pos once

  // We need positions relative to the container's un-transformed state.
  // However, since the container moves, we can just get the offset relative to the container.
  // simpler: Get the wrapper's offsetTop/Left. 
  // Since images are 100% of wrapper, wrapper pos is image pos.

  const wrappers = container.getElementsByClassName("img-wrapper");

  for (let wrapper of wrappers) {
    // offsetLeft/Top are relative to the nearest positioned ancestor (the container)
    imageGeometries.push({
      img: wrapper.querySelector("img"),
      left: wrapper.offsetLeft,
      top: wrapper.offsetTop,
      width: wrapper.offsetWidth,
      height: wrapper.offsetHeight
    });
  }
}

function updatePan(mouseX, mouseY) {
  const maxX = container.offsetWidth - window.innerWidth;
  const maxY = container.offsetHeight - window.innerHeight;

  targetX = -((mouseX / window.innerWidth) * maxX * 0.35);
  targetY = -((mouseY / window.innerHeight) * maxY * 0.35);
}

const canvas = document.querySelector("canvas");
const gl = canvas.getContext("webgl", {
  preserveDrawingBuffer: false,
  antialias: true,
  alpha: true,
});

function setupWebGL() {
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
}

function createShader(type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("Shader compilation error:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

async function loadShaders() {
  try {
    const [vertexResponse, fragmentResponse] = await Promise.all([
      fetch("./shaders/vertex.glsl?t=" + Date.now()),
      fetch("./shaders/fragment.glsl?t=" + Date.now()),
    ]);

    const vertexSource = await vertexResponse.text();
    const fragmentSource = await fragmentResponse.text();

    return { vertexSource, fragmentSource };
  } catch (error) {
    console.error("Error loading shaders:", error);
    throw error;
  }
}

async function initWebGL() {
  setupWebGL();

  const { vertexSource, fragmentSource } = await loadShaders();
  const vertexShader = createShader(gl.VERTEX_SHADER, vertexSource);
  const fragmentShader = createShader(gl.FRAGMENT_SHADER, fragmentSource);

  program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  gl.useProgram(program);

  const vertices = new Float32Array([
    -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0,
  ]);
  const vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  const positionLocation = gl.getAttribLocation(program, "aPosition");
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  texture = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);

  const iChannel0Location = gl.getUniformLocation(program, "iChannel0");
  gl.uniform1i(iChannel0Location, 0);
}


// Re-use canvas to avoid GC thrashing
const tempCanvas = document.createElement("canvas");
const tempCtx = tempCanvas.getContext("2d", { alpha: false });

function updateTexture() {
  const scale = 1;

  if (tempCanvas.width !== Math.floor(window.innerWidth * scale) ||
    tempCanvas.height !== Math.floor(window.innerHeight * scale)) {
    tempCanvas.width = Math.floor(window.innerWidth * scale);
    tempCanvas.height = Math.floor(window.innerHeight * scale);
  }

  tempCtx.imageSmoothingEnabled = true;
  tempCtx.imageSmoothingQuality = "medium";
  tempCtx.fillStyle = "white"; // Background color
  tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

  /* 
     Optimization: 
     Instead of reading DOM (getComputedStyle/getBoundingClientRect), 
     we use the calculated 'currentX' and 'currentY' and cached 'imageGeometries'.
     
     The container is translated by (currentX, currentY).
     So an image at (img.left, img.top) inside the container 
     will be at (img.left + currentX, img.top + currentY) on the viewport.
  */

  // We are drawing onto tempCanvas which represents the viewport.
  // We need to simulate the container's transform.

  // Note: tempCtx transform applies to subsequent drawImage calls.
  // If we setTransform(1, 0, 0, 1, currentX, currentY), 
  // then drawing an image at (left, top) will put it at (left+currentX, top+currentY).
  // This matches the visual result of the CSS transform.

  tempCtx.setTransform(scale, 0, 0, scale, currentX * scale, currentY * scale);

  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  // Render Check: Culling
  // Image 'world' position is:
  // x = geom.left + currentX
  // y = geom.top + currentY
  // Check intersection with (0, 0, viewportWidth, viewportHeight)

  // Ensure layout is cached
  if (imageGeometries.length === 0) {
    cacheLayout();
  }

  /*
  // Culling removed for debugging. Drawing all images.
  for (let geom of imageGeometries) {
    // Simply draw all images to verify position
    if (geom.img.complete) {
        tempCtx.drawImage(
            geom.img,
            geom.left,
            geom.top,
            geom.width,
            geom.height
        );
    }
  }
  */

  for (let geom of imageGeometries) {
    const drawX = geom.left + currentX;
    const drawY = geom.top + currentY;

    // Simple AABB intersection test
    if (
      drawX + geom.width > 0 &&
      drawX < viewportWidth &&
      drawY + geom.height > 0 &&
      drawY < viewportHeight
    ) {
      // Image is visible, draw it!
      // We draw it at its LOCAL position (geom.left, geom.top) 
      // because we already set the context transform to handle the container offset.
      if (geom.img.complete) {
        tempCtx.drawImage(
          geom.img,
          geom.left,
          geom.top,
          geom.width,
          geom.height
        );
      }
    }
  }

  // Reset transform for standard operations if needed (not strictly needed here since we reset next frame)
  tempCtx.setTransform(1, 0, 0, 1, 0, 0);

  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    tempCanvas
  );

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
}

function render() {
  const ease = 0.075; // Slightly adjusted for smoother feel with new logic

  // 1. Update Pan Logic (formerly animatePan)
  currentX += (targetX - currentX) * ease;
  currentY += (targetY - currentY) * ease;

  // Update DOM transform effectively (for accessibility/inspector mostly, OR purely via canvas)
  // OPTION: If we are fully rendering to Canvas, we technically don't HAVE to update the DOM container 
  // if we are hiding the DOM images.
  // HOWEVER, we might want to keep it sync'd if we want the layout logic to remain consistent 
  // (though we cached it, so we don't rely on live layout anymore).
  // Let's keep updating it just in case, but using style.transform is fast enough if we don't read it back.
  container.style.transform = `translate(${currentX}px, ${currentY}px)`;


  // 2. Update Mouse Logic
  mouseX += (targetMouseX - mouseX) * ease;
  mouseY += (targetMouseY - mouseY) * ease;

  // 3. Render WebGL
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  gl.viewport(0, 0, canvas.width, canvas.height);

  updateTexture();

  const resolutionLocation = gl.getUniformLocation(program, "iResolution");
  const mouseLocation = gl.getUniformLocation(program, "iMouse");

  gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
  gl.uniform2f(mouseLocation, mouseX, canvas.height - mouseY);

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  requestAnimationFrame(render);
}

function setupEventListeners() {
  document.addEventListener("mousemove", (e) => {
    targetMouseX = e.clientX;
    targetMouseY = e.clientY;
    updatePan(e.clientX, e.clientY);
  });

  window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);

    targetMouseX = window.innerWidth / 2;
    targetMouseY = window.innerHeight / 2;
    mouseX = targetMouseX;
    mouseY = targetMouseY;

    targetX = 0;
    targetY = 0;
    currentX = 0;
    currentY = 0;

    // Recalculate layout on resize
    cacheLayout();
  });
}

async function init() {
  createImageGrid();

  const firstImage = container.querySelector("img");

  // Wait for at least one image to assume layout is ready? 
  // Better: Wait for images to load before caching layout?
  // Since we use <img> tags in the DOM, we need them to have dimensions.
  // CSS defines dimensions (.img-wrapper is width: 100%, taking grid-template-columns).
  // Grid relies on viewport width mostly (fr units).

  // We'll force a layout calculation now.

  const waitForImages = new Promise((resolve) => {
    if (firstImage.complete) {
      resolve();
    } else {
      firstImage.onload = resolve;
    }
  });

  await waitForImages;

  // Small delay to ensure styles applied and layout stable
  await new Promise(r => setTimeout(r, 100));

  cacheLayout();

  await initWebGL();
  setupEventListeners();
  // Removed animatePan() call, merged into render()
  render();
}

init();
