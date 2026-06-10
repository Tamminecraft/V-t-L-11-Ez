import { useEffect, useRef, useState } from 'react';

const GRAVITY = 9.81;

export default function SimulationCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [length, setLength] = useState(200);
  const [amplitude, setAmplitude] = useState(0.8);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frameId: number;
    const startTime = performance.now();

    const animate = (time: number) => {
      const elapsed = (time - startTime) / 1000;
      const omega = Math.sqrt(GRAVITY / (length / 100));
      const currentAngle = amplitude * Math.cos(omega * elapsed);

      const centerX = canvas.width / 2;
      const centerY = 40;
      const bobX = centerX + length * Math.sin(currentAngle);
      const bobY = centerY + length * Math.cos(currentAngle);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(bobX, bobY);
      ctx.stroke();

      ctx.fillStyle = '#1d4ed8';
      ctx.beginPath();
      ctx.arc(bobX, bobY, 18, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#0f172a';
      ctx.font = '16px system-ui';
      ctx.fillText('L = ' + length + ' px', 20, canvas.height - 50);
      ctx.fillText('ω ≈ ' + omega.toFixed(2) + ' rad/s', 20, canvas.height - 30);
      ctx.fillText('θ = ' + currentAngle.toFixed(2) + ' rad', 20, canvas.height - 10);

      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [length, amplitude]);

  return (
    <div className="simulation-card">
      <div className="simulation-info">
        <h3>Con lắc đơn tương tác</h3>
        <p>Thay đổi chiều dài dây và biên độ để quan sát dao động điều hòa.</p>
      </div>
      <canvas ref={canvasRef} width={520} height={320} className="simulation-canvas" />
      <div className="simulation-controls">
        <label>
          Chiều dài dây: <strong>{length}px</strong>
          <input
            type="range"
            min={120}
            max={320}
            value={length}
            onChange={(e) => setLength(Number(e.target.value))}
          />
        </label>
        <label>
          Biên độ: <strong>{amplitude.toFixed(2)} rad</strong>
          <input
            type="range"
            min={0.2}
            max={1.4}
            step={0.05}
            value={amplitude}
            onChange={(e) => setAmplitude(Number(e.target.value))}
          />
        </label>
      </div>
    </div>
  );
}
