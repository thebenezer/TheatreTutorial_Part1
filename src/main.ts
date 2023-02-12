import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {CSS2DRenderer,CSS2DObject} from 'three/examples/jsm/renderers/CSS2DRenderer'

import { getProject, onChange, types, val } from '@theatre/core';
import projectState from '../assets/BoinkTheatreState.json';
import swooshSound from '../assets/sounds/whoosh.mp3';
import boinkSound from '../assets/sounds/boink.mp3';
import thudSound from '../assets/sounds/loud-thud-45719.mp3';

// import studio from '@theatre/studio';

let project;
// if (import.meta.env.DEV) {
//   studio.initialize();
//   // Create a project from local state
//   project = getProject('TheatreTutorial_1');
// }
// else {
  // Create a project from saved state
  project = getProject('TheatreTutorial_1', { state: projectState });
// }
// Create a sheet
const sheet = project.sheet('AnimationScene');

let controls: OrbitControls;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let textRenderer:CSS2DRenderer;
let scene: THREE.Scene;


const listener = new THREE.AudioListener();
const loader = new THREE.AudioLoader();
let soundReady = false;

const swoosh = new THREE.Audio(listener)
const boink = new THREE.Audio(listener)
const thud = new THREE.Audio(listener)

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

  // TextRenderer
  textRenderer = new CSS2DRenderer();
  textRenderer.setSize(window.innerWidth,window.innerHeight);
  textRenderer.domElement.style.position = 'absolute';
  textRenderer.domElement.style.top = "0";
  document.body.appendChild(textRenderer.domElement)

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
  setupSounds();

  // ***** setup our scene *******

  // Box
  const geometry = new THREE.BoxGeometry(10, 10, 10);
  const boxMaterial = new THREE.MeshPhongMaterial({ color: 0x049ef4,emissive:0xff0000 });

  const box = new THREE.Mesh(geometry, boxMaterial);
  box.castShadow = true;
  box.receiveShadow = true;
  scene.add(box);

  // Floor
  const floorGeometry = new THREE.CylinderGeometry(30, 30, 300, 30);
  const floorMaterial = new THREE.MeshPhongMaterial({ color: 0xf0f0f0 });

  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.position.set(0, -150, 0);
  floor.receiveShadow = true;
  scene.add(floor);

  // Swoosh Effect Objects
  const swooshMaterial = new THREE.MeshBasicMaterial({color:0x222222,transparent:true,opacity:1});

  const swooshEffect = new THREE.Group();

  const swooshBig = new THREE.Mesh(geometry, swooshMaterial );
  swooshBig.scale.set(0.02,2,0.02)
  swooshBig.position.set(1,0,-2)

  const swooshSmall1 = new THREE.Mesh(geometry, swooshMaterial );
  swooshSmall1.scale.set(0.02,1,0.02)
  swooshSmall1.position.set(1,0,3)

  const swooshSmall2 = new THREE.Mesh(geometry, swooshMaterial );
  swooshSmall2.scale.set(0.02,1.4,0.02)
  swooshSmall2.position.set(-3,0,0)

  swooshEffect.add( swooshBig, swooshSmall1, swooshSmall2 );
  swooshEffect.position.set(0,20,0)
  scene.add(swooshEffect)

  // Text Effects
  const boinkDom = document.getElementById('boink');
  // @ts-ignore
  const boinkText = new CSS2DObject(boinkDom);
  boinkText.position.set(-25,0,0)
  box.add(boinkText);


  // ***** THEATRE CONFIG OBJECTS *******

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

  const colorObj = sheet.object('Colors',{
    backgroundColor: types.rgba(),
    floorColor: types.rgba(),
    boxColor: types.rgba(),
  })

  const boxEffectsObj = sheet.object('Effects',{
    boxGlow:types.rgba(),
    swooshScale:types.number(1,{nudgeMultiplier:0.01}),
    swooshPosition:types.number(0,{nudgeMultiplier:0.01}),
    swooshOpacity:types.number(1,{nudgeMultiplier:0.01})
  })

  const textEffectObj = sheet.object('text',{
    opacity:1,
    text:"",
    scale: 1
  });

  textEffectObj.onValuesChange((values)=>{
    if(!boinkDom)return;
    boinkDom.innerText = values.text;
    boinkDom.style.opacity = ""+values.opacity
    boinkDom.style.fontSize = ""+values.scale+"px";
  })

  boxObj.onValuesChange((values) => {
    const { xR, yR, zR } = values.rotation;
    box.rotation.set(xR, yR, zR);
    const { x, y, z } = values.position;
    box.position.set(x, y, z);
    const { xS, yS, zS } = values.scale;
    box.scale.set(xS, yS, zS);
  });

  colorObj.onValuesChange((values)=>{
    scene.background = new THREE.Color(values.backgroundColor.toString());
    // @ts-ignore
    scene.fog.color = new THREE.Color(values.backgroundColor.toString());
    floorMaterial.color.setRGB(values.floorColor.r,values.floorColor.g,values.floorColor.b)
    boxMaterial.color.setRGB(values.boxColor.r,values.boxColor.g,values.boxColor.b)
  })

  boxEffectsObj.onValuesChange((values)=>{
    boxMaterial.emissive.setRGB(values.boxGlow.r,values.boxGlow.g,values.boxGlow.b);
    swooshEffect.scale.setY(values.swooshScale);
    swooshEffect.position.setY(values.swooshPosition);
    swooshMaterial.opacity=values.swooshScale;
  })

  // play the audio based on pointer position
  onChange(sheet.sequence.pointer.position, (position) => {
    if(!soundReady)return;
    if(position > 0.79 && position < 0.83){
      if(!thud.isPlaying){
        thud.play();
      }
    }
    else if(position > 1.18 && position < 1.23){
      if(!boink.isPlaying){
        boink.play();
      }
    }
    else if(position > 0.00 && position<0.04){
      if(!swoosh.isPlaying){
        swoosh.playbackRate= 1.7;
        swoosh.play();
      }
    }
  })

}

// RAF Update the screen
function tick(): void {
  renderer.render(scene, camera);
  textRenderer.render(scene, camera);
  controls.update();
  window.requestAnimationFrame(tick);
}

function setupSounds() {
  camera.add(listener);

  audioSetup(swoosh,swooshSound,0.3,loader)
  audioSetup(boink,boinkSound,0.2,loader)
  audioSetup(thud,thudSound,0.5,loader)
}

function audioSetup(sound:THREE.Audio, url:string,volume:number,loader:THREE.AudioLoader){
  loader.load(
    url,
    // onLoad callback
    function ( audioBuffer ) {
      // set the audio object buffer to the loaded object
      sound.setBuffer( audioBuffer );
      sound.setVolume(volume)
      sound.loop=false;
    },
  );
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
      textRenderer.setSize(window.innerWidth, window.innerHeight);
    },
    false,
  );
  // Play sequence on click
  const tapStart = document.getElementById('tapStart');
  // @ts-ignore
  tapStart.addEventListener(
    'click',
    function () {
      soundReady = true;
      // @ts-ignore
      tapStart.style.opacity = "0";
      setTimeout(()=>{
        // @ts-ignore
        tapStart.style.display = "none";
      },400)
      sheet.sequence.play({ iterationCount: Infinity, range: [0, 2] });
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
  if (soundReady == false) {
    soundOn.style.display = 'block';
    soundOff.style.display = 'none';
  } else {
    soundOn.style.display = 'none';
    soundOff.style.display = 'block';
  }
  soundReady=!soundReady;
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