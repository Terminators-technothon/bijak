// JudgeLoading.jsx — "BiJAk is waking up..." loading screen.
// Full-screen, Kawan 3D orb spinning, gold progress bar, taglines.
// Auto-advances to onDone() after ~3s.

const KAWAN_OBJ_PATH_JUDGE = 'kawan 3d model/Meshy_AI_Petronas_Orb_Bot_0427074620_texture_obj/Meshy_AI_Petronas_Orb_Bot_0427074620_texture.obj';
const KAWAN_MTL_PATH_JUDGE = 'kawan 3d model/Meshy_AI_Petronas_Orb_Bot_0427074620_texture_obj/Meshy_AI_Petronas_Orb_Bot_0427074620_texture.mtl';

const WAKING_TAGLINES = [
  "BiJAk is waking up...",
  "Polling stage sensors...",
  "Checking light + projector state...",
  "Connecting to Tuya Cloud...",
  "Ready for the judges. 🎯",
];

function JudgeLoading({ onDone }) {
  const stageRef = React.useRef(null);
  const [progress, setProgress] = React.useState(0);
  const [taglineIdx, setTagIdx] = React.useState(0);

  // Three.js scene
  React.useEffect(() => {
    const stage = stageRef.current;
    if (!stage || typeof THREE === 'undefined') return;

    const w = stage.clientWidth, h = stage.clientHeight;
    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 100);
    camera.position.set(0, 0, 3.6);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(w, h);
    stage.appendChild(renderer.domElement);

    // Stage-themed lights: warm gold key + maroon fill + cream ambient
    const key  = new THREE.DirectionalLight(0xFFC72C, 1.4); key.position.set(2, 2, 3);
    const fill = new THREE.DirectionalLight(0x8B2A3F, 0.6); fill.position.set(-2, -1, 2);
    const amb  = new THREE.AmbientLight(0xFFF6E8, 0.5);
    scene.add(key, fill, amb);

    // Placeholder while OBJ loads — glowing icosahedron
    const placeholder = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.95, 1),
      new THREE.MeshStandardMaterial({ color: 0xFFC72C, wireframe: true, emissive: 0xFFC72C, emissiveIntensity: 0.6 })
    );
    scene.add(placeholder);
    let object = placeholder;

    if (typeof THREE.MTLLoader === 'function' && typeof THREE.OBJLoader === 'function') {
      try {
        new THREE.MTLLoader().load(KAWAN_MTL_PATH_JUDGE, (mats) => {
          mats.preload();
          new THREE.OBJLoader().setMaterials(mats).load(KAWAN_OBJ_PATH_JUDGE, (root) => {
            const box = new THREE.Box3().setFromObject(root);
            const size = new THREE.Vector3(); box.getSize(size);
            const center = new THREE.Vector3(); box.getCenter(center);
            const scale = 1.9 / Math.max(size.x, size.y, size.z);
            root.scale.setScalar(scale);
            root.position.sub(center.multiplyScalar(scale));
            scene.remove(placeholder);
            scene.add(root);
            object = root;
          });
        });
      } catch (e) { /* keep placeholder */ }
    }

    let raf;
    let rot = 0;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      rot += 0.02;
      object.rotation.y = rot;
      object.rotation.x = Math.sin(rot * 0.5) * 0.15;
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      const ww = stage.clientWidth, hh = stage.clientHeight;
      camera.aspect = ww / hh;
      camera.updateProjectionMatrix();
      renderer.setSize(ww, hh);
    };
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      try { renderer.dispose(); stage.removeChild(renderer.domElement); } catch {}
    };
  }, []);

  // Progress bar + tagline cycler — ~3s total
  React.useEffect(() => {
    const startTs = Date.now();
    const DURATION = 3000;
    const id = setInterval(() => {
      const elapsed = Date.now() - startTs;
      const pct = Math.min(100, (elapsed / DURATION) * 100);
      setProgress(pct);
      const tagIdx = Math.min(WAKING_TAGLINES.length - 1, Math.floor((pct / 100) * WAKING_TAGLINES.length));
      setTagIdx(tagIdx);
      if (elapsed >= DURATION) {
        clearInterval(id);
        setTimeout(onDone, 250);
      }
    }, 80);
    return () => clearInterval(id);
  }, [onDone]);

  return (
    <div className="judge-loading">
      <div className="judge-spotlight judge-spotlight-l"></div>
      <div className="judge-spotlight judge-spotlight-r"></div>

      <div className="judge-loading-stage" ref={stageRef}></div>

      <div className="judge-loading-text">
        <div className="judge-loading-title">BiJAk</div>
        <div className="judge-loading-tagline">{WAKING_TAGLINES[taglineIdx]}</div>
        <div className="judge-progress-track">
          <div className="judge-progress-fill" style={{ width: progress + '%' }}></div>
        </div>
        <div className="judge-progress-pct">{Math.round(progress)}%</div>
      </div>
    </div>
  );
}
