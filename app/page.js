'use client';

import { useEffect, useRef } from 'react';

export default function ForestScene() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Animation state
    let animationTime = 0;
    const sunsetDuration = 8000; // 8 seconds for sunset
    const fireflyStartTime = 9000; // Start fireflies after it's dark
    const fireflyBuildupDuration = 20000; // 20 seconds to build up fireflies

    // Fireflies
    const fireflies = [];
    const maxFireflies = 200;

    class Firefly {
      constructor(x, y, delay) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.brightness = 0;
        this.maxBrightness = Math.random() * 0.5 + 0.5;
        this.phase = Math.random() * Math.PI * 2;
        this.frequency = Math.random() * 0.02 + 0.01;
        this.size = Math.random() * 2 + 1.5;
        this.delay = delay;
        this.age = 0;
      }

      update(deltaTime) {
        this.age += deltaTime;

        if (this.age < this.delay) return;

        this.x += this.vx;
        this.y += this.vy;

        // Slight random direction changes
        if (Math.random() < 0.02) {
          this.vx += (Math.random() - 0.5) * 0.1;
          this.vy += (Math.random() - 0.5) * 0.1;
        }

        // Keep velocity reasonable
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speed > 1) {
          this.vx = (this.vx / speed) * 1;
          this.vy = (this.vy / speed) * 1;
        }

        // Wrap around screen
        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;

        this.phase += this.frequency;
        this.brightness = (Math.sin(this.phase) * 0.5 + 0.5) * this.maxBrightness;
      }

      draw(ctx) {
        if (this.age < this.delay) return;

        const intensity = this.brightness;

        // Glow effect
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 8);
        gradient.addColorStop(0, `rgba(255, 255, 150, ${intensity * 0.9})`);
        gradient.addColorStop(0.2, `rgba(255, 255, 100, ${intensity * 0.5})`);
        gradient.addColorStop(0.5, `rgba(200, 255, 100, ${intensity * 0.2})`);
        gradient.addColorStop(1, 'rgba(150, 255, 100, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 8, 0, Math.PI * 2);
        ctx.fill();

        // Bright core
        ctx.fillStyle = `rgba(255, 255, 200, ${intensity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Tree silhouettes
    const trees = [];
    for (let i = 0; i < 80; i++) {
      trees.push({
        x: Math.random() * canvas.width,
        width: Math.random() * 40 + 20,
        height: Math.random() * 400 + 200,
        depth: Math.random()
      });
    }
    trees.sort((a, b) => b.depth - a.depth);

    function drawSky(progress) {
      const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);

      if (progress < 1) {
        // Sunset colors
        const t = progress;
        const r1 = Math.floor(135 + (20 - 135) * t);
        const g1 = Math.floor(206 + (24 - 206) * t);
        const b1 = Math.floor(235 + (60 - 235) * t);

        const r2 = Math.floor(255 + (139 - 255) * t);
        const g2 = Math.floor(179 + (69 - 179) * t);
        const b2 = Math.floor(71 + (19 - 71) * t);

        const r3 = Math.floor(255 + (15 - 255) * t);
        const g3 = Math.floor(94 + (15 - 94) * t);
        const b3 = Math.floor(77 + (25 - 77) * t);

        skyGradient.addColorStop(0, `rgb(${r1}, ${g1}, ${b1})`);
        skyGradient.addColorStop(0.4, `rgb(${r2}, ${g2}, ${b2})`);
        skyGradient.addColorStop(1, `rgb(${r3}, ${g3}, ${b3})`);
      } else {
        // Night sky
        skyGradient.addColorStop(0, 'rgb(10, 15, 35)');
        skyGradient.addColorStop(0.5, 'rgb(15, 20, 40)');
        skyGradient.addColorStop(1, 'rgb(5, 10, 20)');
      }

      ctx.fillStyle = skyGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Stars appear after sunset
      if (progress > 0.5) {
        const starOpacity = Math.min((progress - 0.5) * 2, 1);
        ctx.fillStyle = `rgba(255, 255, 255, ${starOpacity * 0.8})`;
        for (let i = 0; i < 150; i++) {
          const x = (i * 7919) % canvas.width;
          const y = (i * 4271) % (canvas.height * 0.6);
          const size = ((i * 2731) % 100) / 100;
          if (size > 0.7) {
            ctx.beginPath();
            ctx.arc(x, y, size * 1.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    }

    function drawGround(progress) {
      const groundGradient = ctx.createLinearGradient(0, canvas.height * 0.7, 0, canvas.height);

      if (progress < 1) {
        const t = progress;
        const r1 = Math.floor(34 + (10 - 34) * t);
        const g1 = Math.floor(139 + (40 - 139) * t);
        const b1 = Math.floor(34 + (10 - 34) * t);

        const r2 = Math.floor(20 + (5 - 20) * t);
        const g2 = Math.floor(80 + (20 - 80) * t);
        const b2 = Math.floor(20 + (5 - 20) * t);

        groundGradient.addColorStop(0, `rgb(${r1}, ${g1}, ${b1})`);
        groundGradient.addColorStop(1, `rgb(${r2}, ${g2}, ${b2})`);
      } else {
        groundGradient.addColorStop(0, 'rgb(5, 20, 5)');
        groundGradient.addColorStop(1, 'rgb(2, 10, 2)');
      }

      ctx.fillStyle = groundGradient;
      ctx.fillRect(0, canvas.height * 0.7, canvas.width, canvas.height * 0.3);
    }

    function drawTrees(progress) {
      trees.forEach(tree => {
        const baseY = canvas.height * 0.7 + tree.depth * 50;
        const treeX = tree.x;
        const treeHeight = tree.height * (0.5 + tree.depth * 0.5);
        const treeWidth = tree.width * (0.5 + tree.depth * 0.5);

        let alpha = 1;
        if (progress < 1) {
          alpha = 0.3 + progress * 0.7;
        }

        // Tree trunk
        ctx.fillStyle = `rgba(40, 30, 20, ${alpha})`;
        ctx.fillRect(treeX - treeWidth * 0.1, baseY - treeHeight * 0.3, treeWidth * 0.2, treeHeight * 0.3);

        // Tree foliage (triangle)
        ctx.fillStyle = `rgba(20, 40, 20, ${alpha})`;
        ctx.beginPath();
        ctx.moveTo(treeX, baseY - treeHeight);
        ctx.lineTo(treeX - treeWidth, baseY - treeHeight * 0.3);
        ctx.lineTo(treeX + treeWidth, baseY - treeHeight * 0.3);
        ctx.closePath();
        ctx.fill();

        // Add some depth with multiple layers
        ctx.fillStyle = `rgba(15, 30, 15, ${alpha * 0.8})`;
        ctx.beginPath();
        ctx.moveTo(treeX, baseY - treeHeight * 0.6);
        ctx.lineTo(treeX - treeWidth * 0.8, baseY - treeHeight * 0.1);
        ctx.lineTo(treeX + treeWidth * 0.8, baseY - treeHeight * 0.1);
        ctx.closePath();
        ctx.fill();
      });
    }

    function drawSun(progress) {
      if (progress >= 1) return;

      const sunY = canvas.height * (0.3 + progress * 0.5);
      const sunX = canvas.width * 0.5;
      const sunRadius = 60;
      const sunOpacity = 1 - progress;

      // Sun glow
      const sunGlow = ctx.createRadialGradient(sunX, sunY, sunRadius * 0.5, sunX, sunY, sunRadius * 3);
      sunGlow.addColorStop(0, `rgba(255, 220, 150, ${sunOpacity * 0.6})`);
      sunGlow.addColorStop(0.5, `rgba(255, 150, 100, ${sunOpacity * 0.3})`);
      sunGlow.addColorStop(1, 'rgba(255, 100, 50, 0)');

      ctx.fillStyle = sunGlow;
      ctx.beginPath();
      ctx.arc(sunX, sunY, sunRadius * 3, 0, Math.PI * 2);
      ctx.fill();

      // Sun disk
      const sunGradient = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunRadius);
      sunGradient.addColorStop(0, `rgba(255, 240, 200, ${sunOpacity})`);
      sunGradient.addColorStop(1, `rgba(255, 150, 80, ${sunOpacity * 0.8})`);

      ctx.fillStyle = sunGradient;
      ctx.beginPath();
      ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
      ctx.fill();
    }

    let lastTime = Date.now();
    let startTime = Date.now();

    function animate() {
      const now = Date.now();
      const deltaTime = now - lastTime;
      lastTime = now;

      animationTime = now - startTime;

      // Calculate sunset progress
      const sunsetProgress = Math.min(animationTime / sunsetDuration, 1);

      // Draw scene
      drawSky(sunsetProgress);
      drawSun(sunsetProgress);
      drawGround(sunsetProgress);
      drawTrees(sunsetProgress);

      // Add fireflies after dark
      if (animationTime > fireflyStartTime) {
        const fireflyTime = animationTime - fireflyStartTime;
        const fireflyProgress = Math.min(fireflyTime / fireflyBuildupDuration, 1);

        // Gradually spawn fireflies
        const targetCount = Math.floor(maxFireflies * Math.pow(fireflyProgress, 0.7));
        while (fireflies.length < targetCount) {
          const delay = Math.random() * 2000;
          fireflies.push(new Firefly(
            Math.random() * canvas.width,
            canvas.height * 0.3 + Math.random() * canvas.height * 0.5,
            delay
          ));
        }

        // Update and draw fireflies
        fireflies.forEach(firefly => {
          firefly.update(deltaTime);
          firefly.draw(ctx);
        });
      }

      requestAnimationFrame(animate);
    }

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        display: 'block',
        width: '100vw',
        height: '100vh',
        background: '#000'
      }}
    />
  );
}
