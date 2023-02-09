import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import { getProject, types, val } from '@theatre/core';
import projectState from './TheatreTutorial_1.theatre-project-state.json';

import studio from '@theatre/studio';

let project;
if (import.meta.env.DEV) {
  studio.initialize();
  // Create a project from local state
  project = getProject('TheatreTutorial_1');
}
else {
  // Create a project from saved state
  project = getProject('TheatreTutorial_1', { state: projectState });
}
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
    300,
  );
  camera.position.set(-70, 20, 70);

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

  // Fog

  scene.fog = new THREE.FogExp2(0x292929, 0.007);

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

  const planeGeometry = new THREE.CylinderGeometry(30, 30, 300, 30);
  const planeMaterial = new THREE.MeshPhongMaterial({ color: 0xf0f0f0 });

  const floor = new THREE.Mesh(planeGeometry, planeMaterial);
  floor.position.set(0, -150, 0);
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
    scale: types.compound({
      xS: types.number(1, { nudgeMultiplier: 0.1 }),
      yS: types.number(1, { nudgeMultiplier: 0.1 }),
      zS: types.number(1, { nudgeMultiplier: 0.1 }),
    }),
  });

  boxObj.onValuesChange((values) => {
    const { xR, yR, zR } = values.rotation;
    box.rotation.set(xR, yR, zR);
    const { x, y, z } = values.position;
    box.position.set(x, y, z);
    const { xS, yS, zS } = values.scale;
    box.scale.set(xS, yS, zS);
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
  const ambLight = new THREE.AmbientLight(0xfefefe, 0.5);
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
  controls.autoRotate = false;
  controls.rotateSpeed = 1;
  controls.dampingFactor = 0.1;
  controls.minDistance = 2.4;
  controls.maxDistance = 180;
  controls.target.set(0, 20, 0);
  controls.maxPolarAngle = (Math.PI / 2);
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
  // Play sequence on click
  window.addEventListener(
    'click',
    function () {
      if (!val(sheet.sequence.pointer.playing)) {
        const tapStart = document.getElementById('tapStart');
        // @ts-ignore
        tapStart.style.opacity = "0";
        this.setTimeout(()=>{
          // @ts-ignore
          tapStart.style.display = "none";
        },400)
        sheet.sequence.play({ iterationCount: Infinity, range: [0, 2] });
      }
    },
    {
      once:true
    }
  );

  const toggleSoundDom = document.getElementById('toggleSound');
  // @ts-ignore
  toggleSoundDom.addEventListener('click',()=>{toggleSound()},false)

  const toggleAnimationDom = document.getElementById('toggleAnimation');
  // @ts-ignore
  toggleAnimationDom.addEventListener('click',()=>{toggleAnimation()},false)

}

function toggleSound() {
  const soundOn = document.getElementById('soundOn');
  const soundOff = document.getElementById('soundOff');
  if (!soundOn || !soundOff) return;
  if (soundOn.style.display == 'none') {
    soundOn.style.display = 'block';
    soundOff.style.display = 'none';
  } else {
    soundOn.style.display = 'none';
    soundOff.style.display = 'block';
  }
}

function toggleAnimation() {
  const play = document.getElementById('play');
  const pause = document.getElementById('pause');
  if (!play || !pause) return;
  if (!val(sheet.sequence.pointer.playing)) {
    play.style.display = 'none';
    pause.style.display = 'block';
    sheet.sequence.play({ iterationCount: Infinity, range: [0, 2] });
  } else {
    play.style.display = 'block';
    pause.style.display = 'none';
    sheet.sequence.pause();
  }
}