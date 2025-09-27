'use client';

import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useRef, useState } from "react";
import ChatBot from "./ChatBot";
import { MapOverlay } from "./MapOverlay";
import { MobileFAB } from "./MobileFAB";
import { DesktopControls } from "./DesktopControls";
import { MapStyles } from "./MapStyles";
import { useMap } from "../hooks/useMap";
import { useEvents } from "../hooks/useEvents";
import { useRealTimeUpdates } from "../hooks/useRealTimeUpdates";
import { useMobile } from "../hooks/useMobile";
import { ensureMarkersRender, updateMapMarkers } from "../utils/mapMarkers";
import { calculateNextUpdateTime } from "../utils/mapUtils";

export default function ProtestMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const retryScheduledRef = useRef<boolean>(false);
  const initialMarkersRenderedRef = useRef<boolean>(false);
  const [fabMenuOpen, setFabMenuOpen] = useState<boolean>(false);
  const [nextUpdateTime, setNextUpdateTime] = useState<string>('Calculating...');
  const [renderingMarkers, setRenderingMarkers] = useState<boolean>(false);

  // Custom hooks
  const { map, mapLoadedRef, mapStyle, mapboxStyles, changeMapStyle } = useMap(mapContainer);
  const { 
    events, 
    setEvents, 
    loading, 
    error, 
    timeFilter, 
    eventFilter, 
    setEventFilter, 
    eventsLoadedRef, 
    fetchEvents, 
    handleTimeFilterChange 
  } = useEvents();
  const { scrapingStatus } = useRealTimeUpdates(setEvents);
  const { isMobile } = useMobile();

  // Enhanced function to ensure markers render properly
  const ensureMarkersRenderWrapper = () => {
    ensureMarkersRender(
      map,
      mapLoadedRef,
      eventsLoadedRef,
      events,
      isMobile,
      initialMarkersRenderedRef,
      retryScheduledRef,
      setRenderingMarkers,
      eventFilter,
      () => updateMapMarkers(map, events, eventFilter, retryScheduledRef)
    );
  };

  // Function to update map markers
  const updateMapMarkersWrapper = () => {
    updateMapMarkers(map, events, eventFilter, retryScheduledRef);
  };


  // Update map markers when events change or filter changes
  useEffect(() => {
    console.log('🔍 DEBUG: Events or filter changed, events.length:', events.length, 'eventFilter:', eventFilter);
    if (events.length > 0) {
      console.log('🔍 DEBUG: Events exist, calling ensureMarkersRender from useEffect');
      ensureMarkersRenderWrapper();
    } else {
      console.log('⚠️ DEBUG: No events yet, skipping marker render');
    }
  }, [events, eventFilter]);

  // Additional effect to handle the case where map loads first, then events load
  useEffect(() => {
    if (mapLoadedRef.current && eventsLoadedRef.current && events.length > 0 && !initialMarkersRenderedRef.current) {
      console.log('🔍 DEBUG: Both map and events are ready, triggering marker render');
      ensureMarkersRenderWrapper();
    }
  }, [events.length]); // Only depend on events.length to avoid ref dependency issues

  // Calculate next update time
  useEffect(() => {
    const calculateNextUpdate = () => {
      setNextUpdateTime(calculateNextUpdateTime());
    };

    calculateNextUpdate();
    const interval = setInterval(calculateNextUpdate, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Fetch events on mount and set up periodic refresh (fallback)
  useEffect(() => {
    fetchEvents();

    // Set up periodic refresh every 5 minutes (fallback for when EventSource fails)
    const refreshInterval = setInterval(() => {
      if (!loading) {
        console.log('🔄 Periodic refresh of events (fallback)...');
        fetchEvents();
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(refreshInterval);
  }, []);

  // Fallback mechanism to ensure markers render even if other mechanisms fail
  useEffect(() => {
    if (events.length > 0) {
      // Set up a fallback check every 2 seconds for the first 10 seconds
      const maxChecks = 5;
      let checkCount = 0;

      const checkInterval = setInterval(() => {
        checkCount++;
        console.log(`🔍 DEBUG: Fallback check ${checkCount}/${maxChecks}`);

        if (checkCount >= maxChecks) {
          clearInterval(checkInterval);
          return;
        }

        // Only check if both map and events are loaded
        if (mapLoadedRef.current && eventsLoadedRef.current && map.current && map.current.isStyleLoaded()) {
          const layers = map.current.getStyle().layers || [];
          const hasMarkerLayers = layers.some(layer =>
            ['clusters', 'cluster-count', 'protest-circles', 'road-closure-circles', 'warning-circles', 'event-emoji'].includes(layer.id)
          );

          if (!hasMarkerLayers && !initialMarkersRenderedRef.current) {
            console.log('⚠️ DEBUG: Fallback detected missing markers, forcing render');
            ensureMarkersRenderWrapper();
          } else if (hasMarkerLayers) {
            console.log('✅ DEBUG: Fallback confirmed markers exist');
            clearInterval(checkInterval);
          }
        }
      }, 2000);

      return () => clearInterval(checkInterval);
    }
  }, [events.length]); // Only depend on events.length

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

      {/* Map Overlay */}
      <MapOverlay
        isMobile={isMobile}
        loading={loading}
        error={error}
        events={events}
        eventFilter={eventFilter}
        scrapingStatus={scrapingStatus}
        renderingMarkers={renderingMarkers}
        nextUpdateTime={nextUpdateTime}
        timeFilter={timeFilter}
        handleTimeFilterChange={handleTimeFilterChange}
      />

      {/* Mobile FAB Menu */}
      {isMobile && (
        <MobileFAB
          fabMenuOpen={fabMenuOpen}
          setFabMenuOpen={setFabMenuOpen}
          loading={loading}
          fetchEvents={fetchEvents}
          initialMarkersRenderedRef={initialMarkersRenderedRef}
          mapStyle={mapStyle}
          mapboxStyles={mapboxStyles}
          changeMapStyle={changeMapStyle}
          eventFilter={eventFilter}
          setEventFilter={setEventFilter}
        />
      )}

      {/* Desktop Controls */}
      {!isMobile && (
        <DesktopControls
          loading={loading}
          fetchEvents={fetchEvents}
          initialMarkersRenderedRef={initialMarkersRenderedRef}
          mapStyle={mapStyle}
          mapboxStyles={mapboxStyles}
          changeMapStyle={changeMapStyle}
          eventFilter={eventFilter}
          setEventFilter={setEventFilter}
        />
      )}

      {/* Map Styles */}
      <MapStyles />

      {/* ChatBot Component */}
      <ChatBot />
    </div>
  );
}
