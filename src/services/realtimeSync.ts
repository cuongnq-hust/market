import { supabase, isSupabaseConfigured } from './supabaseClient';

export type SyncEventType = 'SELLERS_CHANGED' | 'POSTS_CHANGED';

export interface SyncOptions {
  isSilent: boolean;
  reason?: string;
}

export type SyncListener = (options: SyncOptions) => void | Promise<void>;

const sellersListeners = new Set<SyncListener>();
const postsListeners = new Set<SyncListener>();

let isInitialized = false;
let broadcastChannel: BroadcastChannel | null = null;
let lastSellersSyncTime = 0;
let lastPostsSyncTime = 0;
let sellersDebounceTimer: ReturnType<typeof setTimeout> | null = null;
let postsDebounceTimer: ReturnType<typeof setTimeout> | null = null;

// Throttling: Giới hạn tối thiểu 15 giây giữa các lần quét ngầm để không spam mạng và không làm gián đoạn người dùng
const THROTTLE_WINDOW_MS = 15000;

// Debounced & throttled triggers
const triggerSellersSync = (reason?: string, isSilent: boolean = true) => {
  if (sellersDebounceTimer) clearTimeout(sellersDebounceTimer);
  sellersDebounceTimer = setTimeout(() => {
    const now = Date.now();
    if (now - lastSellersSyncTime < THROTTLE_WINDOW_MS && reason !== 'cross_tab_broadcast') {
      return;
    }
    lastSellersSyncTime = now;
    console.log(`🔄 Syncing sellers/map data (reason: ${reason || 'unknown'}, isSilent: ${isSilent})`);
    sellersListeners.forEach((listener) => {
      try {
        listener({ isSilent, reason });
      } catch (err) {
        console.error('Error executing sellers sync listener:', err);
      }
    });
  }, 1000);
};

const triggerPostsSync = (reason?: string, isSilent: boolean = true) => {
  if (postsDebounceTimer) clearTimeout(postsDebounceTimer);
  postsDebounceTimer = setTimeout(() => {
    const now = Date.now();
    if (now - lastPostsSyncTime < THROTTLE_WINDOW_MS && reason !== 'cross_tab_broadcast') {
      return;
    }
    lastPostsSyncTime = now;
    console.log(`🔄 Syncing community posts data (reason: ${reason || 'unknown'}, isSilent: ${isSilent})`);
    postsListeners.forEach((listener) => {
      try {
        listener({ isSilent, reason });
      } catch (err) {
        console.error('Error executing posts sync listener:', err);
      }
    });
  }, 1000);
};

/**
 * Broadcast an event to other tabs on the same device
 */
export const broadcastSyncEvent = (type: SyncEventType) => {
  try {
    broadcastChannel?.postMessage({ type, timestamp: Date.now() });
  } catch (err) {
    // Ignore in unsupported environments
  }
};

/**
 * Subscribe a callback for seller/product changes
 */
export const onSellersSync = (listener: SyncListener) => {
  sellersListeners.add(listener);
  return () => {
    sellersListeners.delete(listener);
  };
};

/**
 * Subscribe a callback for community forum changes
 */
export const onPostsSync = (listener: SyncListener) => {
  postsListeners.add(listener);
  return () => {
    postsListeners.delete(listener);
  };
};

/**
 * Initialize cross-device Realtime and browser synchronization
 */
export const initRealtimeSync = () => {
  if (isInitialized) return;
  isInitialized = true;

  // 1. Setup Cross-tab BroadcastChannel
  try {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      broadcastChannel = new BroadcastChannel('pass_do_realtime_sync');
      broadcastChannel.onmessage = (event) => {
        const data = event.data as { type: SyncEventType; timestamp: number };
        if (data?.type === 'SELLERS_CHANGED') {
          triggerSellersSync('cross_tab_broadcast', true);
        } else if (data?.type === 'POSTS_CHANGED') {
          triggerPostsSync('cross_tab_broadcast', true);
        }
      };
    }
  } catch (err) {
    console.warn('BroadcastChannel not initialized:', err);
  }

  // 2. Setup Supabase Realtime (WebSocket)
  if (isSupabaseConfigured && supabase) {
    try {
      supabase
        .channel('public_db_sync_channel')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'seller_profiles' },
          (payload) => {
            console.log('⚡ Realtime: seller_profiles changed', payload.eventType);
            triggerSellersSync('supabase_realtime_seller_profiles', true);
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'products' },
          (payload) => {
            console.log('⚡ Realtime: products changed', payload.eventType);
            triggerSellersSync('supabase_realtime_products', true);
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'forum_posts' },
          (payload) => {
            console.log('⚡ Realtime: forum_posts changed', payload.eventType);
            triggerPostsSync('supabase_realtime_forum_posts', true);
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'forum_comments' },
          (payload) => {
            console.log('⚡ Realtime: forum_comments changed', payload.eventType);
            triggerPostsSync('supabase_realtime_forum_comments', true);
          }
        )
        .subscribe((status, err) => {
          if (err) {
            console.warn('Supabase Realtime subscription error:', err);
          } else {
            console.log('🟢 Supabase Realtime channel status:', status);
          }
        });
    } catch (err) {
      console.error('Failed to setup Supabase Realtime channel:', err);
    }
  }

  // 3. Tab Focus & Visibility Sync (Làm mới ngầm khi người dùng mở lại tab/mở khóa điện thoại)
  if (typeof window !== 'undefined') {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const now = Date.now();
        if (now - lastSellersSyncTime > THROTTLE_WINDOW_MS) {
          triggerSellersSync('tab_focus_or_visible', true);
        }
        if (now - lastPostsSyncTime > THROTTLE_WINDOW_MS) {
          triggerPostsSync('tab_focus_or_visible', true);
        }
      }
    };

    window.addEventListener('focus', handleVisibilityChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 4. Smart Periodic Heartbeat (Mỗi 60s làm mới ngầm nếu tab đang mở và không ẩn)
    setInterval(() => {
      if (!document.hidden) {
        const now = Date.now();
        if (now - lastSellersSyncTime > 55000) {
          triggerSellersSync('periodic_heartbeat', true);
        }
        if (now - lastPostsSyncTime > 55000) {
          triggerPostsSync('periodic_heartbeat', true);
        }
      }
    }, 60000);
  }
};
