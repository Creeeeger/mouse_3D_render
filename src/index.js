export * from '/-/three@v0.132.2-dLPTyDAYt6rc6aB18fLm/dist=es2019,mode=imports/optimized/three.js';
export {default} from '/-/three@v0.132.2-dLPTyDAYt6rc6aB18fLm/dist=es2019,mode=imports/optimized/three.js';
import { Camera, Material, Texture } from "https://cdn.skypack.dev@0.132.2";
import { OrbitControls } from "https://cdn.skypack.dev@0.132.2/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://cdn.skypack.dev@0.132.2/examples/jsm/loaders/GLTFLoader.js";
import { RGBELoader } from "https://cdn.skypack.dev@0.132.2/examples/jsm/loaders/RGBELoader.js";
export {default} from '/-/three@v0.132.2-dLPTyDAYt6rc6aB18fLm/dist=es2019,mode=imports/unoptimized/examples/jsm/controls/OrbitControls.js';
      // Canvas
      const canvas = document.querySelector("canvas.webgl");
      const scene = new THREE.Scene();
      let renderer;
      let camera;

      // Define the function to load a new 3D model
      function loadModel(modelUrl) {
        // Remove the current model from the scene, if any
        scene.remove(scene.getObjectByName("currentModel"));

        const loader = new GLTFLoader();
        loader.load(
          modelUrl,
          function (gltf) {
            const newModel = gltf.scene;
            newModel.name = "currentModel"; // Set a name to the model for easy removal

            // Position, scale, or modify the new model as needed
            newModel.position.set(0, 0, 0);
            newModel.scale.set(1, 1, 1);

            scene.add(newModel);
            render(); // Render the scene with the new model
          }
        );
      }

      // Add event listeners to the buttons
      document.getElementById("buttonRed").addEventListener("click", function () {
        loadModel("https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/ToyCar/glTF/ToyCar.gltf"); //colour 1
      });

      document.getElementById("buttonBlue").addEventListener("click", function () {
        loadModel("https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/BoomBox/glTF/BoomBox.gltf"); //colour 2 
      });

      document.getElementById("buttonGreen").addEventListener("click", function () {
        loadModel("https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/EnvironmentTest/glTF/EnvironmentTest.gltf"); //colour 4
      });

      document.getElementById("buttonYellow").addEventListener("click", function () {
        loadModel("https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/BarramundiFish/glTF/BarramundiFish.gltf"); //colour 3
      });

      function init() {
        // Setup the camera
        camera = new THREE.PerspectiveCamera(
          45,
          window.innerWidth / window.innerHeight,
          0.25,
          20
        );
        camera.position.set(-1.8, 0.6, 2.7);

        // Load and create the environment
        new RGBELoader()
          .setDataType(THREE.HalfFloatType)
          .load(
            "/src/royal_esplanade_1k.hdr",
            function (texture) {
              const pmremGenerator = new THREE.PMREMGenerator(renderer);
              pmremGenerator.compileEquirectangularShader();
              const envMap = pmremGenerator.fromEquirectangular(texture).texture;

              scene.background = envMap; // This loads the envMap for the background
              scene.environment = envMap; // This loads the envMap for reflections and lighting

              texture.dispose(); // We have envMap so we can erase the texture
              pmremGenerator.dispose(); // We processed the image into envMap so we can stop this
            }
          );

        // Load the initial model
        loadModel("https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/AnimatedMorphCube/glTF/AnimatedMorphCube.gltf"); // Add the initial model to load

        // Setup the renderer
        renderer = new THREE.WebGLRenderer({ antialias: true, canvas: canvas });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.toneMapping = THREE.ACESFilmicToneMapping; // Added contrast for filmic look
        renderer.toneMappingExposure = 1;
        renderer.outputEncoding = THREE.sRGBEncoding; // Extended color space for the hdr

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.addEventListener("change", render); // Use if there is no animation loop to render after any changes
        controls.minDistance = 2;
        controls.maxDistance = 10;
        controls.target.set(0, 0, -0.2);
        controls.update();

        window.addEventListener("resize", onWindowResize);
      }

      function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);

        render();
      }

      function render() {
        renderer.render(scene, camera);
      }

      init(); // Our setup
      render(); // The update loop
