"use client";
import { useRef } from "react";
import ChatBot from "./ChatBot";

export default function ProtestMap() {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);

    return (    
     <div id="map" style={{
      width: '100%',
      height: '100vh',
      position: 'relative',
      // Add padding to prevent circle clipping on edges
      padding: '10px',
      boxSizing: 'border-box'
    }}>
      <div ref={mapContainer} style={{
        height: 'calc(100vh - 20px)',
        width: '100%',
        // Ensure map can render circles that extend beyond bounds
        overflow: 'hidden',
        borderRadius: '8px'
      }} />
            <ChatBot />

      </div>
    );
}