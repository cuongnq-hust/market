import type { IDataService } from './db.interface';
import { mockService } from './mockService';
import { isSupabaseConfigured } from './supabaseClient';
import { supabaseService } from './supabaseService';

// Automatically selects SupabaseService if .env credentials are set, otherwise MockService
export const dataService: IDataService = isSupabaseConfigured ? supabaseService : mockService;

export { isSupabaseConfigured } from './supabaseClient';
export { mockService } from './mockService';
export { supabaseService } from './supabaseService';
export * from './db.interface';
