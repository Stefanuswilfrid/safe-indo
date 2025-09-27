import React from 'react';

export const MapStyles: React.FC = () => {
  return (
    <style dangerouslySetInnerHTML={{
      __html: `
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes warningPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
        .mapboxgl-canvas-container canvas {
          animation: none;
        }
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&display=swap');

        /* Custom Mapbox Popup Styles */
        .mapboxgl-popup-content {
          background: rgba(0, 0, 0, 0.95) !important;
          backdrop-filter: blur(10px) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          border-radius: 12px !important;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3) !important;
          color: #ffffff !important;
          font-family: 'IBM Plex Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
          font-size: 14px !important;
          max-width: 320px !important;
          padding: 16px !important;
        }

        .mapboxgl-popup-tip {
          background: rgba(0, 0, 0, 0.95) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
        }

        .mapboxgl-popup-close-button {
          background: none !important;
          border: none !important;
          color: #9ca3af !important;
          font-size: 20px !important;
          font-weight: 300 !important;
          padding: 8px !important;
          margin: 4px !important;
          cursor: pointer !important;
          border-radius: 4px !important;
          transition: all 0.2s ease !important;
          line-height: 1 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          width: 24px !important;
          height: 24px !important;
        }

        .mapboxgl-popup-close-button:hover {
          background: rgba(255, 255, 255, 0.1) !important;
          color: #ffffff !important;
          transform: scale(1.1) !important;
        }

        /* Custom Popup Content Styles */
        .custom-popup-content {
          max-width: 320px;
        }

        .popup-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
        }

        .popup-title {
          margin: 0;
          color: #ffffff;
          font-size: 15px;
          font-weight: 600;
          flex: 1;
          font-family: 'IBM Plex Sans', sans-serif;
        }

        .popup-description {
          margin: 0 0 10px 0;
          color: #9ca3af;
          font-size: 13px;
          line-height: 1.3;
          font-family: 'IBM Plex Sans', sans-serif;
        }

        .popup-warning-alert {
          background: rgba(245, 158, 11, 0.1);
          border-left: 3px solid #f59e0b;
          padding: 8px;
          margin-bottom: 10px;
          border-radius: 4px;
        }

        .popup-warning-text {
          font-size: 11px;
          font-weight: 500;
          color: #fbbf24;
          font-family: 'IBM Plex Sans', sans-serif;
        }

        .popup-warning-location {
          font-size: 10px;
          color: #fbbf24;
          margin-top: 2px;
          font-family: 'IBM Plex Sans', sans-serif;
        }

        .popup-metrics {
          display: flex;
          gap: 8px;
          margin-bottom: 10px;
          font-size: 11px;
        }

        .metric-badge {
          background: rgba(255, 255, 255, 0.1);
          padding: 4px 6px;
          border-radius: 3px;
          font-weight: 500;
          color: #9ca3af;
          font-family: 'IBM Plex Sans', sans-serif;
        }

        .popup-user-info {
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding-top: 8px;
          margin-bottom: 8px;
        }

        .popup-user-text {
          font-size: 11px;
          color: #9ca3af;
          line-height: 1.4;
          font-family: 'IBM Plex Sans', sans-serif;
        }

        .popup-metadata {
          font-size: 11px;
          color: #9ca3af;
          line-height: 1.4;
          font-family: 'IBM Plex Sans', sans-serif;
        }

        .popup-meta-text {
          margin-bottom: 4px;
          font-family: 'IBM Plex Sans', sans-serif;
        }

        .popup-details {
          display: flex;
          flex-direction: column;
          gap: 4px;
          font-size: 12px;
          color: #9ca3af;
          margin-bottom: 10px;
        }

        .detail-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-family: 'IBM Plex Sans', sans-serif;
        }

        .detail-item strong {
          color: #ffffff;
          font-family: 'IBM Plex Sans', sans-serif;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-family: 'IBM Plex Sans', sans-serif;
        }

        .meta-item strong {
          color: #ffffff;
          font-family: 'IBM Plex Sans', sans-serif;
        }

        .popup-link {
          color: #3b82f6;
          text-decoration: none;
          font-weight: 500;
          font-family: 'IBM Plex Sans', sans-serif;
          display: inline-block;
          margin-top: 6px;
        }

        .popup-link:hover {
          color: #1d4ed8;
        }

        .verified-badge {
          background: #059669;
          color: white;
          font-size: 10px;
          padding: 2px 6px;
          border-radius: 12px;
          font-weight: 500;
          font-family: 'IBM Plex Sans', sans-serif;
        }

        .severity-badge {
          color: white;
          font-size: 10px;
          padding: 2px 6px;
          border-radius: 12px;
          font-weight: 500;
          font-family: 'IBM Plex Sans', sans-serif;
        }

        .verified-text {
          color: #059669;
          font-weight: 500;
          font-family: 'IBM Plex Sans', sans-serif;
        }

        .unverified-text {
          color: #d97706;
          font-weight: 500;
          font-family: 'IBM Plex Sans', sans-serif;
        }
      `
    }} />
  );
};
