import * as THREE from 'https://unpkg.com/three@0.164.1/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.164.1/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.164.1/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from 'https://unpkg.com/three@0.164.1/examples/jsm/loaders/RGBELoader.js';

const canvas = document.querySelector('canvas.webgl');
const scene = new THREE.Scene();

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  canvas,
  alpha: true
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
renderer.outputEncoding = THREE.sRGBEncoding;

const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.set(2.5, 1.2, 4.5);
scene.add(camera);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.minDistance = 1.5;
controls.maxDistance = 10;
controls.target.set(0, 0.75, 0);
controls.update();

const pmremGenerator = new THREE.PMREMGenerator(renderer);
pmremGenerator.compileEquirectangularShader();

new RGBELoader()
  .setDataType(THREE.HalfFloatType)
  .load(
    'src/royal_esplanade_1k.hdr',
    (texture) => {
      const envMap = pmremGenerator.fromEquirectangular(texture).texture;
      scene.background = envMap;
      scene.environment = envMap;

      texture.dispose();
      pmremGenerator.dispose();
    },
    undefined,
    (error) => console.error('Failed to load HDR environment.', error)
  );

const gltfLoader = new GLTFLoader();
let currentModel = null;

async function loadModel(modelUrl) {
  try {
    const gltf = await gltfLoader.loadAsync(modelUrl);
    const newModel = gltf.scene;
    newModel.name = 'currentModel';

    newModel.position.set(0, 0, 0);
    newModel.scale.set(1, 1, 1);

    newModel.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    if (currentModel) {
      disposeModel(currentModel);
      scene.remove(currentModel);
    }

    currentModel = newModel;
    scene.add(currentModel);
  } catch (error) {
    console.error(`Failed to load model from ${modelUrl}`, error);
  }
}

function disposeModel(model) {
  model.traverse((child) => {
    if (!child.isMesh) return;

    if (child.geometry) {
      child.geometry.dispose();
    }

    const materials = Array.isArray(child.material)
      ? child.material
      : [child.material];

    materials.forEach((material) => {
      if (!material) return;

      for (const key of Object.keys(material)) {
        const value = material[key];
        if (value && typeof value === 'object' && 'minFilter' in value) {
          value.dispose?.();
        }
      }

      material.dispose?.();
    });
  });
}

const presets = {
  buttonRed:
    'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/ToyCar/glTF/ToyCar.gltf',
  buttonBlue:
    'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/BoomBox/glTF/BoomBox.gltf',
  buttonGreen:
    'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/EnvironmentTest/glTF/EnvironmentTest.gltf',
  buttonYellow:
    'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/BarramundiFish/glTF/BarramundiFish.gltf'
};

Object.entries(presets).forEach(([buttonId, modelUrl]) => {
  const button = document.getElementById(buttonId);
  if (!button) return;

  button.addEventListener('click', () => loadModel(modelUrl));
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

function render() {
  controls.update();
  renderer.render(scene, camera);
}

renderer.setAnimationLoop(render);

loadModel(
  'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/AnimatedMorphCube/glTF/AnimatedMorphCube.gltf'
);
