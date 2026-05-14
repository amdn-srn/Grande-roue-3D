import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x05060a);
scene.fog = new THREE.Fog(0x05060a, 12, 55);

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

scene.add(new THREE.AmbientLight(0xffffff, 0.35));

const moonLight = new THREE.DirectionalLight(0xbfd9ff, 1.6);
moonLight.position.set(8, 14, 6);
scene.add(moonLight);

const fillLight = new THREE.PointLight(0x1a2a3a, 0.8, 80);
fillLight.position.set(-10, 5, -10);
scene.add(fillLight);

const starGeo = new THREE.BufferGeometry();
const starCount = 2500;

const positions = new Float32Array(starCount * 3);

for (let i = 0; i < starCount * 3; i++) {
  positions[i] = (Math.random() - 0.5) * 220;
}

starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

const stars = new THREE.Points(
  starGeo,
  new THREE.PointsMaterial({ color: 0xffffff, size: 0.15 })
);

scene.add(stars);

let mouseX = 0;
let mouseY = 0;

window.addEventListener('mousemove', (e) => {
  mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
  mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
});

const loader = new GLTFLoader();

let grandeRoue;
let mixer;

loader.load('/grande-roue.glb', (gltf) => {

  grandeRoue = gltf.scene;
  scene.add(grandeRoue);

  const box = new THREE.Box3().setFromObject(grandeRoue);
  const center = box.getCenter(new THREE.Vector3());
  grandeRoue.position.sub(center);

  grandeRoue.position.y += 7;

  const size = box.getSize(new THREE.Vector3()).length();
  const scale = (12 / size) * 2;
  grandeRoue.scale.set(scale, scale, scale);

  grandeRoue.rotation.y = -Math.PI / 2;

  if (gltf.animations && gltf.animations.length > 0) {
    mixer = new THREE.AnimationMixer(grandeRoue);
    mixer.clipAction(gltf.animations[0]).play();
  }

});

let time = 0;

function animate() {
  requestAnimationFrame(animate);

  time += 0.0015;

  const hover = Math.abs(mouseX) < 0.6 && Math.abs(mouseY) < 0.6;

  const radius = hover ? 10 : 22;
  const speed = hover ? 1.2 : 1;

  const t = time * speed;

  camera.position.x = Math.cos(t) * radius;
  camera.position.z = Math.sin(t) * radius;
  camera.position.y = 10 + Math.sin(time * 0.5) * 2 + (hover ? 1 : 0);

  camera.lookAt(0, 5, 0);

  stars.rotation.y += 0.0002;

  moonLight.position.x = 8 + mouseX * 2;
  moonLight.position.y = 14 + mouseY * 2;

  fillLight.position.x = -10 + mouseX;
  fillLight.position.y = 5 + mouseY;

  if (mixer) mixer.update(0.016);

  renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
