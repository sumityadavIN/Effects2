import gsap from "https://cdn.skypack.dev/gsap";
import { ScrollTrigger } from "https://cdn.skypack.dev/gsap/ScrollTrigger";
import Lenis from "https://unpkg.com/lenis@1.0.45/dist/lenis.mjs";

import * as THREE from "https://unpkg.com/three@0.152.0/build/three.module.js";
import { GLTFLoader } from "https://unpkg.com/three@0.152.0/examples/jsm/loaders/GLTFLoader.js";

gsap.registerPlugin(ScrollTrigger);

document.addEventListener("DOMContentLoaded", () => {
  const lenis = new Lenis();
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  const footerContainer = document.querySelector(".footer-container");

  const mouse = { x: 0, y: 0 };
  window.addEventListener("mousemove", (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  const container = document.getElementById("footer-canvas");
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    50,
    container.offsetWidth / container.offsetHeight,
    0.1,
    1000
  );
  camera.position.set(0, 0, 0.75);

  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
  });
  renderer.setSize(container.offsetWidth, container.offsetHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  container.appendChild(renderer.domElement);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 5);
  directionalLight.position.set(1, 1, 0);
  scene.add(directionalLight);

  const loader = new GLTFLoader();
  let model;
  let modelBaseRotationX = 0.5;
  let modelBaseZ = -1;

  loader.load("./public/model.glb", (gltf) => {
    model = gltf.scene;

    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    model.position.sub(center);
    model.position.y = 0;
    model.position.z = -1;
    model.rotation.x = 0.5;

    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 1 / maxDim;
    model.scale.setScalar(scale);

    scene.add(model);
  });

  ScrollTrigger.create({
    trigger: "footer",
    start: "top bottom",
    end: "bottom bottom",
    scrub: true,
    onUpdate: (self) => {
      const progress = self.progress;
      const yValue = -35 * (1 - progress);
      gsap.set(footerContainer, { y: `${yValue}%` });

      modelBaseZ = -1 * (1 - progress);
      modelBaseRotationX = 0.5 * (1 - progress);
    },
  });

  function animate() {
    requestAnimationFrame(animate);

    if (model) {
      const targetRotationY = mouse.x * 0.3;
      const targetRotationX = -mouse.y * 0.2 + modelBaseRotationX;

      model.rotation.y += (targetRotationY - model.rotation.y) * 0.05;
      model.rotation.x += (targetRotationX - model.rotation.x) * 0.05;
      model.position.z += (modelBaseZ - model.position.z) * 0.05;
    }

    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener("resize", () => {
    camera.aspect = container.offsetWidth / container.offsetHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.offsetWidth, container.offsetHeight);
  });
});
