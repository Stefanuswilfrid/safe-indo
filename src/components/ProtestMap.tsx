/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useRef, useState } from "react";
import ChatBot from "./ChatBot";

export default function ProtestMap() {
    const mapContainer = useRef<HTMLDivElement>(null);
    const [scrapingStatus, setScrapingStatus] = useState<'idle' | 'scraping' | 'completed' | 'error'>('idle');

    const map = useRef<mapboxgl.Map | null>(null);

    useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch('/api/scrape/status');
        if (response.ok) {
          const data: any = await response.json();
          setScrapingStatus(data.status || 'idle');
        }
      } catch (error) {
        // API might not exist yet, keep default status
        console.log('Status API not available yet');
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

    // Function to fetch events from database
  const fetchEvents = async (customTimeFilter?: number) => {
    try {
      setLoading(true);
      setError(null);

      // Use the passed timeFilter or fall back to state
      const activeTimeFilter = customTimeFilter !== undefined ? customTimeFilter : timeFilter;
      
      // Fetch regular events, road closures, and warning markers with time filter
      const timeParam = activeTimeFilter > 0 ? `&hours=${activeTimeFilter}` : '';
      const [eventsResponse, roadClosuresResponse, warningMarkersResponse] = await Promise.all([
        fetch(`/api/events?type=protest${timeParam}`),
        // For road closures: if activeTimeFilter is 0 (All), don't send hours param, otherwise send the activeTimeFilter value
        fetch(`/api/road-closures${activeTimeFilter > 0 ? `?hours=${activeTimeFilter}` : ''}`),
        // Fetch warning markers with minimum confidence threshold
        fetch(`/api/warning-markers?${activeTimeFilter > 0 ? `hours=${activeTimeFilter}&` : ''}minConfidence=0.4&limit=50`)
      ]);

      if (!eventsResponse.ok) {
        throw new Error('Failed to fetch events');
      }

      const eventsData = await eventsResponse.json() as { success: boolean; events: Event[]; error?: string };
      const roadClosuresData = await roadClosuresResponse.json() as { success: boolean; roadClosures: Event[]; error?: string };
      
      // Handle warning markers with fallback
      let warningMarkersData: { success: boolean; warnings: Event[]; error?: string } = { success: true, warnings: [] };
      try {
        if (warningMarkersResponse.ok) {
          warningMarkersData = await warningMarkersResponse.json() as { success: boolean; warnings: Event[]; error?: string };
        } else {
          console.warn('⚠️ Warning markers API failed, continuing without warning markers');
        }
      } catch (error) {
        console.warn('⚠️ Failed to parse warning markers response, continuing without warning markers:', error);
      }

      if (eventsData.success && roadClosuresData.success) {
        // Combine events, road closures, and warning markers (if available)
        const allEvents = [
          ...eventsData.events,
          ...roadClosuresData.roadClosures.map(rc => ({ ...rc, type: 'road_closure' as const })),
          ...(warningMarkersData.success ? warningMarkersData.warnings.map(wm => ({ ...wm, type: 'warning' as const })) : [])
        ];

        setEvents(allEvents);
        eventsLoadedRef.current = true; // Mark events as loaded
        const warningCount = warningMarkersData.success ? warningMarkersData.warnings.length : 0;
        console.log(`📍 Loaded ${eventsData.events.length} events, ${roadClosuresData.roadClosures.length} road closures, and ${warningCount} warning markers from database`);
        console.log('🔍 DEBUG: Events loaded, calling ensureMarkersRender');

        // Try to render markers now that events are loaded
        ensureMarkersRender();
      } else {
        throw new Error(eventsData.error || roadClosuresData.error || 'Failed to fetch data');
      }
    } catch (error) {
      console.error('❌ Error fetching events:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

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