import React, { useEffect, useRef } from "react";
// @ts-ignore - side-effect CSS import; type declarations are handled by the bundler
import './AnimatedBackground.css';

export const AnimatedBackground: React.FC  = () => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Get the container element from the ref
        const container = containerRef.current;
        if(!container) return;
       
        // Get all blob elements within the container
        const blobs = container.querySelectorAll('.blob') as NodeListOf<HTMLDivElement>;
        
        // Initialize mouse and target positions for blob animation
        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;
        let targetX = mouseX;
        let targetY = mouseY;

        // Handle mouse movement to update target positions for blob animation
        const handleMouseMove = (e: MouseEvent) => {
            targetX = e.clientX;
            targetY = e.clientY;
        };
        // Start the animation loop
        window.addEventListener('mousemove', handleMouseMove);

        let animationFrameId: number;
        let angle = 0;

        const animate = () => {
            mouseX += (targetX - mouseX) * 0.5;
            mouseY += (targetY - mouseY) * 0.5;
            angle += 0.015;

            blobs.forEach((blob, index) => {
                const speed = (index + 1) * 0.5;

                // Circular floating path
                const baseOffsetX = Math.cos(angle + speed + index) * 30;
                const baseOffsetY = Math.sin(angle + speed + index) * 30;

                // Cursor interaction calculations
                const rect = blob.getBoundingClientRect();
                const blobX = rect.left + rect.width / 2;
                const blobY = rect.top + rect.height / 2;

                // Distance from cursor to blob center
                const distX = mouseX - blobX;
                const distY = mouseY - blobY;
                const distance = Math.sqrt(distX * distX + distY * distY);

                // Apply wind effect based on cursor proximity
                let windX = 0;
                let windY = 0;
                const maxDistance = 250; // Maximum distance for cursor interaction effect

                // Apply wind effect only if the cursor is within the maximum distance
                if(distance < maxDistance) {
                    const force = (1 - distance / maxDistance);
                    windX = -(distX / distance) * force;
                    windY = -(distY / distance) * force;
                }

                // Apply the calculated wind effect to the blob's position
                const offsetX = baseOffsetX + windX * 50; // Adjust the multiplier as needed
                const offsetY = baseOffsetY + windY * 50; // Adjust the multiplier as needed

                blob.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
            });
            animationFrameId = requestAnimationFrame(animate);
        };
        animate(); // Start the animation loop

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationFrameId);
        };


    }, []); // Empty dependency array to run the effect only once

    return (
        <div ref={containerRef} className="animated-bg-container">
            <div className="blob blue-shape"></div>
            <div className="blob purple-shape"></div>
            <div className="blob green-shape"></div>
        </div>
    )
};