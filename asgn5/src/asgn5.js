import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';

let scene, camera, renderer, controls;
let swordModel, tsubaModel, orbLight, statsDiv, lanternSphere, lampLight;
let landedSnowGeo, landedSnowMat;
let lastTime = 0;
let frameCount = 0;
let fpsLastTime = 0;
const dragonGuardians = [];

init();
animate();

function init() {
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0a1a, 0.003);
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 80, 200);

    // Camera needs to see both Layer 0 (Relics) and Layer 1 (Moon-lit Environment)
    camera.layers.enable(1);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    statsDiv = document.getElementById('stats');

    // Ambient/Hemisphere stay on Layer 0 to affect everything
    scene.add(new THREE.AmbientLight(0x444477, 0.8));
    scene.add(new THREE.HemisphereLight(0x4444ff, 0x112211, 0.6));

    // Moon is moved to Layer 1: It will ignore the Sword and Tsuba
    const moon = new THREE.DirectionalLight(0xffffff, 2.5);
    moon.position.set(100, 150, 100);
    moon.castShadow = true;
    moon.layers.set(1);
    moon.shadow.bias = -0.0005;
    moon.shadow.mapSize.set(4096, 4096);
    moon.shadow.camera.left = -220;
    moon.shadow.camera.right = 220;
    moon.shadow.camera.top = 220;
    moon.shadow.camera.bottom = -220;
    scene.add(moon);

    // Rim light also moved to Layer 1
    const rimLight = new THREE.DirectionalLight(0xffffff, 0.5);
    rimLight.position.set(0, 120, -150);
    rimLight.layers.set(1);
    scene.add(rimLight);

    // Lantern light stays on Layer 0 to provide the one main relic shadow
    lampLight = new THREE.PointLight(0xffaa44, 6000, 160);
    lampLight.position.set(0, 38, 0);
    lampLight.castShadow = true;
    scene.add(lampLight);

    // Orb light follows Tsuba - Shadow disabled to fix "double/rotating" glitch
    orbLight = new THREE.PointLight(0xffaa44, 3500, 120);
    orbLight.castShadow = false;
    scene.add(orbLight);

    const texLoader = new THREE.TextureLoader();
    const grassTex = texLoader.load('grass.png');
    const dirtTex = texLoader.load('dirt.png');
    const skyLoader = new THREE.CubeTextureLoader();
    const spacePath = 'https://threejs.org/examples/textures/cube/MilkyWay/';

    scene.background = skyLoader.load([
        spacePath+'dark-s_px.jpg', spacePath+'dark-s_nx.jpg', spacePath+'dark-s_py.jpg',
        spacePath+'dark-s_ny.jpg', spacePath+'dark-s_pz.jpg', spacePath+'dark-s_nz.jpg'
    ]);

    const ground = new THREE.Mesh(
        new THREE.CircleGeometry(250, 64),
        new THREE.MeshStandardMaterial({ map: grassTex, color: 0x223322, roughness: 1.0 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    ground.layers.enable(1); // Ground needs to receive Moon shadows
    scene.add(ground);

    const templeGroup = new THREE.Group();
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x2d1b0f, roughness: 0.8 });
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.3, metalness: 0.6 });

    const foundation = new THREE.Mesh(new THREE.BoxGeometry(34, 12, 34), stoneMat);
    foundation.position.y = 6;
    foundation.receiveShadow = true;
    templeGroup.add(foundation);

    for (let i = 0; i < 8; i++) {
        const stepDepth = 5;
        const topY = 12 - (i * 1.5);
        const step = new THREE.Mesh(new THREE.BoxGeometry(18.2, topY, stepDepth), new THREE.MeshStandardMaterial({ map: dirtTex }));
        step.position.set(0, topY / 2, 17 + (i * stepDepth) + (stepDepth / 2));
        step.receiveShadow = true;
        step.castShadow = true;
        templeGroup.add(step);
    }
    for (let i = 0; i < 4; i++) {
        const p = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 30, 12), woodMat);
        p.position.set(i < 2 ? 13 : -13, 26, i % 2 === 0 ? 13 : -13);
        p.castShadow = true;
        templeGroup.add(p);
    }
    for (let i = 0; i < 3; i++) {
        const tierH = 6;
        const tier = new THREE.Mesh(new THREE.BoxGeometry(42 - (i * 12), tierH, 42 - (i * 12)), roofMat);
        tier.position.y = 41 + (tierH / 2) + (i * tierH);
        tier.castShadow = true;
        templeGroup.add(tier);
    }

    lanternSphere = new THREE.Mesh(
        new THREE.SphereGeometry(2.4, 32, 32),
        new THREE.MeshStandardMaterial({ color: 0xffaa44, emissive: 0xffaa44, emissiveIntensity: 2.5 })
    );
    lanternSphere.position.set(0, 39, 0);
    templeGroup.add(lanternSphere);

    const lCapH = 0.6;
    const topCapGeo = new THREE.CylinderGeometry(2.1, 2.1, lCapH, 16);
    const bottomCapGeo = new THREE.CylinderGeometry(1.05, 1.05, lCapH, 16);
    const lanternTop = new THREE.Mesh(topCapGeo, woodMat);
    lanternTop.position.set(0, 41.7, 0);
    templeGroup.add(lanternTop);

    const lanternBottom = new THREE.Mesh(bottomCapGeo, woodMat);
    lanternBottom.position.set(0, 36.3, 0);
    templeGroup.add(lanternBottom);

    // Ensure the entire shrine is visible to the Moon (Layer 1)
    templeGroup.traverse(node => { if(node.isMesh) node.layers.enable(1); });
    scene.add(templeGroup);

    for (let i = 0; i < 22; i++) {
        const segment = new THREE.Mesh(new THREE.CircleGeometry(10, 16), new THREE.MeshStandardMaterial({ map: dirtTex, roughness: 1 }));
        const curve = Math.sin(i * 0.4) * 12;
        segment.position.set(curve, 0.1 + (i * 0.001), 57 + (i * 9));
        segment.rotation.x = -Math.PI / 2;
        segment.receiveShadow = true;
        segment.layers.enable(1);
        scene.add(segment);
    }

    const blossomMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0xffaaaa,
        emissiveIntensity: 0.1,
        transparent: true,
        opacity: 0.8
    });

    function createBonsai(x, z, s) {
        const woodGeos = [];
        const leafGeos = [];
        const trunkHeight = 40;
        const trunkGeo = new THREE.CylinderGeometry(0.5, 3.5, trunkHeight, 8);
        trunkGeo.translate(0, trunkHeight / 2, 0);
        woodGeos.push(trunkGeo);
        for (let i = 0; i < 18; i++) {
            const branchLen = 18 - (i * 0.6);
            const branchGeo = new THREE.CylinderGeometry(0.1, 0.8, branchLen, 8);
            branchGeo.rotateZ(Math.PI / 2);
            branchGeo.translate(branchLen / 2, 10 + (i * 1.7), 0);
            const branchYRot = (i * 1.2);
            branchGeo.rotateY(branchYRot);
            woodGeos.push(branchGeo);
            const leafCount = i > 12 ? 8 : 4;
            for (let j = 0; j < leafCount; j++) {
                const leafSize = 3 + Math.random() * 2.5;
                const leafGeo = new THREE.SphereGeometry(leafSize, 12, 12);
                const lX = branchLen + Math.random() * 6 - 3;
                const lY = Math.random() * 5 - 2.5;
                const lZ = Math.random() * 5 - 2.5;
                const localPos = new THREE.Vector3(lX, lY, lZ);
                localPos.applyAxisAngle(new THREE.Vector3(0, 1, 0), branchYRot);
                leafGeo.translate(localPos.x, localPos.y + 10 + (i * 1.7), localPos.z);
                leafGeos.push(leafGeo);
            }
        }
        const crownGeo = new THREE.SphereGeometry(8, 12, 12);
        crownGeo.translate(0, trunkHeight + 2, 0);
        leafGeos.push(crownGeo);
        const mergedWood = BufferGeometryUtils.mergeGeometries(woodGeos);
        const mergedLeaves = BufferGeometryUtils.mergeGeometries(leafGeos);
        const woodMesh = new THREE.Mesh(mergedWood, woodMat);
        const leafMesh = new THREE.Mesh(mergedLeaves, blossomMat);
        const treeGroup = new THREE.Group();
        treeGroup.add(woodMesh, leafMesh);
        treeGroup.position.set(x, 0, z);
        treeGroup.scale.set(s, s, s);
        treeGroup.rotation.y = Math.random() * Math.PI;
        woodMesh.castShadow = true;
        leafMesh.castShadow = true;
        // Trees must exist on Layer 1 to be lit/shadowed by the Moon
        treeGroup.traverse(n => { if(n.isMesh) n.layers.enable(1); });
        scene.add(treeGroup);
    }

    createBonsai(70, -70, 1.1);
    createBonsai(-80, -60, 0.9);
    createBonsai(110, 20, 0.8);
    createBonsai(-70, 80, 1.0);
    createBonsai(40, -130, 1.2);
    createBonsai(-50, -140, 0.7);
    createBonsai(175, 70, 0.9);
    createBonsai(-140, -120, 1.1);
    createBonsai(180, -40, 0.85);
    createBonsai(-150, 20, 0.95);
    createBonsai(30, 175, 1.0);
    createBonsai(-70, 160, 0.8);
    createBonsai(-40, 220, 0.95);
    createBonsai(130, 190, 0.9);
    createBonsai(-210, -30, 1.0);
    createBonsai(10, -220, 1.3);
    createBonsai(-100, -210, 0.8);
    createBonsai(135, -140, 1.1);
    createBonsai(-150, 130, 0.9);
    createBonsai(85, 110, 1.2);

    const jadeMat = new THREE.MeshPhysicalMaterial({
        color: 0x003311, emissive: 0x00ffcc, emissiveIntensity: 0.15,
        roughness: 0.05, metalness: 0.3, clearcoat: 1.0
    });

    const objLoader = new OBJLoader();
    objLoader.load('dragon.obj', (obj) => {
        const left = obj.clone();
        left.scale.set(7, 7, 7);
        left.position.set(-45, 20, 12);
        left.rotation.y = Math.PI * 1.05;
        const right = obj.clone();
        right.scale.set(-7, 7, 7);
        right.position.set(45, 20, 12);
        right.rotation.y = -Math.PI * 1.05;
        [left, right].forEach(d => {
            d.traverse(c => {
                if (c.isMesh) {
                    c.material = jadeMat;
                    c.castShadow = true;
                    c.layers.enable(1); // Enable Layer 1 for Moon shadows
                }
            });
            scene.add(d);
            dragonGuardians.push(d);
        });
    });

    const gltfLoader = new GLTFLoader();
    gltfLoader.load('sword_of_hattori_hanzo_kill_bill.glb', (gltf) => {
        const sword = gltf.scene;
        // FIX: Traverse to enable shadow casting for internal GLTF meshes
        sword.traverse((node) => {
            if (node.isMesh) {
                node.castShadow = true;
                node.receiveShadow = true;
            }
        });
        sword.scale.set(24, 24, 24);
        sword.position.set(0, 19, 0);
        sword.rotation.y = Math.PI / 2;
        scene.add(sword);
    });

    gltfLoader.load('tsuba.glb', (gltf) => {
        tsubaModel = gltf.scene;
        tsubaModel.scale.set(0.05, 0.05, 0.05);
        tsubaModel.traverse((node) => {
            if (node.isMesh) {
                node.castShadow = true;
                node.material = new THREE.MeshPhysicalMaterial({
                    color: 0x887755,
                    metalness: 1.0,
                    roughness: 0.2,
                    clearcoat: 1.0
                });
            }
        });
        scene.add(tsubaModel);
    });

    createCottonParticles();
    createLandedSnow();
}

function createCottonParticles() {
    const geo = new THREE.BufferGeometry();
    const vertices = [];
    for (let i = 0; i < 15000; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 250;
        vertices.push(Math.cos(angle) * radius, Math.random() * 400, Math.sin(angle) * radius);
    }
    geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    const mat = new THREE.PointsMaterial({ size: 0.6, color: 0xffffff, transparent: true, opacity: 0.4 });
    const points = new THREE.Points(geo, mat);
    points.layers.enable(1);
    scene.add(points);
    window.cotton = geo;
}

function createLandedSnow() {
    landedSnowGeo = new THREE.BufferGeometry();
    const vertices = [];
    for (let i = 0; i < 25000; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.sqrt(Math.random()) * 250;
        const lx = Math.cos(angle) * radius;
        const lz = Math.sin(angle) * radius;
        if (Math.abs(lx) > 18 || Math.abs(lz) > 18) {
            vertices.push(lx, 0.2, lz);
        }
    }
    landedSnowGeo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    landedSnowMat = new THREE.PointsMaterial({ size: 1.0, color: 0xffffff, transparent: true, opacity: 0.0 });
    const points = new THREE.Points(landedSnowGeo, landedSnowMat);
    points.layers.enable(1);
    scene.add(points);
}

function animate() {
    requestAnimationFrame(animate);
    const currentTime = performance.now();
    const duration = currentTime - lastTime;
    lastTime = currentTime;
    frameCount++;
    if (currentTime > fpsLastTime + 1000) {
        statsDiv.innerText = `ms: ${duration.toFixed(1)} | FPS: ${Math.round((frameCount * 1000) / (currentTime - fpsLastTime))}`;
        fpsLastTime = currentTime;
        frameCount = 0;
    }
    const time = currentTime * 0.0015;
    if (lampLight && lanternSphere) {
        const flicker = Math.random() * 0.15;
        lampLight.intensity = 5500 + (Math.sin(currentTime * 0.01) * 400) + (flicker * 4000);
        lanternSphere.material.emissiveIntensity = 2.0 + (flicker * 3.0);
        lanternSphere.rotation.y += 0.01;
    }
    if (tsubaModel) {
        const pathScale = 12;
        const den = 1 + Math.pow(Math.sin(time), 2);
        const x = (pathScale * Math.cos(time)) / den;
        const y = (pathScale * Math.sin(time) * Math.cos(time)) / den;
        tsubaModel.position.set(x, 28 + y, 0);
        tsubaModel.rotation.x += 0.01;
        tsubaModel.rotation.y += 0.015;
        tsubaModel.rotation.z += 0.005;
        orbLight.position.copy(tsubaModel.position);
    }
    dragonGuardians.forEach((d, i) => {
        d.position.y = 20 + Math.sin(time + i) * 0.5;
    });
    if (window.cotton) {
        const pos = window.cotton.attributes.position.array;
        for (let i = 0; i < pos.length; i += 3) {
            pos[i+1] -= 0.05;
            const inRoof = Math.abs(pos[i]) < 21 && Math.abs(pos[i+2]) < 21;
            if (pos[i+1] < 0 || (inRoof && pos[i+1] < 41)) {
                const angle = Math.random() * Math.PI * 2;
                const radius = Math.random() * 250;
                pos[i] = Math.cos(angle) * radius;
                pos[i+1] = 400;
                pos[i+2] = Math.sin(angle) * radius;
            }
        }
        window.cotton.attributes.position.needsUpdate = true;
    }
    if (landedSnowMat) {
        const pulse = (Math.sin(currentTime * 0.0005) + 1) / 2;
        landedSnowMat.opacity = 0.15 + (pulse * 0.5);
    }
    controls.update();
    renderer.render(scene, camera);
}
