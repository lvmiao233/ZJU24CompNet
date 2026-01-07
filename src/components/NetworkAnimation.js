import React, { useEffect, useRef } from 'react';

const NetworkAnimation = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let animationFrameId;
        let particles = [];

        // Resize handler
        const resizeCanvas = () => {
            const parent = canvas.parentElement;
            canvas.width = parent.offsetWidth;
            canvas.height = parent.offsetHeight;
            initNodes();
        };

        // Network nodes
        const nodes = [];
        const nodeCount = 8;

        const initNodes = () => {
            nodes.length = 0;
            const w = canvas.width;
            const h = canvas.height;

            // Create nodes in a distributed pattern
            for (let i = 0; i < nodeCount; i++) {
                nodes.push({
                    x: 80 + Math.random() * (w - 160),
                    y: 40 + Math.random() * (h - 80),
                    radius: 4 + Math.random() * 3,
                    pulse: Math.random() * Math.PI * 2,
                    connections: []
                });
            }

            // Create connections (each node connects to 2-3 closest nodes)
            nodes.forEach((node, i) => {
                const distances = nodes
                    .map((other, j) => ({ index: j, dist: Math.hypot(node.x - other.x, node.y - other.y) }))
                    .filter(d => d.index !== i)
                    .sort((a, b) => a.dist - b.dist);

                const connectionCount = 2 + Math.floor(Math.random() * 2);
                node.connections = distances.slice(0, connectionCount).map(d => d.index);
            });

            // Initialize particles on connections
            particles = [];
            nodes.forEach((node, i) => {
                node.connections.forEach(j => {
                    if (i < j) { // Avoid duplicates
                        particles.push({
                            from: i,
                            to: j,
                            progress: Math.random(),
                            speed: 0.002 + Math.random() * 0.003,
                            size: 2 + Math.random() * 2
                        });
                    }
                });
            });
        };

        const draw = (time) => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Colors
            const lineColor = 'rgba(19, 194, 194, 0.15)';
            const nodeColor = 'rgba(19, 194, 194, 0.4)';
            const particleColor = 'rgba(19, 194, 194, 0.8)';

            // Draw connections
            ctx.strokeStyle = lineColor;
            ctx.lineWidth = 1;
            nodes.forEach((node, i) => {
                node.connections.forEach(j => {
                    if (i < j) {
                        ctx.beginPath();
                        ctx.moveTo(node.x, node.y);
                        ctx.lineTo(nodes[j].x, nodes[j].y);
                        ctx.stroke();
                    }
                });
            });

            // Draw nodes with pulse
            nodes.forEach((node, i) => {
                const pulse = Math.sin(time * 0.002 + node.pulse) * 0.3 + 1;
                const r = node.radius * pulse;

                ctx.beginPath();
                ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
                ctx.fillStyle = nodeColor;
                ctx.fill();
            });

            // Animate and draw particles (data packets)
            particles.forEach(p => {
                p.progress += p.speed;
                if (p.progress > 1) {
                    p.progress = 0;
                    // Random direction
                    if (Math.random() > 0.5) {
                        [p.from, p.to] = [p.to, p.from];
                    }
                }

                const fromNode = nodes[p.from];
                const toNode = nodes[p.to];
                const x = fromNode.x + (toNode.x - fromNode.x) * p.progress;
                const y = fromNode.y + (toNode.y - fromNode.y) * p.progress;

                ctx.beginPath();
                ctx.arc(x, y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = particleColor;
                ctx.fill();

                // Glow effect
                ctx.beginPath();
                ctx.arc(x, y, p.size * 2, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(19, 194, 194, 0.2)';
                ctx.fill();
            });

            animationFrameId = requestAnimationFrame(draw);
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        animationFrameId = requestAnimationFrame(draw);

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 1,
                pointerEvents: 'none'
            }}
        />
    );
};

export default NetworkAnimation;
