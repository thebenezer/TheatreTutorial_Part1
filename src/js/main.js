import '../css/style.css'

import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import Stats from 'three/examples/jsm/libs/stats.module.js';

const canvas = document.querySelector('#canvas' );

let stats;
let camera, scene, renderer,controls;

let cubeMesh;
hasWebGL();

function hasWebGL() {
    const gl =canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (gl && gl instanceof WebGLRenderingContext) {
        init();
        requestAnimationFrame(render);
    } else {
        console.log("Your browser does not support webGL");
    }
}

function init() {
    stats = new Stats();
    document.querySelector('#stats').appendChild( stats.dom );
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xfefefe);
    
    // ***** CAMERA ****** //
    const fov = 45;
    const aspect = window.innerWidth / window.innerHeight;  // the canvas default
    const near = 0.1;
    const far = 400;
    camera = new THREE.PerspectiveCamera( fov, aspect, near, far);
    camera.position.set(5,5,5)

    // ***** RENDERER ****** //
    renderer = new THREE.WebGLRenderer({
        canvas,
        powerPreference: "high-performance",
        antialias: false,
        stencil: false,
        depth: false
        });
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.setPixelRatio( Math.min(window.devicePixelRatio,2) );
    renderer.setSize( window.innerWidth, window.innerHeight );


    // ***** Lights ****** //
    const ambLight = new THREE.AmbientLight(0x0000ff,0.5);
    const dirLight = new THREE.DirectionalLight({
        color:0xfefefe,
        
    });
    dirLight.position.set(5,10,5)
    scene.add(ambLight,dirLight)

    const cube= new THREE.BoxGeometry(2,2,2);
    const material= new THREE.MeshPhysicalMaterial({
        color:0xfefefe,
        
    });

    cubeMesh = new THREE.Mesh(cube,material);
    scene.add(cubeMesh)


    setupOrbitControls();
    window.addEventListener( 'resize', onWindowResize,false );
}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

    renderer.setSize( window.innerWidth, window.innerHeight );

}


function render() {
    cubeMesh.rotation.y+=0.01
    renderer.render(scene, camera);
    stats.update();
    controls.update();
    requestAnimationFrame( render );
}

function setupOrbitControls() {
    // Setup orbital controls
    controls = new OrbitControls(camera, renderer.domElement);
    // controls.listenToKeyEvents( window ); // optional
    controls.enableKeys = false;
    // controls.enablePan = false;
    controls.enableZoom = true;
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    // controls.screenSpacePanning = true;
    controls.minDistance = 2.4;
    // controls.maxDistance = 10;
    // controls.maxPolarAngle = Math.PI/2;
    // controls.autoRotate= true;
    // controls.autoRotateSpeed= 2;
    controls.update();

}