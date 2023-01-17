import * as THREE from "./three.module.js";
import { OrbitControls } from "./OrbitControls.js";
import { MTLLoader } from "./MTLLoader.js";
import { OBJLoader } from "./OBJLoader.js";

const loadingScreenEle = document.getElementById("LoadingScreen");
loadingScreenEle.style.display = "flex";
const loadingScreenProgressEle = document.getElementById("LoadingScreenProgress");
loadingScreenProgressEle.value = 0;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const light = new THREE.AmbientLight(0xffffff);
light.intensity = 3;
scene.add(light);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 20);

const listener = new THREE.AudioListener();
camera.add(listener);
const sound = new THREE.Audio(listener);
const audioLoader = new THREE.AudioLoader();
audioLoader.load("./assets/models/dhokra/a-small-miracle-132333.mp3", function (buffer) {
    sound.setBuffer(buffer);
    sound.setLoop(true);
    sound.setVolume(0.5);
    sound.play();
});

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.autoRotate = true;

const mtlLoader = new MTLLoader();
mtlLoader.load(
    "./assets/models/dhokra/Dhokra.mtl",
    (materials) => {
        materials.preload();
        const objLoader = new OBJLoader();
        objLoader.setMaterials(materials);
        objLoader.load(
            "./assets/models/dhokra/Dhokra.obj",
            function (object) {
                object.traverse(function (child) {
                    if (child instanceof THREE.Mesh) {
                        child.geometry.center();
                    }
                });
                scene.add(object);
            },
            function (xhr) {
                if (xhr.loaded >= xhr.total) {
                    console.log("Object loaded");
                    loadingScreenEle.style.display = "none";
                    loadingScreenProgressEle.value = 0;
                } else {
                    loadingScreenProgressEle.value = parseInt((xhr.loaded / xhr.total) * 100);
                }
            },
            function (error) {
                console.log("An error happened");
            }
        );
    },
    (xhr) => {
        if (xhr.loaded === xhr.total) {
            console.log("MTL loaded");
        }
    },
    (error) => {
        console.log("An error happened");
    }
);

window.addEventListener("resize", onWindowResize, false);
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    render();
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    render();
}

function render() {
    renderer.render(scene, camera);
}

animate();
