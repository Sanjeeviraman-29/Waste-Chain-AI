// Mock data service for when Supabase is unavailable
export interface MockCollector {
  id: string;
  collector_name: string;
  phone: string;
  vehicle_type: string;
  license_plate: string;
  service_areas: string[];
  is_active: boolean;
  rating: number;
  total_collections: number;
  created_at: string;
}

// Mock collectors data
let mockCollectors: MockCollector[] = [
  {
    id: '1',
    collector_name: 'Rajesh Kumar',
    phone: '+91 98765 43210',
    vehicle_type: 'Truck',
    license_plate: 'TN 01 AB 1234',
    service_areas: ['T. Nagar', 'Adyar'],
    is_active: true,
    rating: 4.8,
    total_collections: 156,
    created_at: '2024-01-10T08:00:00Z'
  },
  {
    id: '2',
    collector_name: 'Priya Sharma',
    phone: '+91 87654 32109',
    vehicle_type: 'Van',
    license_plate: 'TN 02 CD 5678',
    service_areas: ['Anna Nagar', 'Velachery'],
    is_active: true,
    rating: 4.9,
    total_collections: 203,
    created_at: '2024-01-08T10:30:00Z'
  },
  {
    id: '3',
    collector_name: 'Mohammed Ali',
    phone: '+91 76543 21098',
    vehicle_type: 'Motorcycle',
    license_plate: 'TN 03 EF 9012',
    service_areas: ['Chennai Central'],
    is_active: false,
    rating: 4.6,
    total_collections: 98,
    created_at: '2024-01-05T14:15:00Z'
  }
];

export const mockDataService = {
  // Fetch all collectors
  async getCollectors(): Promise<{ data: MockCollector[]; error: null }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return { data: [...mockCollectors], error: null };
  },

  // Create a new collector
  async createCollector(collectorData: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    vehicle_id?: string;
  }): Promise<{ success: boolean; data?: any; error?: string }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      const newCollector: MockCollector = {
        id: Date.now().toString(),
        collector_name: collectorData.name,
        phone: collectorData.phone || '',
        vehicle_type: collectorData.vehicle_id || 'Not specified',
        license_plate: 'Pending',
        service_areas: [],
        is_active: true,
        rating: 5.0,
        total_collections: 0,
        created_at: new Date().toISOString()
      };

      mockCollectors.unshift(newCollector);

      return {
        success: true,
        data: {
          collector_id: newCollector.id,
          name: collectorData.name,
          email: collectorData.email,
          phone: collectorData.phone,
          vehicle_type: collectorData.vehicle_id,
          is_active: true,
          created_at: newCollector.created_at
        }
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to create collector'
      };
    }
  },

  // Update collector status
  async updateCollectorStatus(id: string, is_active: boolean): Promise<{ error: null }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const collectorIndex = mockCollectors.findIndex(c => c.id === id);
    if (collectorIndex !== -1) {
      mockCollectors[collectorIndex].is_active = is_active;
    }
    
    return { error: null };
  }
};

// Check if we should use mock data (when Supabase is not available)
export const shouldUseMockData = (): boolean => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  return !supabaseUrl || !supabaseAnonKey;
};
