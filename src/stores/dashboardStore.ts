import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'analyst' | 'corporate';
  greenPoints: number;
  streak: number;
}

interface WasteData {
  id: string;
  location: string;
  lat: number;
  lng: number;
  type: 'organic' | 'plastic' | 'paper' | 'electronic' | 'hazardous';
  amount: number;
  collectorId: string;
  timestamp: string;
  status: 'pending' | 'collected' | 'processed';
}

interface DashboardWidget {
  id: string;
  type: 'chart' | 'map' | 'stats' | 'table';
  title: string;
  position: { x: number; y: number; w: number; h: number };
  data?: any;
}

interface DashboardState {
  user: User | null;
  wasteData: WasteData[];
  widgets: DashboardWidget[];
  selectedDateRange: { start: Date; end: Date };
  filters: {
    wasteType: string[];
    status: string[];
    location: string[];
  };
  isLoading: boolean;
  realTimeStats: {
    totalWaste: number;
    activeCollectors: number;
    completedRoutes: number;
    greenPoints: number;
  };
  heatmapData: Array<{
    lat: number;
    lng: number;
    intensity: number;
    area: string;
    count: number;
  }>;
  setUser: (user: User) => void;
  setWasteData: (data: WasteData[]) => void;
  addWidget: (widget: DashboardWidget) => void;
  updateWidget: (id: string, updates: Partial<DashboardWidget>) => void;
  removeWidget: (id: string) => void;
  setDateRange: (range: { start: Date; end: Date }) => void;
  setFilters: (filters: Partial<DashboardState['filters']>) => void;
  setLoading: (loading: boolean) => void;
  fetchRealTimeStats: () => Promise<void>;
  fetchHeatmapData: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  user: {
    id: '1',
    name: 'Admin User',
    email: 'admin@wastechain.ai',
    role: 'admin',
    greenPoints: 2450,
    streak: 12
  },
  wasteData: [
    {
      id: '1',
      location: 'Chennai Central',
      lat: 13.0827,
      lng: 80.2707,
      type: 'plastic',
      amount: 25.5,
      collectorId: 'collector_1',
      timestamp: '2024-01-15T10:30:00Z',
      status: 'collected'
    },
    {
      id: '2',
      location: 'T. Nagar',
      lat: 13.0435,
      lng: 80.2341,
      type: 'organic',
      amount: 45.2,
      collectorId: 'collector_2',
      timestamp: '2024-01-15T11:15:00Z',
      status: 'processed'
    },
    {
      id: '3',
      location: 'Adyar',
      lat: 13.0067,
      lng: 80.2206,
      type: 'paper',
      amount: 12.8,
      collectorId: 'collector_1',
      timestamp: '2024-01-15T12:00:00Z',
      status: 'pending'
    }
  ],
  widgets: [
    {
      id: 'stats-1',
      type: 'stats',
      title: 'Collection Overview',
      position: { x: 0, y: 0, w: 6, h: 2 }
    },
    {
      id: 'chart-1',
      type: 'chart',
      title: 'Waste Collection Trends',
      position: { x: 6, y: 0, w: 6, h: 4 }
    },
    {
      id: 'map-1',
      type: 'map',
      title: 'Collection Heatmap',
      position: { x: 0, y: 2, w: 6, h: 4 }
    }
  ],
  selectedDateRange: {
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    end: new Date()
  },
  filters: {
    wasteType: [],
    status: [],
    location: []
  },
  isLoading: false,
  realTimeStats: {
    totalWaste: 0,
    activeCollectors: 0,
    completedRoutes: 0,
    greenPoints: 0
  },
  heatmapData: [],
  setUser: (user) => set({ user }),
  setWasteData: (wasteData) => set({ wasteData }),
  addWidget: (widget) => set((state) => ({ widgets: [...state.widgets, widget] })),
  updateWidget: (id, updates) => set((state) => ({
    widgets: state.widgets.map((w) => w.id === id ? { ...w, ...updates } : w)
  })),
  removeWidget: (id) => set((state) => ({
    widgets: state.widgets.filter((w) => w.id !== id)
  })),
  setDateRange: (selectedDateRange) => set({ selectedDateRange }),
  setFilters: (filters) => set((state) => ({
    filters: { ...state.filters, ...filters }
  })),
  setLoading: (isLoading) => set({ isLoading }),
  fetchRealTimeStats: async () => {
    try {
      set({ isLoading: true });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data for demonstration
      const mockPickups = [
        { actual_weight: 25.5, points_awarded: 255 },
        { actual_weight: 45.2, points_awarded: 452 },
        { actual_weight: 12.8, points_awarded: 128 },
        { actual_weight: 33.1, points_awarded: 331 },
        { actual_weight: 18.7, points_awarded: 187 }
      ];
      
      const mockCollectors = [
        { id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }, { id: '5' }
      ];
      
      const mockTodayPickups = [
        { id: '1' }, { id: '2' }, { id: '3' }
      ];
      
      // Calculate totals from mock data
      const totalWaste = mockPickups.reduce((sum, p) => sum + p.actual_weight, 0);
      const totalPoints = mockPickups.reduce((sum, p) => sum + p.points_awarded, 0);
      
      set({
        realTimeStats: {
          totalWaste: Math.round(totalWaste * 10) / 10,
          activeCollectors: mockCollectors.length,
          completedRoutes: mockTodayPickups.length,
          greenPoints: totalPoints
        },
        isLoading: false
      });
    } catch (error) {
      console.error('Error fetching real-time stats:', error);
      // Set fallback data on error
      set({
        realTimeStats: {
          totalWaste: 135.3,
          activeCollectors: 5,
          completedRoutes: 3,
          greenPoints: 1353
        },
        isLoading: false
      });
    }
  },
  fetchHeatmapData: async () => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock geographic distribution data
      const mockGeographicData = {
        'Chennai': { count: 45 },
        'T. Nagar': { count: 32 },
        'Adyar': { count: 28 },
        'Velachery': { count: 35 },
        'Anna Nagar': { count: 41 },
        'Guindy': { count: 23 },
        'Besant Nagar': { count: 19 },
        'Nungambakkam': { count: 37 }
      };
      
      // Transform mock data into heatmap format
      const heatmapData = Object.entries(mockGeographicData).map(([city, data]) => ({
        lat: getCoordinatesForCity(city).lat,
        lng: getCoordinatesForCity(city).lng,
        intensity: Math.min(1, data.count / 50), // Normalize intensity
        area: city,
        count: data.count
      }));
      
      set({ heatmapData });
    } catch (error) {
      console.error('Error fetching heatmap data:', error);
      // Set fallback heatmap data on error
      const fallbackHeatmapData = [
        { lat: 13.0827, lng: 80.2707, intensity: 0.9, area: 'Chennai', count: 45 },
        { lat: 13.0435, lng: 80.2341, intensity: 0.64, area: 'T. Nagar', count: 32 },
        { lat: 13.0067, lng: 80.2206, intensity: 0.56, area: 'Adyar', count: 28 }
      ];
      set({ heatmapData: fallbackHeatmapData });
    }
  }
}));

// Helper function to get coordinates for cities
function getCoordinatesForCity(city: string): { lat: number; lng: number } {
  const cityCoords: Record<string, { lat: number; lng: number }> = {
    'Chennai': { lat: 13.0827, lng: 80.2707 },
    'T. Nagar': { lat: 13.0435, lng: 80.2341 },
    'Adyar': { lat: 13.0067, lng: 80.2206 },
    'Velachery': { lat: 12.9755, lng: 80.2201 },
    'Anna Nagar': { lat: 13.0850, lng: 80.2101 },
    'Guindy': { lat: 13.0067, lng: 80.2206 },
    'Besant Nagar': { lat: 13.0067, lng: 80.2667 },
    'Nungambakkam': { lat: 13.0732, lng: 80.2609 }
  };
  
  return cityCoords[city] || { lat: 13.0827, lng: 80.2707 };
}