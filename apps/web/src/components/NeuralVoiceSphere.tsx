import { useEffect, useRef } from "react";
import * as THREE from "three";

interface NeuralVoiceSphereProps {
  isPlaying?: boolean;
  className?: string;
}

export function NeuralVoiceSphere({ isPlaying = false, className = "" }: NeuralVoiceSphereProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const isPlayingRef = useRef(isPlaying);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Detect mobile viewport
    const isMobile = window.innerWidth < 768;
    const isSmallMobile = window.innerWidth < 480;

    // Dimensions
    const width = container.clientWidth || 360;
    const height = container.clientHeight || 360;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.z = isSmallMobile ? 290 : isMobile ? 260 : 230;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: !isMobile, // Disable MSAA on mobile for 60fps thermal efficiency
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
    container.appendChild(renderer.domElement);

    // ── Create Particle Sphere ──
    const particleCount = isSmallMobile ? 1400 : isMobile ? 1800 : 2800;
    const baseRadius = isSmallMobile ? 70 : isMobile ? 78 : 85;

    const positions = new Float32Array(particleCount * 3);
    const originalPositions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const scales = new Float32Array(particleCount);

    const emerald = new THREE.Color("#10b981");
    const teal = new THREE.Color("#06b6d4");
    const mint = new THREE.Color("#6ee7b7");
    const amber = new THREE.Color("#fbbf24");

    for (let i = 0; i < particleCount; i++) {
      // Fibonacci sphere distribution for uniform dispersion
      const phi = Math.acos(1 - (2 * (i + 0.5)) / particleCount);
      const theta = Math.PI * (1 + 5 ** 0.5) * i;

      const x = baseRadius * Math.sin(phi) * Math.cos(theta);
      const y = baseRadius * Math.sin(phi) * Math.sin(theta);
      const z = baseRadius * Math.cos(phi);

      const i3 = i * 3;
      positions[i3] = x;
      positions[i3 + 1] = y;
      positions[i3 + 2] = z;

      originalPositions[i3] = x;
      originalPositions[i3 + 1] = y;
      originalPositions[i3 + 2] = z;

      // Color gradient mixing
      const mixRatio = Math.sin(phi * 2 + theta) * 0.5 + 0.5;
      const c = new THREE.Color();
      if (i % 9 === 0) {
        c.copy(amber);
      } else if (mixRatio > 0.6) {
        c.copy(emerald);
      } else if (mixRatio > 0.3) {
        c.copy(teal);
      } else {
        c.copy(mint);
      }

      colors[i3] = c.r;
      colors[i3 + 1] = c.g;
      colors[i3 + 2] = c.b;

      scales[i] = Math.random() * 0.8 + 0.6;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    // Particle Texture creation via 2D Canvas
    const canvas = document.createElement("canvas");
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
      gradient.addColorStop(0, "rgba(255,255,255,1)");
      gradient.addColorStop(0.3, "rgba(52,211,153,0.85)");
      gradient.addColorStop(0.7, "rgba(6,182,212,0.3)");
      gradient.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 32, 32);
    }
    const texture = new THREE.CanvasTexture(canvas);

    const material = new THREE.PointsMaterial({
      size: isMobile ? 3.8 : 3.2,
      map: texture,
      vertexColors: true,
      transparent: true,
      opacity: 0.88,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const pointCloud = new THREE.Points(geometry, material);
    scene.add(pointCloud);

    // ── Neural Orbit Rings ──
    const ringGeometry1 = new THREE.RingGeometry(baseRadius * 1.25, baseRadius * 1.27, 48);
    const ringMaterial1 = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.18,
    });
    const ring1 = new THREE.Mesh(ringGeometry1, ringMaterial1);
    ring1.rotation.x = Math.PI / 3;
    ring1.rotation.y = Math.PI / 6;
    scene.add(ring1);

    const ringGeometry2 = new THREE.RingGeometry(baseRadius * 1.45, baseRadius * 1.47, 48);
    const ringMaterial2 = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.12,
    });
    const ring2 = new THREE.Mesh(ringGeometry2, ringMaterial2);
    ring2.rotation.x = -Math.PI / 4;
    ring2.rotation.z = Math.PI / 5;
    scene.add(ring2);

    // ── Mouse & Touch Tracking (Fully Mobile Responsive) ──
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const onPointerMove = (clientX: number, clientY: number) => {
      const rect = container.getBoundingClientRect();
      const x = (clientX - rect.left) / rect.width - 0.5;
      const y = (clientY - rect.top) / rect.height - 0.5;
      targetX = x * 1.4;
      targetY = y * 1.4;
    };

    const handleMouseMove = (e: MouseEvent) => {
      onPointerMove(e.clientX, e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });

    // ── Animation Loop ──
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsed = clock.getElapsedTime();
      const playing = isPlayingRef.current;
      const speedMultiplier = playing ? 2.4 : 1.0;
      const amplitude = playing ? (isMobile ? 12 : 16) : 5;

      // Smooth camera / group rotation lerp
      mouseX += (targetX - mouseX) * 0.05;
      mouseY += (targetY - mouseY) * 0.05;

      pointCloud.rotation.y = elapsed * 0.12 * speedMultiplier + mouseX * 0.8;
      pointCloud.rotation.x = Math.sin(elapsed * 0.08) * 0.2 + mouseY * 0.8;

      ring1.rotation.z = elapsed * 0.15 * speedMultiplier;
      ring2.rotation.y = -elapsed * 0.1 * speedMultiplier;

      // Particle Displacement Wave Simulation
      const posAttr = geometry.attributes.position as THREE.BufferAttribute;
      const array = posAttr.array as Float32Array;

      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        const ox = originalPositions[i3];
        const oy = originalPositions[i3 + 1];
        const oz = originalPositions[i3 + 2];

        // Frequency distortion
        const freq =
          Math.sin(ox * 0.04 + elapsed * 2.2 * speedMultiplier) *
          Math.cos(oy * 0.04 + elapsed * 1.8 * speedMultiplier) *
          Math.sin(oz * 0.04 + elapsed * 2.0);

        const displacement = 1 + (freq * amplitude) / baseRadius;

        array[i3] = ox * displacement;
        array[i3 + 1] = oy * displacement;
        array[i3 + 2] = oz * displacement;
      }

      posAttr.needsUpdate = true;
      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      const mobileNow = window.innerWidth < 768;
      const smallMobileNow = window.innerWidth < 480;

      camera.position.z = smallMobileNow ? 290 : mobileNow ? 260 : 230;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, mobileNow ? 1.5 : 2));
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      ringGeometry1.dispose();
      ringMaterial1.dispose();
      ringGeometry2.dispose();
      ringMaterial2.dispose();
      texture.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className={`relative w-full h-full flex items-center justify-center select-none touch-none ${className}`}
    />
  );
}
