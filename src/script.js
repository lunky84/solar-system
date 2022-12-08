import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";

/**
 * Base
 */
const gui = new GUI();

const options = {
  speed: 1,
  ambientLight: 0.3,
  axesHelper: true,
};

gui.add(options, "speed", 1, 6, 1).name("Speed");
gui.add(options, "axesHelper").name("AxesHelper");
gui.add(options, "ambientLight", 0, 1, 0.1).name("Ambient light");

// How many seconds to complete 1x earth rotation
const speedIndex = {
  1: 24,
  2: 5,
  3: 1,
  4: 0.5,
  5: 0.1,
  6: 0.01,
};

/**
 * Base
 */

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

const axesHelper = new THREE.AxesHelper(25);
scene.add(axesHelper);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Lights
 */

const ambientLight = new THREE.AmbientLight(0xfffffff, options.ambientLight);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xfffffff, 1);
scene.add(pointLight);

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.x = 10;
camera.position.y = 0;
camera.position.z = 10;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.minDistance = 3;
controls.maxDistance = 50;
controls.enableDamping = true;

/**
 * Sun
 */
const sunTexture = new THREE.TextureLoader().load("textures/2k_sun.jpeg");

const sun = new THREE.Mesh(
  new THREE.SphereGeometry(1.5, 100, 100),
  new THREE.MeshBasicMaterial({ map: sunTexture })
);
scene.add(sun);

/**
 * Earth
 */
const earthOrbitGroup = new THREE.Group();

const geometry = new THREE.SphereGeometry(1, 100, 100);
const texture = new THREE.TextureLoader().load("textures/2k_earth_daymap.jpeg");

const material = new THREE.MeshStandardMaterial({
  map: texture,
});
const earth = new THREE.Mesh(geometry, material);
earth.position.x = 10;

earthOrbitGroup.add(earth);

/**
 * Moon
 */
const moonOrbitGroup = new THREE.Group();

moonOrbitGroup.position.x = 10;

const moonTexture = new THREE.TextureLoader().load("textures/2k_moon.jpeg");

const moonMaterial = new THREE.MeshStandardMaterial({
  map: moonTexture,
});
const moon = new THREE.Mesh(
  new THREE.SphereGeometry(0.2, 100, 100),
  moonMaterial
);
moon.position.x = 3;

moonOrbitGroup.add(moon);
earthOrbitGroup.add(moonOrbitGroup);

scene.add(earthOrbitGroup);

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();
let lastElapsedTime = 0;

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - lastElapsedTime;
  lastElapsedTime = elapsedTime;

  // Update controls
  controls.update();

  // Animate sphere
  sun.rotation.y +=
    ((Math.PI * 2) / (speedIndex[options.speed] * 27)) * deltaTime;

  earthOrbitGroup.rotation.y +=
    ((Math.PI * 2) / (speedIndex[options.speed] * 365)) * deltaTime;

  earth.rotation.y += ((Math.PI * 2) / speedIndex[options.speed]) * deltaTime;

  moonOrbitGroup.rotation.y +=
    ((Math.PI * 2) / (speedIndex[options.speed] * 27.3)) * deltaTime;

  ambientLight.intensity = options.ambientLight;

  if (options.axesHelper) {
    scene.add(axesHelper);
  } else {
    scene.remove(axesHelper);
  }

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
