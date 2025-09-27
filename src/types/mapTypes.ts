export interface MapboxStyle {
  id: string;
  name: string;
  emoji: string;
  isCustom: boolean;
}

export type EventFilter = 'all' | 'warnings' | 'road_closures' | 'protests';

export type ScrapingStatus = 'idle' | 'scraping' | 'completed' | 'error';

export interface MapState {
  mapLoaded: boolean;
  eventsLoaded: boolean;
  initialMarkersRendered: boolean;
  retryScheduled: boolean;
  renderingMarkers: boolean;
}
