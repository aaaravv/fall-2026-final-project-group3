import React from "react";
// @ts-ignore - side-effect CSS import; type declarations are handled by the bundler
import './AnimatedBackground.css';

export const AnimatedBackground = () => {
    return(
        <div className="animated-bg-container">
            {/* floating shapes */}
            <div className="floating-shape blue-shape"></div>
            <div className="floating-shape purple-shape"></div>
            <div className="floating-shape green-shape"></div>
        </div>
    );
};