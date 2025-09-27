import mapboxgl from "mapbox-gl";
import { createEventGeoJSON } from "./mapUtils";
import { generatePopupHTML } from "./popupUtils";
import { Event } from "../types/event";

// Enhanced function to ensure markers render properly on mobile
export const ensureMarkersRender = (
  map: React.MutableRefObject<mapboxgl.Map | null>,
  mapLoadedRef: React.MutableRefObject<boolean>,
  eventsLoadedRef: React.MutableRefObject<boolean>,
  events: Event[],
  isMobile: boolean,
  initialMarkersRenderedRef: React.MutableRefObject<boolean>,
  retryScheduledRef: React.MutableRefObject<boolean>,
  setRenderingMarkers: React.Dispatch<React.SetStateAction<boolean>>,
  eventFilter: 'all' | 'warnings' | 'road_closures' | 'protests',
  updateMapMarkers: () => void
) => {
  console.log('🔍 DEBUG ensureMarkersRender called:', {
    mapExists: !!map.current,
    mapLoaded: mapLoadedRef.current,
    eventsLoaded: eventsLoadedRef.current,
    eventsCount: events.length,
    isMobile,
    initialMarkersRendered: initialMarkersRenderedRef.current,
    styleLoaded: map.current ? map.current.isStyleLoaded() : 'no map'
  });

  // More lenient conditions - only require map to exist and be loaded
  if (!map.current || !mapLoadedRef.current) {
    console.log('⏳ DEBUG: Skipping ensureMarkersRender - map not ready');
    return;
  }

  // If events aren't loaded yet, just wait for them
  if (!eventsLoadedRef.current || events.length === 0) {
    console.log('⚠️ DEBUG: Events not ready yet, will retry when events load');
    return;
  }

  // Always try to render markers when we have both map and events ready
  console.log('✅ DEBUG: Both map and events ready, proceeding with marker render');
  setRenderingMarkers(true);

  // Use a more aggressive retry approach for both mobile and desktop
  const attemptRender = () => {
    if (map.current && map.current.isStyleLoaded() && events.length > 0) {
      console.log('✅ DEBUG: Direct render condition met, calling updateMapMarkers');
      updateMapMarkers();
      initialMarkersRenderedRef.current = true;
      setRenderingMarkers(false);
      console.log('✅ Markers rendered successfully');
    } else if (!retryScheduledRef.current) {
      console.log('⏳ DEBUG: Setting up retry listeners');
      retryScheduledRef.current = true;

      // Try multiple events for compatibility
      const events = ['idle', 'sourcedata', 'styledata'];
      let eventFired = false;

      const cleanup = () => {
        events.forEach(eventName => {
          if (map.current) {
            map.current.off(eventName, handler);
          }
        });
        retryScheduledRef.current = false;
      };

      const handler = () => {
        if (!eventFired && map.current && map.current.isStyleLoaded()) {
          eventFired = true;
          console.log('🎯 DEBUG: Map event fired, attempting render');
          cleanup();
          setTimeout(() => {
            if (map.current && events.length > 0) {
              updateMapMarkers();
              initialMarkersRenderedRef.current = true;
              setRenderingMarkers(false);
              console.log('✅ Markers rendered after retry');
            }
          }, isMobile ? 150 : 50); // Slightly longer delay for mobile
        }
      };

      events.forEach(eventName => {
        if (map.current) {
          map.current.once(eventName, handler);
        }
      });

      // Fallback timeout
      setTimeout(() => {
        if (!eventFired) {
          console.log('⏰ DEBUG: Fallback timeout reached');
          cleanup();
          if (map.current && events.length > 0) {
            updateMapMarkers();
            initialMarkersRenderedRef.current = true;
            setRenderingMarkers(false);
            console.log('✅ Markers rendered via fallback timeout');
          }
        }
      }, isMobile ? 3000 : 1500); // Longer timeout for mobile
    }
  };

  attemptRender();
};

// Function to update map markers
export const updateMapMarkers = (
  map: React.MutableRefObject<mapboxgl.Map | null>,
  events: Event[],
  eventFilter: 'all' | 'warnings' | 'road_closures' | 'protests',
  retryScheduledRef: React.MutableRefObject<boolean>
) => {
  console.log('🎯 DEBUG: updateMapMarkers called');
  if (!map.current) {
    console.log('❌ DEBUG: No map instance');
    return;
  }
  if (!map.current.isStyleLoaded()) {
    console.log('⏳ DEBUG: Map style not loaded yet');
    // Schedule a one-shot retry when the map becomes idle to avoid race on mobile
    if (!retryScheduledRef.current) {
      retryScheduledRef.current = true;
      map.current.once('idle', () => {
        retryScheduledRef.current = false;
        updateMapMarkers(map, events, eventFilter, retryScheduledRef);
      });
    }
    return;
  }

  // Filter events based on eventFilter state
  let filteredEvents = events;
  switch (eventFilter) {
    case 'warnings':
      filteredEvents = events.filter(event => event.type === 'warning');
      break;
    case 'road_closures':
      filteredEvents = events.filter(event => event.type === 'road_closure');
      break;
    case 'protests':
      filteredEvents = events.filter(event => event.type === 'protest');
      break;
    case 'all':
    default:
      filteredEvents = events;
      break;
  }
  const eventData = createEventGeoJSON(filteredEvents);
  console.log('📊 DEBUG: Created eventData with', filteredEvents.length, 'events');

  // Update or create the events source
  if (map.current.getSource('events')) {
    console.log('🔄 DEBUG: Updating existing events source');
    (map.current.getSource('events') as any).setData(eventData);
  } else {
    console.log('🆕 DEBUG: Creating new events source and layers');
    // Add source with clustering enabled
    map.current.addSource('events', {
      type: 'geojson',
      data: eventData,
      cluster: true,
      clusterMaxZoom: 14,
      clusterRadius: 50
    });

    // Add cluster circles (for groups of events)
    map.current.addLayer({
      id: 'clusters',
      type: 'circle',
      source: 'events',
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': [
          'step',
          ['get', 'point_count'],
          '#51bbd6', // Light blue for small clusters
          5, '#f1f075', // Yellow for medium clusters
          15, '#f28cb1' // Pink for large clusters
        ],
        'circle-radius': [
          'step',
          ['get', 'point_count'],
          20, // Small clusters
          5, 30, // Medium clusters
          15, 40 // Large clusters
        ],
        'circle-stroke-color': '#ffffff',
        'circle-stroke-width': 2
      }
    });

    // Add cluster count labels
    map.current.addLayer({
      id: 'cluster-count',
      type: 'symbol',
      source: 'events',
      filter: ['has', 'point_count'],
      layout: {
        'text-field': '{point_count_abbreviated}',
        'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
        'text-size': 12,
        'text-anchor': 'center'
      },
      paint: {
        'text-color': '#000000'
      }
    });

    // Add circle layer for individual protest events
    map.current.addLayer({
      id: 'protest-circles',
      type: 'circle',
      source: 'events',
      filter: ['all', ['==', ['get', 'type'], 'protest'], ['!', ['has', 'point_count']]],
      paint: {
        'circle-radius': 18,
        'circle-color': '#ff4444',
        'circle-stroke-color': '#ffffff',
        'circle-stroke-width': 2,
        'circle-opacity': 0.8
      }
    });

    // Add circle layer for road closures
    map.current.addLayer({
      id: 'road-closure-circles',
      type: 'circle',
      source: 'events',
      filter: ['all', ['==', ['get', 'type'], 'road_closure'], ['!', ['has', 'point_count']]],
      paint: {
        'circle-radius': [
          'match',
          ['get', 'severity'],
          'low', 16,
          'medium', 20,
          'high', 24,
          'critical', 28,
          20 // default
        ],
        'circle-color': [
          'match',
          ['get', 'severity'],
          'low', '#ffaa00',      // Orange for low
          'medium', '#ff6600',   // Orange-red for medium
          'high', '#ff0000',     // Red for high
          'critical', '#990000', // Dark red for critical
          '#ff0000' // default red
        ],
        'circle-stroke-color': '#ffffff',
        'circle-stroke-width': 3,
        'circle-opacity': 0.9
      }
    });

    // Add circle layer for warning markers - BIGGER AND BRIGHTER
    map.current.addLayer({
      id: 'warning-circles',
      type: 'circle',
      source: 'events',
      filter: ['all', ['==', ['get', 'type'], 'warning'], ['!', ['has', 'point_count']]],
      paint: {
        'circle-radius': 28,           // Much bigger than others (vs 18)
        'circle-color': '#FFD700',     // Bright gold
        'circle-stroke-color': '#FF4500', // Orange border for contrast
        'circle-stroke-width': 4,      // Thicker border
        'circle-opacity': 1.0          // Fully opaque
      }
    });

    // Add text layer for individual event emojis
    map.current.addLayer({
      id: 'event-emoji',
      type: 'symbol',
      source: 'events',
      filter: ['!', ['has', 'point_count']],
      layout: {
        'text-field': ['get', 'emoji'],
        'text-size': [
          'case',
          ['==', ['get', 'type'], 'warning'], 28, // Bigger emoji for warnings
          20 // Normal size for others
        ],
        'text-anchor': 'center',
        'text-justify': 'center',
        'text-allow-overlap': true
      },
      paint: {
        'text-color': '#ffffff',
        'text-halo-color': '#000000',
        'text-halo-width': 2
      }
    });

    // Add click event for clusters
    map.current.on('click', 'clusters', (e: any) => {
      if (!map.current) return;
      const features = map.current.queryRenderedFeatures(e.point, {
        layers: ['clusters']
      });

      if (features.length > 0 && features[0].properties) {
        const clusterId = features[0].properties.cluster_id;
        const pointCount = features[0].properties.point_count;
        const clusterSource = (map.current.getSource('events') as any);

        // Get cluster expansion zoom
        clusterSource.getClusterExpansionZoom(clusterId, (err: any, zoom: number) => {
          if (err || !map.current) return;

          map.current.easeTo({
            center: (features[0].geometry as any).coordinates,
            zoom: zoom
          });
        });
      }
    });

    // Add click events for individual events
    ['protest-circles', 'road-closure-circles', 'warning-circles', 'event-emoji'].forEach(layerId => {
      if (!map.current) return;
      map.current.on('click', layerId, (e: any) => {
        const feature = e.features[0];
        const coordinates = feature.geometry.coordinates.slice();
        const properties = feature.properties;

        // Create detailed popup for individual events
        const popupHTML = generatePopupHTML(properties);
        
        const popup = new mapboxgl.Popup({ closeButton: true, closeOnClick: true })
          .setLngLat(coordinates)
          .setHTML(popupHTML);
          
        if (map.current) {
          popup.addTo(map.current);
          
          // Fly to location
          map.current.flyTo({
            center: coordinates,
            zoom: 15,
            speed: 1.2,
            curve: 1,
            easing: (t: number) => t,
            essential: true
          });
        }
      });

      // Add cursor pointer for interactive pins
      map.current.on('mouseenter', layerId, () => {
        if (map.current) {
          map.current.getCanvas().style.cursor = 'pointer';
        }
      });
      map.current.on('mouseleave', layerId, () => {
        if (map.current) {
          map.current.getCanvas().style.cursor = '';
        }
      });
    });

    // Add cursor pointer for clusters
    map.current.on('mouseenter', 'clusters', () => {
      if (map.current) {
        map.current.getCanvas().style.cursor = 'pointer';
      }
    });
    map.current.on('mouseleave', 'clusters', () => {
      if (map.current) {
        map.current.getCanvas().style.cursor = '';
      }
    });
  }
};
