import React, { useRef, useEffect } from 'react';
import { useAssistant } from '../../context/AssistantContext';

const VoiceSphere = () => {
    const canvasRef = useRef(null);
    const { assistantState } = useAssistant();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let animationFrameId;
        let time = 0;

        const render = () => {
            time += 0.05;

            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const baseRadius = 80;

            // Animation params based on state
            let pulseSpeed = 0.05;
            let waveAmplitude = 5;
            let color = '100, 200, 255'; // Light Blue default

            if (assistantState === 'listening') {
                pulseSpeed = 0.2;
                waveAmplitude = 15;
                color = '50, 255, 100'; // Greenish when actively listening
            } else if (assistantState === 'processing') {
                pulseSpeed = 0.5;
                waveAmplitude = 5;
                color = '255, 100, 255'; // Purple processing
            } else if (assistantState === 'speaking') {
                pulseSpeed = 0.1;
                waveAmplitude = 25; // Big ripples
                color = '100, 150, 255';
            }

            // Dynamic Radius
            const pulse = Math.sin(time * pulseSpeed) * 5;
            const radius = baseRadius + pulse;

            // Draw Sphere (Glow)
            const gradient = ctx.createRadialGradient(centerX, centerY, radius * 0.2, centerX, centerY, radius * 1.5);
            gradient.addColorStop(0, 'rgba(' + color + ', 0.8)');
            gradient.addColorStop(0.5, 'rgba(' + color + ', 0.3)');
            gradient.addColorStop(1, 'rgba(' + color + ', 0)');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius * 1.5, 0, Math.PI * 2);
            ctx.fill();

            // Draw Rings/Waves
            ctx.strokeStyle = 'rgba(' + color + ', 0.6)';
            ctx.lineWidth = 2;

            // Simulate multiple organic rings
            for (let i = 0; i < 3; i++) {
                ctx.beginPath();
                const ringOffset = i * 20;
                // Wiggly ring effect
                for (let angle = 0; angle <= Math.PI * 2; angle += 0.1) {
                    const noise = Math.sin(angle * 10 + time + i) * waveAmplitude * (assistantState === 'listening' ? 1.5 : 0.5);
                    const r = radius + ringOffset + noise;
                    const x = centerX + Math.cos(angle) * r;
                    const y = centerY + Math.sin(angle) * r;
                    if (angle === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.closePath();
                ctx.stroke();
            }

            // If listening, draw "audio" bars (simulated)
            if (assistantState === 'listening') {
                ctx.fillStyle = 'rgba(' + color + ', 0.8)';
                const barCount = 20;
                for (let i = 0; i < barCount; i++) {
                    const angle = (i / barCount) * Math.PI * 2;
                    const h = 10 + Math.random() * 30;
                    const x = centerX + Math.cos(angle) * (radius - 20);
                    const y = centerY + Math.sin(angle) * (radius - 20);
                    ctx.beginPath();
                    ctx.arc(x, y, 2, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, [assistantState]);

    return (
        <canvas
            ref={canvasRef}
            width={400}
            height={400}
            className="max-w-full"
        />
    );
};
export default VoiceSphere;