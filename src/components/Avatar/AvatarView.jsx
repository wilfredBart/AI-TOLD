import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { VRMLoaderPlugin, VRMUtils } from "@pixiv/three-vrm";

const MODEL_URL = "/avatars/avatar.vrm";

export default function AvatarView() {
  const mountRef = useRef(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      28,
      mount.clientWidth / Math.max(mount.clientHeight, 1),
      0.1,
      20
    );
    camera.position.set(0, 1.42, 1.15);
    camera.lookAt(0, 1.35, 0);

    scene.add(new THREE.AmbientLight(0xffffff, 0.35));
    const key = new THREE.DirectionalLight(0xe8f2ff, 1.15);
    key.position.set(1.4, 2.2, 1.6);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x4ea3ff, 0.55);
    rim.position.set(-2.2, 0.8, -0.6);
    scene.add(rim);
    const fill = new THREE.PointLight(0x8fd0ff, 0.4);
    fill.position.set(0, 1.2, 1.8);
    scene.add(fill);

    let vrm = null;
    let stopped = false;
    const clock = new THREE.Clock();
    const lookTarget = new THREE.Vector3();

    const loader = new GLTFLoader();
    loader.register((parser) => new VRMLoaderPlugin(parser));
    loader.load(
      MODEL_URL,
      (gltf) => {
        if (stopped) return;
        vrm = gltf.userData.vrm;
        if (!vrm) {
          setFailed(true);
          return;
        }
        VRMUtils.removeUnnecessaryVertices(gltf.scene);
        if (VRMUtils.rotateVRM0) VRMUtils.rotateVRM0(vrm);
        vrm.scene.traverse((obj) => {
          obj.frustumCulled = false;
        });
        vrm.scene.position.set(0, -1.35, 0);
        scene.add(vrm.scene);
      },
      undefined,
      () => setFailed(true)
    );

    const resize = () => {
      if (!mount) return;
      const w = mount.clientWidth;
      const h = Math.max(mount.clientHeight, 1);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(mount);

    const tick = () => {
      if (stopped) return;
      requestAnimationFrame(tick);
      const delta = clock.getDelta();
      const t = clock.elapsedTime;
      if (vrm) {
        lookTarget.set(
          Math.sin(t * 0.4) * 0.35,
          1.35 + Math.sin(t * 0.7) * 0.05,
          1.2
        );
        vrm.lookAt?.lookAt(lookTarget);
        vrm.expressionManager?.setValue("blink", Math.pow(Math.sin(t * 2.2), 80));
        vrm.update(delta);
      }
      renderer.render(scene, camera);
    };
    tick();

    return () => {
      stopped = true;
      ro.disconnect();
      if (vrm) {
        scene.remove(vrm.scene);
        vrm.scene.traverse((obj) => {
          if (obj.geometry) obj.geometry.dispose();
          if (obj.material) {
            const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
            mats.forEach((m) => m.dispose?.());
          }
        });
      }
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="avatar-stage">
      <div className="avatar-glow" />
      {failed ? (
        <div className="avatar-fallback">
          <div className="avatar-circle">
            <span className="avatar-label">VRM</span>
          </div>
          <p className="avatar-hint">
            Model niet geladen — zet een .vrm in public/avatars/avatar.vrm
          </p>
        </div>
      ) : (
        <div className="avatar-canvas" ref={mountRef} />
      )}
    </div>
  );
}
