import * as THREE from "https://cdn.skypack.dev/three@0.130.0";
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.130.0/examples/jsm/controls/OrbitControls.js';
import { SVGLoader } from 'https://cdn.skypack.dev/three@0.130.0/examples/jsm/loaders/SVGLoader.js';

const texture = new THREE.TextureLoader().load( "https://threejsfundamentals.org/threejs/lessons/resources/images/compressed-but-large-wood-texture.jpg" );
texture.wrapS = THREE.RepeatWrapping;
texture.repeat.set( 0.005, 0.005 );
texture.rotation = 0.25;

const woodMaterial = new THREE.MeshBasicMaterial({
    map: texture
  });
var fillMaterial = new THREE.MeshPhongMaterial({ color: "#FBFB00" });
fillMaterial = woodMaterial
const stokeMaterial = new THREE.LineBasicMaterial({
  color: "#D2691E",
});

const renderSVG = (extrusion, svgData) => {
  const loader = new SVGLoader();
  //const svgData = loader.parse(svg);
  const svgGroup = new THREE.Group();
  const updateMap = [];
  
  var layerZPosition = 0
  var offsetX = 0.001
  var layer = 0
  const colours = [0x66ff66, 0x8B0000, 0xB8860B, 0x222222, 0xDCDCDC]
  svgGroup.scale.y *= -1;
  svgData.paths.forEach((path) => {
    const shapes = SVGLoader.createShapes(path);

    shapes.forEach((shape) => {
      const meshGeometry = new THREE.ExtrudeBufferGeometry(shape, {
        depth: extrusion,
         bevelEnabled: true,
            bevelThickness: 0.25,
            bevelSize: 0.25,
            bevelSegments: 1
      });
      
      const texture = new THREE.TextureLoader().load( "https://threejsfundamentals.org/threejs/lessons/resources/images/compressed-but-large-wood-texture.jpg" );
      texture.wrapS = THREE.RepeatWrapping;
      texture.repeat.set( 0.005, 0.005 );
      texture.offset.x = offsetX

    const woodMaterial = new THREE.MeshPhongMaterial({
    map: texture
    });
      woodMaterial.color.set(colours[layer]);
      layer += 1
    var fillMaterial = new THREE.MeshPhongMaterial({ color: "#FBFB00" });
    fillMaterial = woodMaterial
    const stokeMaterial = new THREE.LineBasicMaterial({
      color: "#D2691E",
      transparent: true,
      opacity: 0.3
    });
      const linesGeometry = new THREE.EdgesGeometry(meshGeometry);
      var mesh = new THREE.Mesh(meshGeometry, fillMaterial);
      mesh.position.z = layerZPosition
      //mesh.rotation.y =  Math.PI / -2
      mesh.castShadow = true
      mesh.receiveShadow = true
      const lines = new THREE.LineSegments(linesGeometry, stokeMaterial);
      lines.position.z = layerZPosition 
      //lines.rotation.y =  Math.PI / -2
      updateMap.push({ shape, mesh, lines });
      svgGroup.add(mesh, lines);
      layerZPosition += 3
      offsetX += 0.1
    });
  });

  
  const box = new THREE.Box3().setFromObject(svgGroup);
  const size = box.getSize(new THREE.Vector3());
  const yOffset = size.y / -2;
  const xOffset = size.x / -2;

  // Offset all of group's elements, to center them
  svgGroup.children.forEach((item) => {
    item.position.x = xOffset;
    item.position.y = yOffset;
  });
  svgGroup.rotateY(-Math.PI / -2);

  return {
    object: svgGroup,
    update(extrusion) {
      updateMap.forEach((updateDetails) => {
        const meshGeometry = new THREE.ExtrudeBufferGeometry(
          updateDetails.shape,
          {
            depth: extrusion,
            bevelEnabled: true,
            bevelThickness: 0.5,
            bevelSize: 0.5,
            bevelSegments: 1,
          }
        );
        const linesGeometry = new THREE.EdgesGeometry(meshGeometry);

        updateDetails.mesh.geometry.dispose();
        updateDetails.lines.geometry.dispose();
        updateDetails.mesh.geometry = meshGeometry;
        updateDetails.lines.geometry = linesGeometry;
      });
    },
  };
};
// scene.js
const setupScene = (container) => {
  const scene = new THREE.Scene();

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.BasicShadowMap
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 1, 1000);

  const ambientLight = new THREE.AmbientLight("#666666");
  //ambientLight.castShadow = true; // default false
  const pointLight = new THREE.PointLight("#ffffff", 2, 400);
  pointLight.position.set( 20, 200, -100 ); //default; light shining from top
  pointLight.castShadow = true; // default false
  pointLight.shadow.mapSize.width = 2048;
  pointLight.shadow.mapSize.height = 2048;
  pointLight.shadow.camera.near = 5;
  pointLight.shadow.camera.far = 2000;
  const pointLight2 = new THREE.PointLight("#ffffff", 2, 400);
  pointLight2.position.set( 200, 20, -100 ); //default; light shining from top
  pointLight2.castShadow = true; // default false
  pointLight2.shadow.mapSize.width = 2048;
  pointLight2.shadow.mapSize.height = 2048;
  pointLight2.shadow.camera.near = 5;
  pointLight2.shadow.camera.far = 2000;
   
  const controls = new OrbitControls(camera, renderer.domElement);
 
  const animate = () => {
    renderer.render(scene, camera);
    controls.update();

    requestAnimationFrame(animate);
  };

  renderer.setSize(window.innerWidth, window.innerHeight);
  scene.add(ambientLight, pointLight, pointLight2);
  camera.position.z = 0;
  camera.position.x = 300;
  camera.position.y = -100;
  controls.enablePan = false;

  container.append(renderer.domElement);
  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
  animate();

  return scene;
};

const defaultExtrusion = 3;
const app = document.querySelector("#app");
const scene = setupScene(app);

const loader = new SVGLoader();
loader.load(
	// resource URL
	//'hex-frame.svg',
  'scene.svg',
	// called when the resource is loaded
	function ( data ) {
    console.log("loaded")
    const { object, update } = renderSVG(defaultExtrusion, data);
    scene.add(object);
	}

);

