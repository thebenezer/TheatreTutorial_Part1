import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import { getProject, types } from '@theatre/core';
import studio from '@theatre/studio';
studio.initialize();

// Create a project for the animation
const project = getProject('TheatreTutorial_1');

// Create a sheet
const sheet = project.sheet('AnimationScene');

let controls: OrbitControls;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let scene: THREE.Scene;

init();
requestAnimationFrame(tick);

function init() {
  // Camera
  camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    10,
    200,
  );
  camera.position.set(40, 10, 40);

  // Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x292929);

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.autoUpdate = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.render(scene, camera);
  document.body.appendChild(renderer.domElement);

  setupLights();
  setupOrbitControls();
  setupEventListeners();

  // ***** setup our scene *******

  // Box
  const geometry = new THREE.BoxGeometry(10, 10, 10);
  const material = new THREE.MeshPhongMaterial({ color: 0x049ef4 });

  const box = new THREE.Mesh(geometry, material);
  box.castShadow = true;
  box.receiveShadow = true;
  scene.add(box);

  const planeGeometry = new THREE.CircleGeometry(30, 50);
  const planeMaterial = new THREE.MeshPhongMaterial({ color: 0xf0f0f0 });

  const floor = new THREE.Mesh(planeGeometry, planeMaterial);
  floor.rotateX(-Math.PI / 2);
  floor.receiveShadow = true;
  scene.add(floor);

  // ***** Theatre Config *******

  const boxObj = sheet.object('Box', {
    rotation: types.compound({
      xR: types.number(box.rotation.x, { range: [-Math.PI, Math.PI] }),
      yR: types.number(box.rotation.y, { range: [-Math.PI, Math.PI] }),
      zR: types.number(box.rotation.z, { range: [-Math.PI, Math.PI] }),
    }),
    position: types.compound({
      x: types.number(0, { nudgeMultiplier: 0.1 }),
      y: types.number(0, { nudgeMultiplier: 0.1 }),
      z: types.number(0, { nudgeMultiplier: 0.1 }),
    }),
  });

  boxObj.onValuesChange((values) => {
    const { xR, yR, zR } = values.rotation;
    box.rotation.set(xR, yR, zR);
    const { x, y, z } = values.position;
    box.position.set(x, y, z);
  });

}

// RAF Update the screen
function tick(): void {
  renderer.render(scene, camera);
  controls.update();
  window.requestAnimationFrame(tick);
}


function setupLights() {
  // ***** Lights ****** //
  const ambLight = new THREE.AmbientLight(0xfefefe, 0.2);
  const dirLight = new THREE.DirectionalLight(0xfefefe, 1);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.width = 1024;
  dirLight.shadow.mapSize.height = 1024;
  dirLight.shadow.camera.far = 100;
  dirLight.shadow.camera.near = 1;
  dirLight.shadow.camera.top = 40;
  dirLight.shadow.camera.right = 40;
  dirLight.shadow.camera.bottom = -40;
  dirLight.shadow.camera.left = -40;

  dirLight.position.set(20, 30, 20);
  scene.add(ambLight, dirLight);
}

function setupOrbitControls() {
  // OrbitControls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableZoom = true;
  controls.enableDamping = true;
  controls.autoRotate = true;
  controls.rotateSpeed = 1;
  controls.dampingFactor = 0.1;
  controls.minDistance = 2.4;

}

function setupEventListeners() {
  // Handle `resize` events
  window.addEventListener(
    'resize',
    function () {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();

      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    },
    false,
  );
}