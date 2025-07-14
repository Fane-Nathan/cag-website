// src/components/WaveAnimation.jsx

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import './WaveAnimation.css';

const createCircleTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const context = canvas.getContext('2d');
  context.beginPath();
  context.arc(16, 16, 15, 0, 2 * Math.PI);
  context.fillStyle = '#FFFFFF';
  context.fill();
  return new THREE.CanvasTexture(canvas);
};

function WaveAnimation() {
  const mountRef = useRef(null);

  useEffect(() => {
    const currentMount = mountRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      currentMount.clientWidth / currentMount.clientHeight,
      1,
      10000
    );
    camera.position.z = 1000;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0); // Transparent background
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    currentMount.appendChild(renderer.domElement);

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(-1, -1);
    const intersectionPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const intersectionPoint = new THREE.Vector3();

    const SEPARATION = 160;
    const AMOUNTX = 140;
    const AMOUNTY = 140;
    const positions = [];
    const scales = [];
    const colors = [];
    const baseColor = new THREE.Color(0xffffff); // Pure white for better visibility

    let i = 0;
    for (let ix = 0; ix < AMOUNTX; ix++) {
      for (let iy = 0; iy < AMOUNTY; iy++) {
        positions[i] = ix * SEPARATION - (AMOUNTX * SEPARATION) / 2;
        positions[i + 1] = -500;
        positions[i + 2] = iy * SEPARATION - (AMOUNTY * SEPARATION) / 2;
        scales[i / 3] = 1;
        baseColor.toArray(colors, i);
        i += 3;
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(positions, 3)
    );
    geometry.setAttribute('scale', new THREE.Float32BufferAttribute(scales, 1));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const particleTexture = createCircleTexture();

    // --- MODIFICATION: Adjust material for maximum visibility ---
    const material = new THREE.PointsMaterial({
      size: 25, // Even larger size for debugging
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.5, // Full opacity for debugging
      sizeAttenuation: true, // Disable size attenuation for consistent size
      map: particleTexture,
      vertexColors: true,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    let mouseX = 0;
    let mouseY = 0;
    let windowHalfX = currentMount.clientWidth / 2;
    let windowHalfY = currentMount.clientHeight / 2;

    const onDocumentMouseMove = event => {
      mouseX = event.clientX - windowHalfX;
      mouseY = event.clientY - windowHalfY;
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    // Add click interaction for ripple effect
    const onDocumentClick = event => {
      const clickX = (event.clientX / window.innerWidth) * 2 - 1;
      const clickY = -(event.clientY / window.innerHeight) * 2 + 1;

      // Create a temporary ripple effect
      const tempMouse = { x: clickX, y: clickY };
      raycaster.setFromCamera(tempMouse, camera);
      raycaster.ray.intersectPlane(intersectionPlane, intersectionPoint);

      // Add ripple animation (this will be handled in the animate loop)
      window.rippleEffect = {
        x: intersectionPoint.x,
        z: intersectionPoint.z,
        time: 0,
        maxTime: 60, // frames
      };
    };

    const onWindowResize = () => {
      windowHalfX = currentMount.clientWidth / 2;
      windowHalfY = currentMount.clientHeight / 2;
      camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    };

    document.addEventListener('mousemove', onDocumentMouseMove);
    document.addEventListener('click', onDocumentClick);
    window.addEventListener('resize', onWindowResize);

    let count = 0;
    const animate = () => {
      requestAnimationFrame(animate);

      // Enhanced camera movement for more responsive feel
      camera.position.x += (mouseX - camera.position.x) * 0.0001;
      camera.position.y += (-mouseY - camera.position.y) * 0.0001;
      camera.position.y = Math.max(camera.position.y, -200);
      camera.lookAt(scene.position);

      raycaster.setFromCamera(mouse, camera);
      raycaster.ray.intersectPlane(intersectionPlane, intersectionPoint);

      const particlePositions = particles.geometry.attributes.position.array;
      const particleColors = particles.geometry.attributes.color.array;
      const particleScales = particles.geometry.attributes.scale.array;

      const hoverColor = new THREE.Color(0x00d4ff); // Blue glow on hover
      const hoverRadius = 300; // Smaller radius for more precise interaction
      const hoverScaleFactor = 3; // Bigger scale effect

      let i = 0;
      for (let ix = 0; ix < AMOUNTX; ix++) {
        for (let iy = 0; iy < AMOUNTY; iy++) {
          const particleIndex = i / 3;
          const particleX = particlePositions[i];
          const particleZ = particlePositions[i + 2];

          particlePositions[i + 1] =
            Math.sin((ix + count) * 0.3) * 50 +
            Math.sin((iy + count) * 0.5) * 50 -
            500;

          const waveScale =
            (Math.sin((ix + count) * 0.3) + 1) * 4 +
            (Math.sin((iy + count) * 0.5) + 1) * 4;

          const distSq =
            (particleX - intersectionPoint.x) ** 2 +
            (particleZ - intersectionPoint.z) ** 2;
          const color = new THREE.Color().fromArray(particleColors, i);

          // Check for ripple effect from clicks
          let rippleIntensity = 0;
          if (
            window.rippleEffect &&
            window.rippleEffect.time < window.rippleEffect.maxTime
          ) {
            const rippleDistSq =
              (particleX - window.rippleEffect.x) ** 2 +
              (particleZ - window.rippleEffect.z) ** 2;
            const rippleRadius =
              (window.rippleEffect.time / window.rippleEffect.maxTime) * 800;
            const rippleThickness = 100;

            if (
              Math.abs(Math.sqrt(rippleDistSq) - rippleRadius) < rippleThickness
            ) {
              rippleIntensity =
                1 - window.rippleEffect.time / window.rippleEffect.maxTime;
            }
          }

          if (distSq < hoverRadius ** 2) {
            // Enhanced hover effect with distance-based intensity
            const distance = Math.sqrt(distSq);
            const intensity = 1 - distance / hoverRadius;
            color.lerp(hoverColor, intensity * 0.8); // Stronger color change
            particleScales[particleIndex] = THREE.MathUtils.lerp(
              particleScales[particleIndex],
              waveScale * (1 + hoverScaleFactor * intensity),
              0.3
            );
          } else if (rippleIntensity > 0) {
            // Ripple effect from clicks
            const rippleColor = new THREE.Color(0x00ff88); // Green ripple
            color.lerp(rippleColor, rippleIntensity * 0.6);
            particleScales[particleIndex] = THREE.MathUtils.lerp(
              particleScales[particleIndex],
              waveScale * (1 + 2 * rippleIntensity),
              0.4
            );
          } else {
            color.lerp(baseColor, 0.1); // Faster return to normal
            particleScales[particleIndex] = THREE.MathUtils.lerp(
              particleScales[particleIndex],
              waveScale,
              0.1
            );
          }
          color.toArray(particleColors, i);

          i += 3;
        }
      }
      particles.geometry.attributes.position.needsUpdate = true;
      particles.geometry.attributes.scale.needsUpdate = true;
      particles.geometry.attributes.color.needsUpdate = true;

      renderer.render(scene, camera);
      count += 0.008;

      // Update ripple effect
      if (window.rippleEffect) {
        window.rippleEffect.time++;
        if (window.rippleEffect.time >= window.rippleEffect.maxTime) {
          window.rippleEffect = null;
        }
      }
    };

    animate();

    return () => {
      document.removeEventListener('mousemove', onDocumentMouseMove);
      document.removeEventListener('click', onDocumentClick);
      window.removeEventListener('resize', onWindowResize);
      window.rippleEffect = null; // Clean up ripple effect
      if (currentMount) {
        currentMount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} className="wave-animation-container" />;
}

export default WaveAnimation;
