import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database helper functions
export const db = {
  trafficEvents: {
    async create(data: {
      type: string;
      roadName: string;
      vehicleType: string;
      description: string;
      timestamp: string;
    }) {
      const { data: result, error } = await supabase
        .from('traffic_events')
        .insert({
          event_type: data.type,
          road_name: data.roadName,
          vehicle_type: data.vehicleType,
          description: data.description,
          timestamp: data.timestamp,
          simulation_id: null // Will be set when we have active simulation
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating traffic event:', error);
        throw error;
      }

      return result;
    },

    async list(simulationId?: string) {
      let query = supabase
        .from('traffic_events')
        .select('*')
        .order('timestamp', { ascending: false });

      if (simulationId) {
        query = query.eq('simulation_id', simulationId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching traffic events:', error);
        throw error;
      }

      return data;
    }
  },

  simulationRuns: {
    async create(data: {
      userId?: string;
      status: string;
      speed: number;
    }) {
      const { data: result, error } = await supabase
        .from('simulation_runs')
        .insert({
          user_id: data.userId || null,
          status: data.status,
          speed: data.speed,
          start_time: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating simulation run:', error);
        throw error;
      }

      return result;
    },

    async update(id: string, data: {
      status?: string;
      endTime?: string;
      cyclesCompleted?: number;
      totalProcessed?: number;
      avgWaitTime?: number;
      efficiency?: number;
      emergencyEvents?: number;
    }) {
      const updateData: Record<string, any> = {};
      
      if (data.status !== undefined) updateData.status = data.status;
      if (data.endTime !== undefined) updateData.end_time = data.endTime;
      if (data.cyclesCompleted !== undefined) updateData.cycles_completed = data.cyclesCompleted;
      if (data.totalProcessed !== undefined) updateData.total_processed = data.totalProcessed;
      if (data.avgWaitTime !== undefined) updateData.avg_wait_time = data.avgWaitTime;
      if (data.efficiency !== undefined) updateData.efficiency = data.efficiency;
      if (data.emergencyEvents !== undefined) updateData.emergency_events = data.emergencyEvents;

      const { data: result, error } = await supabase
        .from('simulation_runs')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating simulation run:', error);
        throw error;
      }

      return result;
    },

    async get(id: string) {
      const { data, error } = await supabase
        .from('simulation_runs')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching simulation run:', error);
        throw error;
      }

      return data;
    },

    async list() {
      const { data, error } = await supabase
        .from('simulation_runs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching simulation runs:', error);
        throw error;
      }

      return data;
    }
  },

  roadPerformance: {
    async create(data: {
      simulationId: string;
      roadName: string;
      roadDirection: string;
      vehicles: number;
      waitTime: number;
      queueLength: number;
      efficiency: number;
      signalState: string;
    }) {
      const { data: result, error } = await supabase
        .from('road_performance')
        .insert({
          simulation_id: data.simulationId,
          road_name: data.roadName,
          road_direction: data.roadDirection,
          vehicles: data.vehicles,
          wait_time: data.waitTime,
          queue_length: data.queueLength,
          efficiency: data.efficiency,
          signal_state: data.signalState,
          timestamp: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating road performance:', error);
        throw error;
      }

      return result;
    },

    async list(simulationId: string) {
      const { data, error } = await supabase
        .from('road_performance')
        .select('*')
        .eq('simulation_id', simulationId)
        .order('timestamp', { ascending: false });

      if (error) {
        console.error('Error fetching road performance:', error);
        throw error;
      }

      return data;
    }
  },

  optimizationRecommendations: {
    async create(data: {
      simulationId: string;
      roadName: string;
      category: string;
      priority: string;
      recommendation: string;
      expectedImprovement?: number;
      status: string;
    }) {
      const { data: result, error } = await supabase
        .from('optimization_recommendations')
        .insert({
          simulation_id: data.simulationId,
          road_name: data.roadName,
          category: data.category,
          priority: data.priority,
          recommendation: data.recommendation,
          expected_improvement: data.expectedImprovement,
          status: data.status
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating optimization recommendation:', error);
        throw error;
      }

      return result;
    },

    async list(simulationId: string) {
      const { data, error } = await supabase
        .from('optimization_recommendations')
        .select('*')
        .eq('simulation_id', simulationId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching optimization recommendations:', error);
        throw error;
      }

      return data;
    }
  }
};
