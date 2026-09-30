/* A tiny toy diorama, built from shared low-poly shapes. No model/image downloads. */
import * as THREE from 'three';

const LIMITS = Object.freeze({ pixelRatio: 1.35, maxPixels: 1300000, sparkles: 144, confetti: 54 });
const PALETTES = {
  sunny: { sky: 0xd5e5df, water: 0x7faeaa, sand: 0xccbb89, grass: 0x7b965e, path: 0xf3ddb0, leaf: 0x64875b, light: 0xffeed7 },
  moonlight: { sky: 0x14244d, water: 0x284976, sand: 0x95a7bf, grass: 0x4e7890, path: 0x89adc1, leaf: 0x678eb2, light: 0xc4d7ff }
};

function create(canvas) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'low-power', stencil: false });
  } catch (error) { console.warn('3D unavailable; using the illustrated fallback.', error.message); return null; }
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = false;
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-555, 555, 344, -344, 1, 2400);
  camera.position.set(500, 860, 930); camera.lookAt(500, 0, 300);
  const ambient = new THREE.HemisphereLight(0xd8f5ff, 0x9d9368, 2.2); scene.add(ambient);
  const sun = new THREE.DirectionalLight(0xffeed7, 3); sun.position.set(-200, 650, 480); scene.add(sun);
  const rim = new THREE.DirectionalLight(0xa6ddeb, 0.65); rim.position.set(850, 350, -250); scene.add(rim);
  const sphere = new THREE.SphereGeometry(1, 12, 8);
  const cylinder = new THREE.CylinderGeometry(1, 1, 1, 10);
  const cone = new THREE.ConeGeometry(1, 1, 8);
  const box = new THREE.BoxGeometry(1, 1, 1);
  const materials = new Map();
  const mat = (color, glow = false) => {
    const key = `${color}:${glow}`;
    if (!materials.has(key)) materials.set(key, glow ? new THREE.MeshBasicMaterial({ color }) : new THREE.MeshLambertMaterial({ color }));
    return materials.get(key);
  };
  function mesh(group, geometry, color, position, scale, glow = false) {
    const item = new THREE.Mesh(geometry, mat(color, glow));
    item.position.set(...position); item.scale.set(...scale); group.add(item); return item;
  }
  const ball = (g, c, p, s) => mesh(g, sphere, c, p, s);
  const cube = (g, c, p, s) => mesh(g, box, c, p, s);
  function between(g, a, b, radius, color) {
    const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), delta = B.clone().sub(A);
    const item = mesh(g, cylinder, color, A.clone().add(B).multiplyScalar(0.5).toArray(), [radius, delta.length(), radius]);
    item.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), delta.normalize()); return item;
  }
  function label(value, width = 84, height = 28, background = '#fffbe8', color = '#233951') {
    const c = document.createElement('canvas'); c.width = 256; c.height = 80;
    const x = c.getContext('2d');
    x.fillStyle = background; x.beginPath(); x.roundRect(3, 3, 250, 74, 25); x.fill();
    x.strokeStyle = '#233951'; x.lineWidth = 4; x.stroke();
    x.font = 'bold 35px Trebuchet MS, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = color; x.fillText(value, 128, 41);
    const texture = new THREE.CanvasTexture(c); texture.colorSpace = THREE.SRGBColorSpace;
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, depthWrite: false })); sprite.scale.set(width, height, 1); return sprite;
  }
  function starShape(radius = 14) {
    const s = new THREE.Shape();
    for (let i = 0; i < 10; i++) {
      const a = Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? radius * .46 : radius;
      if (!i) s.moveTo(Math.cos(a) * r, Math.sin(a) * r); else s.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    s.closePath(); return s;
  }
  const starGeometry = new THREE.ExtrudeGeometry(starShape(), { depth: 5, bevelEnabled: true, bevelThickness: 1, bevelSize: 1, bevelSegments: 1 });
  const sparkGeometry = new THREE.ShapeGeometry(starShape(4));
  const shadowCanvas = document.createElement('canvas'); shadowCanvas.width = shadowCanvas.height = 64;
  const sx = shadowCanvas.getContext('2d'), gradient = sx.createRadialGradient(32, 32, 2, 32, 32, 32);
  gradient.addColorStop(0, 'rgba(28,42,58,.3)'); gradient.addColorStop(1, 'rgba(28,42,58,0)'); sx.fillStyle = gradient; sx.fillRect(0, 0, 64, 64);
  const shadowMaterial = new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(shadowCanvas), transparent: true, depthWrite: false });
  const plane = new THREE.PlaneGeometry(1, 1);
  function shadow(x, z, sizeX, sizeZ) {
    const m = new THREE.Mesh(plane, shadowMaterial); m.rotation.x = -Math.PI / 2; m.scale.set(sizeX, sizeZ, 1); m.position.set(x, 18.3, z); scene.add(m); return m;
  }
  const waterMaterial = new THREE.MeshPhongMaterial({ color: PALETTES.sunny.water, shininess: 35, specular: 0xcaf9ff });
  const sea = new THREE.Mesh(new THREE.PlaneGeometry(2300, 1500), waterMaterial); sea.rotation.x = -Math.PI / 2; sea.position.set(500, -34, 310); scene.add(sea);
  function islandShape(inset) {
    const s = new THREE.Shape();
    // An organic, beveled island. The playable coordinate system remains rectangular.
    const left = 22 + inset, right = 978 - inset, top = 26 + inset, bottom = 597 - inset, r = 91;
    s.moveTo(left + r, -top); s.lineTo(right - r, -top);
    s.quadraticCurveTo(right + 8, -top - 4, right, -top - r);
    s.lineTo(right + 2, -bottom + r); s.quadraticCurveTo(right - 3, -bottom - 4, right - r, -bottom);
    s.lineTo(left + r, -bottom); s.quadraticCurveTo(left - 8, -bottom + 4, left, -bottom + r);
    s.lineTo(left - 2, -top - r); s.quadraticCurveTo(left - 5, -top, left + r, -top); return s;
  }
  const sandMaterial = new THREE.MeshLambertMaterial({ color: PALETTES.sunny.sand });
  const grassMaterial = new THREE.MeshLambertMaterial({ color: PALETTES.sunny.grass });
  const sand = new THREE.Mesh(new THREE.ExtrudeGeometry(islandShape(0), { depth: 32, bevelEnabled: true, bevelThickness: 4, bevelSize: 4, bevelSegments: 2, curveSegments: 16 }), sandMaterial);
  sand.rotation.x = -Math.PI / 2; sand.position.y = -30; scene.add(sand);
  const grass = new THREE.Mesh(new THREE.ExtrudeGeometry(islandShape(21), { depth: 4, bevelEnabled: true, bevelThickness: 3, bevelSize: 3, bevelSegments: 2, curveSegments: 16 }), grassMaterial);
  grass.rotation.x = -Math.PI / 2; grass.position.y = 10; scene.add(grass);
  const pathMaterial = new THREE.MeshBasicMaterial({ color: PALETTES.sunny.path });
  const pathCurve = new THREE.CatmullRomCurve3([new THREE.Vector3(155, 16, 405), new THREE.Vector3(267, 16, 290), new THREE.Vector3(370, 16, 214), new THREE.Vector3(696, 16, 217), new THREE.Vector3(773, 16, 350), new THREE.Vector3(803, 16, 490)]);
  const pathMesh = new THREE.Mesh(new THREE.TubeGeometry(pathCurve, 48, 21, 4, false), pathMaterial); pathMesh.scale.y = .035; pathMesh.position.y = 17.5; scene.add(pathMesh);

  // Ground details share one geometry and one draw call per material.
  const flowerGeometry = new THREE.SphereGeometry(1, 6, 4);
  const flowers = new THREE.InstancedMesh(flowerGeometry, mat(0xffffff), 180);
  const stems = new THREE.InstancedMesh(cone, mat(0x4d986b), 48);
  const dummy = new THREE.Object3D(); let flowerIndex = 0, stemIndex = 0;
  for (let i = 0; i < 48; i++) {
    const x = 82 + (i * 131 % 832), z = 80 + (i * 97 % 445);
    if (x > 70 && x < 240 && z > 230 && z < 450) continue;
    dummy.position.set(x, 20, z); dummy.scale.set(3, 8, 3); dummy.updateMatrix(); stems.setMatrixAt(stemIndex++, dummy.matrix);
    for (let j = 0; j < 4; j++) {
      dummy.position.set(x + Math.cos(j * Math.PI / 2) * 4, 24, z + Math.sin(j * Math.PI / 2) * 4); dummy.scale.set(4, 2, 4); dummy.updateMatrix(); flowers.setMatrixAt(flowerIndex, dummy.matrix); flowers.setColorAt(flowerIndex++, new THREE.Color(i % 3 ? 0xfff2c7 : 0xd8a7db));
    }
  }
  flowers.count = flowerIndex; stems.count = stemIndex; scene.add(flowers, stems);
  const waves = [];
  for (let i = 0; i < 14; i++) {
    const m = new THREE.Mesh(new THREE.TorusGeometry(22 + i % 3 * 10, 1.1, 3, 20, Math.PI * 1.1), new THREE.MeshBasicMaterial({ color: 0xd4f5fb, transparent: true, opacity: .26 }));
    m.rotation.x = -Math.PI / 2; m.position.set(i % 2 ? -35 - i * 7 : 1025 + i * 6, -32, 65 + i * 38); scene.add(m); waves.push(m);
  }
  const clouds = [];
  for (const [x, z, size] of [[40, -54, 1], [1070, 90, 1.1], [1010, 623, .8], [-53, 568, .8]]) {
    const g = new THREE.Group(); for (let i = 0; i < 4; i++) ball(g, 0xfff9ed, [i * 20 - 30, Math.sin(i) * 7, 0], [25, 15 + i % 2 * 6, 18]); g.position.set(x, 65, z); g.scale.setScalar(size); scene.add(g); clouds.push(g);
  }

  function animal(species, player = false) {
    const root = new THREE.Group(), body = new THREE.Group(), head = new THREE.Group(); root.add(body); body.add(head); head.position.y = 38;
    const fur = species === 'reindeer' ? 0xc98d61 : species === 'fox' ? 0xf2a65b : species === 'duck' ? 0xffd268 : species === 'cat' ? 0xb2a0dc : 0xfff6e7;
    ball(body, fur, [0, 22, 0], [21, 25, 18]); ball(body, 0xfff2d5, [0, 22, 14], [14, 17, 5]);
    ball(head, fur, [0, 9, 0], [27, 24, 23]);
    const feet = [ball(body, fur, [-11, 3, 8], [10, 5, 14]), ball(body, fur, [11, 3, 8], [10, 5, 14])];
    const arms = [ball(body, fur, [-24, 25, 3], [7, 12, 8]), ball(body, fur, [24, 25, 3], [7, 12, 8])];
    const eyes = [ball(head, 0x25354d, [-10, 13, 20], [3.9, 5.5, 2.4]), ball(head, 0x25354d, [10, 13, 20], [3.9, 5.5, 2.4])];
    ball(head, 0xffffff, [-11, 15, 22], [1.2, 1.4, 1]); ball(head, 0xffffff, [9, 15, 22], [1.2, 1.4, 1]);
    ball(head, 0xe7a29c, [-19, 4, 17], [4.7, 2.2, 1.5]); ball(head, 0xe7a29c, [19, 4, 17], [4.7, 2.2, 1.5]);
    if (species === 'duck') ball(head, 0xee974d, [0, 1, 25], [11, 4, 9]);
    else {
      ball(head, 0xfff0db, [0, -.5, 19], [13, 8, 7]); ball(head, species === 'reindeer' ? 0x285976 : 0x775263, [0, 3, 26], [4, 3, 2]);
      const smile = new THREE.QuadraticBezierCurve3(new THREE.Vector3(-6, -.5, 26), new THREE.Vector3(0, -7, 27), new THREE.Vector3(6, -.5, 26));
      mesh(head, new THREE.TubeGeometry(smile, 8, .8, 4, false), 0x453a4f, [0, 0, 0], [1, 1, 1]);
    }
    const ears = [];
    if (species === 'bunny') {
      for (const side of [-1, 1]) { const ear = ball(head, fur, [side * 12, 39, 0], [7, 25, 7]); ear.rotation.z = side * -.12; ears.push(ear); ball(head, 0xefb1b2, [side * 12, 40, 6], [3, 17, 1.5]); }
    } else if (species === 'cat' || species === 'fox') {
      for (const side of [-1, 1]) { const ear = mesh(head, cone, fur, [side * 18, 30, 0], [10, 23, 8]); ear.rotation.z = side * -.28; ears.push(ear); }
      const tail = ball(body, fur, [25, 19, -13], [9, 24, 9]); tail.rotation.z = -.8; ball(body, species === 'fox' ? 0xfff3dc : fur, [32, 34, -13], [8, 10, 8]);
    } else if (species === 'reindeer') {
      for (const side of [-1, 1]) {
        const ear = ball(head, fur, [side * 27, 17, -1], [11, 6, 6]); ears.push(ear);
        between(head, [side * 15, 25, -3], [side * 25, 51, -3], 2.7, 0x845d49);
        between(head, [side * 25, 51, -3], [side * 34, 57, -3], 2.2, 0x845d49);
        between(head, [side * 24, 49, -3], [side * 20, 57, -3], 2.2, 0x845d49);
      }
    }
    if (player) {
      mesh(head, cylinder, 0x279eb4, [0, 31, 2], [27, 13, 24]); mesh(head, cylinder, 0x23869e, [0, 25, 3], [34, 5, 28]);
      const badge = mesh(head, new THREE.ShapeGeometry(starShape(7)), 0xffedc7, [0, 32, 26], [1, 1, 1], true); badge.rotation.x = -.1;
      mesh(body, cylinder, 0x257e97, [0, 33, 0], [21.5, 7, 18.5]);
    }
    const wings = new THREE.Group(); body.add(wings); wings.visible = false;
    for (const side of [-1, 1]) for (let i = 0; i < 3; i++) { const feather = ball(wings, 0xfff7e9, [side * (28 + i * 10), 27 + i * 4, -5], [16, 5, 8]); feather.rotation.z = side * .4; }
    const nameTag = label(player ? 'YOU ★' : species === 'bunny' ? 'Bunny ♡' : species === 'duck' ? 'Duck ♡' : 'Fox ♡', player ? 68 : 80, 24);
    root.add(nameTag); nameTag.position.set(0, 108, 0);
    const heartTag = label('♥', 28, 26, '#fff5dc', '#c86a8b'); root.add(heartTag); heartTag.position.set(0, 110, 0); heartTag.visible = false;
    const floorShadow = shadow(0, 0, 90, 60);
    scene.add(root);
    return { root, body, head, eyes, feet, arms, ears, wings, nameTag, heartTag, floorShadow };
  }
  const playerModels = Object.fromEntries(['reindeer', 'bunny', 'cat'].map(name => [name, animal(name, true)]));
  const friends = ['bunny', 'duck', 'fox'].map(name => animal(name));

  const cottage = new THREE.Group(); cottage.position.set(155, 15, 310); scene.add(cottage); shadow(160, 315, 185, 145);
  cube(cottage, 0xffedc5, [0, 43, 0], [119, 86, 93]);
  const roofShape = new THREE.Shape(); roofShape.moveTo(-73, 0); roofShape.lineTo(0, 58); roofShape.lineTo(73, 0); roofShape.closePath();
  mesh(cottage, new THREE.ExtrudeGeometry(roofShape, { depth: 109, bevelEnabled: true, bevelSize: 2, bevelThickness: 2, bevelSegments: 1 }), 0xb96e50, [0, 84, -54], [1, 1, 1]);
  cube(cottage, 0x986a54, [39, 130, -15], [18, 39, 20]);
  cube(cottage, 0x336a83, [0, 26, 48], [27, 52, 3]); ball(cottage, 0xffd174, [8, 26, 52], [2, 2, 2]);
  const windowMaterial = new THREE.MeshLambertMaterial({ color: 0xa6deef, emissive: 0x000000 });
  for (const x of [-38, 38]) {
    const frame = cube(cottage, 0xffffff, [x, 48, 49], [26, 28, 4]);
    const pane = new THREE.Mesh(box, windowMaterial); pane.position.set(x, 48, 52); pane.scale.set(20, 22, 1); cottage.add(pane);
    cube(cottage, 0xfff7dd, [x, 48, 53], [2, 22, 2]); cube(cottage, 0xfff7dd, [x, 48, 53], [20, 2, 2]);
    cube(cottage, 0xa68068, [x, 28, 55], [30, 9, 14]); ball(cottage, 0x87ad76, [x, 35, 58], [17, 8, 8]);
  }
  // Each homecoming lights one porch lantern, without extra light passes.
  const porchLanterns = [-38, 0, 38].map(x => {
    cube(cottage, 0x6e6751, [x, 79, 51], [15, 19, 9]);
    return cube(cottage, 0xffd174, [x, 79, 57], [10, 13, 3], true);
  });
  const homeLabel = label('⌂ HOME', 105, 29); cottage.add(homeLabel); homeLabel.position.set(0, 163, 0);
  const homeRing = new THREE.Mesh(new THREE.RingGeometry(64, 67, 48), new THREE.MeshBasicMaterial({ color: 0xfff7bd, transparent: true, opacity: .65, side: THREE.DoubleSide })); homeRing.rotation.x = -Math.PI / 2; homeRing.position.set(155, 16.6, 400); scene.add(homeRing);
  const balloons = [];
  for (let i = 0; i < 3; i++) {
    const g = new THREE.Group(); ball(g, [0xe9a1cc, 0xffd572, 0x83c8e1][i], [0, 0, 0], [18, 23, 17]);
    between(g, [0, -20, 0], [0, -90, 0], .7, 0x80648b); g.position.set(90 + i * 65, 150, 430); scene.add(g); balloons.push(g);
  }
  const pondGroup = new THREE.Group(); pondGroup.position.set(538, 16, 293); scene.add(pondGroup);
  mesh(pondGroup, cylinder, 0x83b799, [0, 1, 0], [106, 5, 106]);
  const pondMaterial = new THREE.MeshPhongMaterial({ color: 0x53b0d0, shininess: 65, specular: 0xe5f8ff });
  const pond = new THREE.Mesh(cylinder, pondMaterial); pond.scale.set(97, 4, 97); pond.position.y = 3; pondGroup.add(pond);
  const lily = mesh(pondGroup, cylinder, 0xbcd982, [38, 7, 37], [18, 1.5, 15]); ball(pondGroup, 0xffedbd, [40, 11, 37], [7, 4, 7]);
  const pondLabel = label('AROUND ↷', 95, 24, '#e1f5f2'); pondGroup.add(pondLabel); pondLabel.position.set(0, 22, -3);
  const treeGroups = [];
  for (const [x, z, scale] of [[910, 306, 1], [360, 465, 1]]) {
    const g = new THREE.Group(); mesh(g, cylinder, 0xaa8064, [0, 24, 0], [9, 48, 9]);
    mesh(g, cone, 0x587b59, [0, 53, 0], [35, 61, 35]);
    mesh(g, cone, 0x6b8d61, [0, 76, 0], [28, 55, 28]);
    mesh(g, cone, 0x88a674, [0, 96, 0], [20, 46, 20]);
    g.position.set(x, 16, z); scene.add(g); treeGroups.push(g); shadow(x, z, 110, 72);
  }
  const logs = new THREE.Group(); scene.add(logs);
  for (const [x, z, w, h] of [[500, 275, 185, 55], [620, 370, 160, 48]]) {
    const trunk = mesh(logs, cylinder, 0xbd9167, [x, 16 + h / 2, z], [h / 2, w, h / 2]); trunk.rotation.z = Math.PI / 2;
    const end = mesh(logs, cylinder, 0xf1cc96, [x + w / 2 + .5, 16 + h / 2, z], [h / 2 - 3, 1, h / 2 - 3]); end.rotation.z = Math.PI / 2;
  }
  const snacks = [];
  for (const [x, z] of [[265, 290], [422, 102], [667, 118], [745, 426], [500, 495]]) {
    const g = new THREE.Group(); mesh(g, starGeometry, 0xffd873, [0, 37, 0], [1.15, 1.15, 1.15]);
    const aura = mesh(g, cylinder, 0xffefbb, [0, 1, 0], [22, 1.4, 22], true); g.position.set(x, 16, z); scene.add(g); snacks.push(g);
  }
  const butterflies = [];
  for (let i = 0; i < 3; i++) {
    const g = new THREE.Group(); ball(g, 0x565285, [0, 0, 0], [1.6, 6, 1.6]);
    const left = ball(g, i % 2 ? 0xffc96a : 0xc3a1e9, [-6, 1, 0], [6, 8, 2]); const right = ball(g, i % 2 ? 0xffc96a : 0xc3a1e9, [6, 1, 0], [6, 8, 2]);
    scene.add(g); butterflies.push({ g, left, right });
  }
  const shell = new THREE.Group(); ball(shell, 0xffd5bc, [0, 6, 0], [16, 9, 14]); ball(shell, 0xfff2d9, [0, 11, 2], [9, 7, 9]); shell.position.set(920, 16, 535); scene.add(shell);
  const moon = new THREE.Group(); ball(moon, 0xffedbc, [0, 0, 0], [31, 31, 8]); moon.position.set(76, 145, 30); scene.add(moon);
  const nightStars = new THREE.InstancedMesh(sparkGeometry, new THREE.MeshBasicMaterial({ color: 0xfff2c7, side: THREE.DoubleSide }), 34);
  for (let i = 0; i < 34; i++) { dummy.position.set(35 + i * 137 % 930, 140 + i * 31 % 95, -28 + i % 4 * 22); dummy.rotation.set(0, 0, i); dummy.scale.setScalar(1 + i % 3 * .35); dummy.updateMatrix(); nightStars.setMatrixAt(i, dummy.matrix); } scene.add(nightStars);
  const rainbow = new THREE.Group(); rainbow.position.set(500, 35, 330); scene.add(rainbow);
  [0xe7a4bd, 0xf4bf8b, 0xffe08b, 0xa6d993, 0x8fd2df, 0xaaa7df].forEach((c, i) => rainbow.add(new THREE.Mesh(new THREE.TorusGeometry(232 - i * 10, 5.8, 5, 48, Math.PI), mat(c, true))));
  const sparkles = new THREE.InstancedMesh(sparkGeometry, new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide, transparent: true, opacity: .9, depthWrite: false }), LIMITS.sparkles); scene.add(sparkles); sparkles.count = 0;
  const confetti = new THREE.InstancedMesh(box, mat(0xffffff, true), LIMITS.confetti); scene.add(confetti); confetti.count = 0;
  const confettiColors = [0xffd46f, 0xf5a9c5, 0xa8a1e0, 0x90d6df]; for (let i = 0; i < LIMITS.confetti; i++) confetti.setColorAt(i, new THREE.Color(confettiColors[i % 4]));
  let lastMood = '', lastPhase = '', startAt = 0, renderedAt = -1, renderedFrames = 0, fpsAt = 0, fps = 0, phone = false;
  function resize(width, height) {
    phone = width < 500;
    const dpr = Math.min(window.devicePixelRatio || 1, LIMITS.pixelRatio, Math.sqrt(LIMITS.maxPixels / (width * height)));
    renderer.setPixelRatio(Math.max(.75, dpr)); renderer.setSize(width, height, false);
  }
  function animateAnimal(model, x, z, scale, moving, time, flying, status, id, facing = 0) {
    model.root.visible = true; model.floorShadow.visible = true;
    model.root.position.set(x, 18 + (flying ? 32 : 0), z); model.root.scale.setScalar(scale);
    const hop = moving ? Math.abs(Math.sin(time * 10 + id)) * 8 : Math.sin(time * 2.2 + id) * 1.5;
    model.body.position.y = hop; model.body.rotation.z = moving ? Math.sin(time * 10 + id) * .06 : Math.sin(time + id) * .025;
    model.body.rotation.y += (facing - model.body.rotation.y) * .15;
    model.head.rotation.z = Math.sin(time * 1.7 + id) * .065;
    const blink = (time + id * 1.17) % 4.8 < .12; model.eyes.forEach(eye => { eye.scale.y = blink ? .5 : 5.5; });
    model.feet.forEach((foot, i) => { foot.position.y = 3 + (moving ? Math.max(0, Math.sin(time * 10 + i * Math.PI + id)) * 7 : 0); });
    model.arms.forEach((arm, i) => { arm.rotation.z = status === 'home' ? Math.sin(time * 6 + i) * .55 : moving ? Math.sin(time * 10 + i * Math.PI) * .3 : 0; });
    model.wings.visible = flying; model.wings.rotation.z = Math.sin(time * 9) * .12;
    model.nameTag.visible = status === 'lost' || status === 'player'; model.heartTag.visible = status === 'following';
    model.floorShadow.position.set(x, 18.3, z); model.floorShadow.scale.set(85 * scale, 56 * scale, 1);
  }
  function draw(state, now) {
    const power = state.config.lowPower;
    if (power && now - renderedAt < 1 / 30) return;
    renderedAt = now;
    const calm = state.config.reducedMotion || state.phase === 'paused';
    const time = calm ? 1.6 : now;
    const centerX = phone && state.phase === 'ready' ? 270 : 500;
    camera.position.x = centerX; camera.lookAt(centerX, 0, 300);
    if (state.phase !== lastPhase) { if (state.phase === 'playing' && lastPhase === 'ready') startAt = now; lastPhase = state.phase; }
    if (state.config.worldMood !== lastMood) {
      const p = PALETTES[state.config.worldMood] || PALETTES.sunny; const night = state.config.worldMood === 'moonlight';
      scene.background = new THREE.Color(p.sky); waterMaterial.color.setHex(p.water); sandMaterial.color.setHex(p.sand); grassMaterial.color.setHex(p.grass); pathMaterial.color.setHex(p.path); sun.color.setHex(p.light); sun.intensity = night ? 1.3 : 3; ambient.intensity = night ? 1.7 : 2.2;
      pondMaterial.color.setHex(night ? 0x385b91 : 0x53b0d0); windowMaterial.color.setHex(night ? 0xffd982 : 0xa6deef); windowMaterial.emissive.setHex(night ? 0xa86120 : 0x000000);
      moon.visible = night; nightStars.visible = night; lastMood = state.config.worldMood;
    }
    pondGroup.visible = state.config.obstacleStyle === 'pond'; treeGroups.forEach(g => { g.visible = state.config.obstacleStyle === 'pond'; }); logs.visible = state.config.obstacleStyle === 'logs';
    waves.forEach((w, i) => { w.scale.setScalar(1 + Math.sin(time * .6 + i) * .12); });
    clouds.forEach((g, i) => { g.position.y = 65 + Math.sin(time * .5 + i) * 4; });
    butterflies.forEach(({ g, left, right }, i) => { g.position.set(82 + i * 33 + Math.sin(time * .7 + i) * 14, 66 + Math.sin(time * 1.5 + i) * 7, 128 + i * 19 + Math.cos(time * .8) * 13); left.rotation.y = Math.sin(time * 9) * .6; right.rotation.y = -left.rotation.y; });
    shell.rotation.y = state.discoveries.includes('shell') ? Math.sin(time * 1.7) * .2 : -.25;
    balloons.forEach((g, i) => { g.visible = state.rescued > i; g.position.y = 150 + Math.sin(time * 1.2 + i) * 5; });
    porchLanterns.forEach((lamp, i) => { lamp.material = mat(state.rescued > i ? 0xffd174 : 0x9a9b85, state.rescued > i); });
    homeRing.material.opacity = .48 + Math.sin(time * 2) * .12;
    snacks.forEach((g, i) => { g.visible = !state.snacks[i].collected; g.children[0].position.y = 37 + Math.sin(time * 2 + i) * 5; g.children[0].rotation.y = Math.sin(time * .8 + i) * .3; });
    Object.values(playerModels).forEach(m => { m.root.visible = m.floorShadow.visible = false; });
    const helper = playerModels[state.config.playerAnimal] || playerModels.reindeer;
    const won = state.phase === 'won';
    const baseScale = 1.32 * state.config.animalScale;
    const intro = state.phase === 'ready' ? 1 : calm ? 0 : Math.max(0, 1 - (now - startAt) / .65);
    let px = state.player.x, pz = state.player.y, scale = baseScale;
    if (intro > 0) { px += (260 - px) * intro; pz += (365 - pz) * intro; scale += (2.8 - scale) * intro; }
    if (won) { px = 485; pz = 447; scale = 1.9; }
    animateAnimal(helper, px, pz, scale, won || state.player.moving, time, state.config.flying, 'player', 0, state.player.moving && !won ? state.player.facing * .35 : -.1);
    friends.forEach((model, i) => {
      const f = state.friends[i]; let x = f.x, z = f.y, s = baseScale;
      if (intro > 0) { const positions = [[130, 414], [388, 441], [409, 327]][i]; x += (positions[0] - x) * intro; z += (positions[1] - z) * intro; s += (1.65 - s) * intro; }
      if (won) { x = [345, 610, 726][i]; z = [453, 460, 446][i]; s = 1.7; }
      animateAnimal(model, x, z, s, won || f.status === 'following' && state.player.moving, time + i * .3, state.config.flying, f.status, i + 1, 0);
    });
    rainbow.visible = won; rainbow.scale.setScalar(won ? Math.min(1, .15 + state.celebrationTime * .55) : 0);
    confetti.count = won && !calm && state.celebrationTime < 7 ? LIMITS.confetti : 0;
    for (let i = 0; i < confetti.count; i++) {
      dummy.position.set(170 + i * 139 % 700 + Math.sin(time + i) * 16, 100 + (i * 23 - state.celebrationTime * 72) % 265 + 130, 260 + i * 31 % 270); dummy.rotation.set(time + i, i, time * .9 + i); dummy.scale.set(5, 9, 2); dummy.updateMatrix(); confetti.setMatrixAt(i, dummy.matrix);
    }
    if (confetti.count) confetti.instanceMatrix.needsUpdate = true;
    let count = 0;
    if (!calm) for (const e of state.effects) for (let i = 0; i < 10 && count < LIMITS.sparkles; i++) {
      const progress = e.age / e.life, a = i * Math.PI / 5 + e.seed;
      dummy.position.set(e.x + Math.cos(a) * progress * 59, 29 + Math.sin(progress * Math.PI) * 65 + i % 3 * 8, e.y + Math.sin(a) * progress * 45); dummy.rotation.set(-.3, 0, a + progress * 2); dummy.scale.setScalar((1 - progress) * (e.kind === 'home' ? 1.8 : 1.3)); dummy.updateMatrix(); sparkles.setMatrixAt(count, dummy.matrix); sparkles.setColorAt(count++, new THREE.Color(e.kind === 'hearts' ? 0xf0a7cc : 0xffdf89));
    }
    sparkles.count = count; if (count) { sparkles.instanceMatrix.needsUpdate = true; sparkles.instanceColor.needsUpdate = true; }
    renderer.render(scene, camera);
    renderedFrames++; if (now - fpsAt > 1) { fps = Math.round(renderedFrames / (now - fpsAt)); renderedFrames = 0; fpsAt = now; }
  }
  function stats() { return { mode: '3D', fps, drawCalls: renderer.info.render.calls, triangles: renderer.info.render.triangles, pixelRatio: +renderer.getPixelRatio().toFixed(2), geometries: renderer.info.memory.geometries, textures: renderer.info.memory.textures }; }
  return { draw, resize, stats };
}
window.RescueScene = { create, LIMITS };
