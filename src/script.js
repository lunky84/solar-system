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
  starParticles: true,
};

gui.add(options, "speed", 1, 6, 1).name("Speed");
gui.add(options, "axesHelper").name("AxesHelper");
gui.add(options, "starParticles").name("Star Particles");
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
 * Textures
 */
const textureLoader = new THREE.TextureLoader();
const particleTexture = textureLoader.load("/textures/particles/1.png");

/**
 * Particles
 */
const v = new THREE.Vector3();

function randomPointInSphere(radius) {
  const x = THREE.Math.randFloat(-1, 1);
  const y = THREE.Math.randFloat(-1, 1);
  const z = THREE.Math.randFloat(-1, 1);
  const normalizationFactor = 1 / Math.sqrt(x * x + y * y + z * z);

  v.x = x * normalizationFactor * radius;
  v.y = y * normalizationFactor * radius;
  v.z = z * normalizationFactor * radius;

  return v;
}

const particlesGeometry = new THREE.BufferGeometry();

var positions = [];

for (var i = 0; i < 5000; i++) {
  var vertex = randomPointInSphere(500);
  positions.push(vertex.x, vertex.y, vertex.z);
}

particlesGeometry.setAttribute(
  "position",
  new THREE.Float32BufferAttribute(positions, 3)
);

const particlesMaterial = new THREE.PointsMaterial({
  color: 0xffffff,
  size: Math.random(),
});

particlesMaterial.sizeAttenuation = true;

particlesMaterial.color = new THREE.Color("#ffffff");

particlesMaterial.transparent = true;
particlesMaterial.alphaMap = particleTexture;
// particlesMaterial.alphaTest = 0.01
// particlesMaterial.depthTest = false
particlesMaterial.depthWrite = false;
particlesMaterial.blending = THREE.AdditiveBlending;

const starParticles = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(starParticles);

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

const ambientLight = new THREE.AmbientLight(0xffffff, options.ambientLight);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 1);
scene.add(pointLight);

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.01,
  1000
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
sun.name = "sun";
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
earth.name = "earth";

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
moon.name = "moon";

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

  if (options.starParticles) {
    scene.add(starParticles);
  } else {
    scene.remove(starParticles);
  }

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

canvas.addEventListener("click", function (event) {
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // update the picking ray with the camera and pointer position
  raycaster.setFromCamera(pointer, camera);

  // calculate objects intersecting the picking ray

  const clickableObjects = [
    scene.getObjectByName("sun"),
    scene.getObjectByName("earth"),
    scene.getObjectByName("moon"),
  ];
  const intersects = raycaster.intersectObjects(clickableObjects);

  console.log(intersects);
  if (intersects.length) {
    console.log(intersects[0].object.name);
  }

  // Change color example works with MeshBasicMaterial
  // for (let i = 0; i < intersects.length; i++) {
  //   intersects[i].object.material.color.set(0x00ff00);
  // }

  renderer.render(scene, camera);
});
