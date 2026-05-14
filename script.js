import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";
import { GLTFLoader } from "https://unpkg.com/three@0.160.0/examples/jsm/loaders/GLTFLoader.js";

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
document.body.appendChild(renderer.domElement);

scene.add(new THREE.AmbientLight(0xffffff, 0.8));

const light = new THREE.DirectionalLight(0xbfd9ff, 1.5);
light.position.set(10, 15, 10);
scene.add(light);

const starGeo = new THREE.BufferGeometry();
const starCount = 2000;

const pos = new Float32Array(starCount * 3);

for (let i = 0; i < starCount * 3; i++) {
  pos[i] = (Math.random() - 0.5) * 200;
}

starGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));

const stars = new THREE.Points(
  starGeo,
  new THREE.PointsMaterial({ color: 0xffffff, size: 0.15 })
);

scene.add(stars);

let mouseX = 0;
let mouseY = 0;

window.addEventListener("mousemove", (e) => {
  mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
  mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
});

const loader = new GLTFLoader();

let roue;
let mixer;

loader.load(
  "./grande-roue.glb",
  (gltf) => {
    roue = gltf.scene;
    scene.add(roue);

    const box = new THREE.Box3().setFromObject(roue);
    const center = box.getCenter(new THREE.Vector3());
    roue.position.sub(center);

    roue.position.y += 6;

    const size = box.getSize(new THREE.Vector3()).length();
    const scale = (12 / size) * 2;
    roue.scale.set(scale, scale, scale);

    roue.rotation.y = -Math.PI / 2;

    if (gltf.animations.length) {
      mixer = new THREE.AnimationMixer(roue);
      mixer.clipAction(gltf.animations[0]).play();
    }
  },
  undefined,
  (err) => console.error(err)
);

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
  camera.position.y = 10 + Math.sin(time * 0.5) * 2;

  camera.lookAt(0, 5, 0);

  stars.rotation.y += 0.0002;

  if (mixer) mixer.update(0.016);

  renderer.render(scene, camera);
}

animate();

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
