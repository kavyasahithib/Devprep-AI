import React, { useRef, useEffect } from "react";

function RobotAvatar({ isSpeaking, isListening, isThinking }) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let width = canvas.width = canvas.offsetWidth;
    let height = canvas.height = canvas.offsetHeight;

    // Handle resizing
    const resizeObserver = new ResizeObserver(() => {
      if (canvas) {
        width = canvas.width = canvas.offsetWidth;
        height = canvas.height = canvas.offsetHeight;
      }
    });
    resizeObserver.observe(canvas);

    let time = 0;
    let eyeBlinkTimer = 0;
    let eyeBlinkState = 0; // 0 = open, 1 = closing, 2 = opening
    let eyeBlinkProgress = 0;
    let eyeLookX = 0;
    let eyeLookY = 0;
    let lookTimer = 0;

    const numPoints = 30;

    const render = () => {
      time += 0.05;
      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;
      const robotSize = Math.min(width, height) * 0.35;

      // Draw Grid / Tech Background
      ctx.strokeStyle = "rgba(99, 102, 241, 0.04)";
      ctx.lineWidth = 1;
      const gridSize = 20;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw HUD rings
      ctx.save();
      ctx.translate(centerX, centerY);

      // Rotating Outer Ring
      ctx.strokeStyle = isSpeaking 
        ? "rgba(99, 102, 241, 0.25)" 
        : isListening 
          ? "rgba(16, 185, 129, 0.25)" 
          : "rgba(255, 255, 255, 0.08)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, robotSize * 1.3, time * 0.1, time * 0.1 + Math.PI * 1.5);
      ctx.stroke();

      // Counter-rotating dashed ring
      ctx.setLineDash([4, 12]);
      ctx.strokeStyle = "rgba(6, 182, 212, 0.15)";
      ctx.beginPath();
      ctx.arc(0, 0, robotSize * 1.2, -time * 0.15, -time * 0.15 + Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Handle Eye Blinking
      eyeBlinkTimer++;
      if (eyeBlinkTimer > 200 && eyeBlinkState === 0) {
        eyeBlinkState = 1; // Start closing
      }
      if (eyeBlinkState === 1) {
        eyeBlinkProgress += 0.25;
        if (eyeBlinkProgress >= 1) {
          eyeBlinkProgress = 1;
          eyeBlinkState = 2; // Start opening
        }
      } else if (eyeBlinkState === 2) {
        eyeBlinkProgress -= 0.25;
        if (eyeBlinkProgress <= 0) {
          eyeBlinkProgress = 0;
          eyeBlinkState = 0; // Fully open
          eyeBlinkTimer = Math.random() * 50; // Randomize next blink delay
        }
      }

      // Handle Eye Scanning
      lookTimer++;
      if (lookTimer > 120) {
        if (Math.random() > 0.6) {
          eyeLookX = (Math.random() - 0.5) * 8;
          eyeLookY = (Math.random() - 0.5) * 4;
        } else {
          eyeLookX = 0;
          eyeLookY = 0;
        }
        lookTimer = 0;
      }

      // Draw Robot Head Outline / Cyber Helmet
      ctx.strokeStyle = isSpeaking 
        ? "rgba(99, 102, 241, 0.6)" 
        : isListening 
          ? "rgba(16, 185, 129, 0.6)" 
          : "rgba(255, 255, 255, 0.2)";
      ctx.lineWidth = 2;
      
      // Glow filter for head outline
      ctx.shadowBlur = 10;
      ctx.shadowColor = isSpeaking ? "rgba(99, 102, 241, 0.4)" : isListening ? "rgba(16, 185, 129, 0.4)" : "rgba(255, 255, 255, 0.1)";

      // Draw the main visor/helmet shape
      ctx.beginPath();
      // Draw smooth helmet curve
      ctx.moveTo(centerX - robotSize, centerY - robotSize * 0.2);
      ctx.bezierCurveTo(
        centerX - robotSize, centerY - robotSize * 1.1,
        centerX + robotSize, centerY - robotSize * 1.1,
        centerX + robotSize, centerY - robotSize * 0.2
      );
      ctx.lineTo(centerX + robotSize * 0.8, centerY + robotSize * 0.5);
      ctx.bezierCurveTo(
        centerX + robotSize * 0.6, centerY + robotSize * 0.85,
        centerX - robotSize * 0.6, centerY + robotSize * 0.85,
        centerX - robotSize * 0.8, centerY + robotSize * 0.5
      );
      ctx.closePath();
      
      // Face gradient fill
      const faceGrad = ctx.createLinearGradient(0, centerY - robotSize, 0, centerY + robotSize);
      faceGrad.addColorStop(0, "rgba(24, 24, 27, 0.95)");
      faceGrad.addColorStop(1, "rgba(12, 12, 16, 0.95)");
      ctx.fillStyle = faceGrad;
      ctx.fill();
      ctx.stroke();

      // Reset shadows
      ctx.shadowBlur = 0;

      // Draw Visor Plate
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
      ctx.beginPath();
      ctx.moveTo(centerX - robotSize * 0.75, centerY - robotSize * 0.25);
      ctx.lineTo(centerX + robotSize * 0.75, centerY - robotSize * 0.25);
      ctx.lineTo(centerX + robotSize * 0.65, centerY + robotSize * 0.15);
      ctx.lineTo(centerX - robotSize * 0.65, centerY + robotSize * 0.15);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Draw Eyes (Neon visor segments)
      const eyeWidth = robotSize * 0.25;
      const eyeHeight = robotSize * 0.15;
      const eyeOffsetY = -robotSize * 0.08;
      const eyeSpacing = robotSize * 0.35;

      const eyeScaleY = 1 - eyeBlinkProgress;

      // Left Eye
      ctx.save();
      ctx.translate(centerX - eyeSpacing + eyeLookX, centerY + eyeOffsetY + eyeLookY);
      ctx.scale(1, eyeScaleY);
      ctx.shadowBlur = isThinking ? 15 : 8;
      ctx.shadowColor = isThinking 
        ? "#a855f7" 
        : isListening 
          ? "#10b981" 
          : "#6366f1";
      ctx.fillStyle = isThinking 
        ? "#c084fc" 
        : isListening 
          ? "#34d399" 
          : "#818cf8";
      ctx.fillRect(-eyeWidth / 2, -eyeHeight / 2, eyeWidth, eyeHeight);
      ctx.restore();

      // Right Eye
      ctx.save();
      ctx.translate(centerX + eyeSpacing + eyeLookX, centerY + eyeOffsetY + eyeLookY);
      ctx.scale(1, eyeScaleY);
      ctx.shadowBlur = isThinking ? 15 : 8;
      ctx.shadowColor = isThinking 
        ? "#a855f7" 
        : isListening 
          ? "#10b981" 
          : "#6366f1";
      ctx.fillStyle = isThinking 
        ? "#c084fc" 
        : isListening 
          ? "#34d399" 
          : "#818cf8";
      ctx.fillRect(-eyeWidth / 2, -eyeHeight / 2, eyeWidth, eyeHeight);
      ctx.restore();

      // Reset shadows
      ctx.shadowBlur = 0;

      // Draw Head Earpieces / Antennas (Sci-fi tech accents)
      ctx.strokeStyle = "rgba(99, 102, 241, 0.3)";
      ctx.lineWidth = 3;
      // Left Earpiece
      ctx.beginPath();
      ctx.moveTo(centerX - robotSize, centerY - robotSize * 0.1);
      ctx.lineTo(centerX - robotSize * 1.15, centerY - robotSize * 0.2);
      ctx.lineTo(centerX - robotSize * 1.15, centerY + robotSize * 0.1);
      ctx.stroke();
      // Right Earpiece
      ctx.beginPath();
      ctx.moveTo(centerX + robotSize, centerY - robotSize * 0.1);
      ctx.lineTo(centerX + robotSize * 1.15, centerY - robotSize * 0.2);
      ctx.lineTo(centerX + robotSize * 1.15, centerY + robotSize * 0.1);
      ctx.stroke();

      // Draw Digital Voice Mouth Waveform (Hologram Visualizer)
      const mouthY = centerY + robotSize * 0.45;
      const mouthWidth = robotSize * 0.9;
      const startX = centerX - mouthWidth / 2;

      ctx.save();
      ctx.strokeStyle = isSpeaking 
        ? "#6366f1" 
        : isListening 
          ? "#10b981" 
          : "rgba(99, 102, 241, 0.4)";
      ctx.lineWidth = 2.5;
      ctx.lineCap = "round";
      ctx.shadowBlur = isSpeaking || isListening ? 12 : 0;
      ctx.shadowColor = isSpeaking ? "#6366f1" : "#10b981";

      ctx.beginPath();
      for (let i = 0; i < numPoints; i++) {
        const x = startX + (mouthWidth / (numPoints - 1)) * i;
        
        let amplitude = 2; // Idle pulse
        if (isSpeaking) {
          // Speak wave logic
          const distFromCenter = Math.sin((i / (numPoints - 1)) * Math.PI);
          const noise = Math.sin(time * 4 + i * 0.8) * Math.cos(time * 2 + i * 0.3);
          amplitude = distFromCenter * (18 + Math.sin(time * 8) * 6) * Math.abs(noise);
        } else if (isListening) {
          // Listen wave logic (subtle mic waves)
          const distFromCenter = Math.sin((i / (numPoints - 1)) * Math.PI);
          amplitude = distFromCenter * (6 + Math.sin(time * 5 + i * 0.5) * 4);
        } else if (isThinking) {
          // Thinking status (spinning loading pulse wave)
          const shift = (time * 2) % numPoints;
          const dist = Math.abs(i - shift);
          amplitude = dist < 4 ? (4 - dist) * 4 : 1;
        } else {
          // Breathing normal pulse
          const distFromCenter = Math.sin((i / (numPoints - 1)) * Math.PI);
          amplitude = distFromCenter * (2.5 + Math.sin(time * 1.5) * 1);
        }

        const yOffset = (i % 2 === 0 ? 1 : -1) * amplitude;
        
        if (i === 0) {
          ctx.moveTo(x, mouthY + yOffset);
        } else {
          ctx.lineTo(x, mouthY + yOffset);
        }
      }
      ctx.stroke();
      ctx.restore();

      // Outer HUD Scanning Laser bar (Top to bottom loop)
      if (isThinking || isListening) {
        ctx.save();
        const laserY = centerY - robotSize * 0.65 + ((time * 10) % (robotSize * 1.35));
        const laserWidth = robotSize * 1.6;
        const scanGrad = ctx.createLinearGradient(centerX - laserWidth/2, laserY, centerX + laserWidth/2, laserY);
        scanGrad.addColorStop(0, "rgba(6, 182, 212, 0)");
        scanGrad.addColorStop(0.5, isListening ? "rgba(16, 185, 129, 0.4)" : "rgba(168, 85, 247, 0.4)");
        scanGrad.addColorStop(1, "rgba(6, 182, 212, 0)");
        
        ctx.strokeStyle = scanGrad;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(centerX - laserWidth / 2, laserY);
        ctx.lineTo(centerX + laserWidth / 2, laserY);
        ctx.stroke();
        ctx.restore();
      }

      animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationRef.current);
      resizeObserver.disconnect();
    };
  }, [isSpeaking, isListening, isThinking]);

  return (
    <div className="w-full h-full relative overflow-hidden bg-[#0c0d12]/80 border border-white/5 rounded-2xl flex items-center justify-center shadow-inner shadow-black/60">
      <canvas ref={canvasRef} className="w-full h-full block" />
      {/* Sci-fi Overlay Labels */}
      <div className="absolute top-3 left-4 flex items-center gap-1.5 pointer-events-none select-none">
        <span className={`w-1.5 h-1.5 rounded-full ${isThinking ? 'bg-purple-500 animate-ping' : isListening ? 'bg-emerald-400 animate-ping' : isSpeaking ? 'bg-indigo-400 animate-ping' : 'bg-white/20'}`}></span>
        <span className="text-[8px] font-bold text-white/35 uppercase tracking-widest">
          {isThinking ? "CORE.THINKING" : isListening ? "AUDIO.RECEIVING" : isSpeaking ? "AUDIO.TRANSMITTING" : "SYSTEM.IDLE"}
        </span>
      </div>
      <div className="absolute bottom-3 right-4 pointer-events-none select-none">
        <span className="text-[8px] font-mono text-white/20 uppercase tracking-widest">VER: 2.5.LIVE</span>
      </div>
    </div>
  );
}

export default RobotAvatar;
