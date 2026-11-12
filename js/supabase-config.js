/**
 * Supabase Cloud PostgreSQL Service for The Fooder
 * 
 * Your Project URL has been pre-configured:
 * https://likcxbuwroxqhiqnkufr.supabase.co
 * 
 * To get your Project API Key (anon / public):
 * 1. Go to your Supabase project settings -> API
 * 2. Copy the "anon public" key (starts with eyJhbGci...)
 * 3. Paste it into SUPABASE_ANON_KEY below!
 */

const SUPABASE_URL = "https://likcxbuwroxqhiqnkufr.supabase.co";
let SUPABASE_ANON_KEY = (typeof localStorage !== 'undefined' && localStorage.getItem('thefooder_supabase_anon_key')) || "YOUR_SUPABASE_ANON_KEY";

let supabaseClient = null;
let supabaseInitialized = false;

// Initialize Supabase if valid key is provided
function initSupabase(customKey) {
  if (customKey) {
    SUPABASE_ANON_KEY = customKey.trim();
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('thefooder_supabase_anon_key', SUPABASE_ANON_KEY);
    }
  }

  if (typeof supabase !== 'undefined' && SUPABASE_ANON_KEY && SUPABASE_ANON_KEY !== "YOUR_SUPABASE_ANON_KEY") {
    try {
      supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      supabaseInitialized = true;
      console.log("⚡ Supabase PostgreSQL connected successfully to The Fooder!");
      return true;
    } catch (err) {
      console.warn("Supabase initialization error, falling back to local storage:", err);
      supabaseInitialized = false;
      return false;
    }
  } else {
    supabaseInitialized = false;
    console.log("ℹ️ Supabase anon key not set yet. Running with local browser storage. Update credentials to enable cloud sync.");
    return false;
  }
}

// Auto-run on load
initSupabase();

function isSupabaseConnected() {
  return supabaseInitialized && supabaseClient !== null;
}

/**
 * Saves a placed order to Supabase 'orders' table
 */
async function saveOrderToSupabase(orderData) {
  if (!supabaseInitialized || !supabaseClient) {
    return { success: true, mode: 'local' };
  }
  try {
    const { data, error } = await supabaseClient
      .from('orders')
      .insert([
        {
          order_id: orderData.orderId,
          customer_name: orderData.customer.name,
          customer_phone: orderData.customer.phone,
          customer_address: orderData.customer.address,
          branch_city: orderData.branch.city,
          items: orderData.items,
          subtotal: orderData.subtotal,
          payment_method: orderData.paymentMethod,
          has_free_sweet: orderData.hasFreeSweet,
          status: 'Order received',
          created_at: new Date().toISOString()
        }
      ]);

    if (error) throw error;
    console.log("Order saved to Supabase:", data);
    return { success: true, mode: 'supabase', data };
  } catch (err) {
    console.warn("Supabase insert order error (falling back to local):", err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Saves a table reservation to Supabase 'bookings' table
 */
async function saveBookingToSupabase(bookingData) {
  if (!supabaseInitialized || !supabaseClient) {
    return { success: true, mode: 'local' };
  }
  try {
    const { data, error } = await supabaseClient
      .from('bookings')
      .insert([
        {
          booking_id: bookingData.bookingId,
          guest_name: bookingData.name,
          phone: bookingData.phone,
          branch: bookingData.branch,
          guests: bookingData.guests,
          booking_date: bookingData.date,
          booking_time: bookingData.time,
          notes: bookingData.notes || '',
          status: 'Pending Confirmation Call',
          created_at: new Date().toISOString()
        }
      ]);

    if (error) throw error;
    console.log("Booking saved to Supabase:", data);
    return { success: true, mode: 'supabase', data };
  } catch (err) {
    console.warn("Supabase insert booking error (falling back to local):", err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Saves a guest review to Supabase 'reviews' table
 */
async function saveReviewToSupabase(reviewData) {
  if (!supabaseInitialized || !supabaseClient) {
    return { success: true, mode: 'local' };
  }
  try {
    const { data, error } = await supabaseClient
      .from('reviews')
      .insert([
        {
          guest_name: reviewData.guest,
          city: reviewData.city,
          dish: reviewData.dish,
          rating: reviewData.rating,
          comment: reviewData.comment,
          verified: true,
          created_at: new Date().toISOString()
        }
      ]);

    if (error) throw error;
    console.log("Review saved to Supabase:", data);
    return { success: true, mode: 'supabase', data };
  } catch (err) {
    console.warn("Supabase insert review error (falling back to local):", err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Fetches recent reviews from Supabase 'reviews' table
 */
async function fetchReviewsFromSupabase() {
  if (!supabaseInitialized || !supabaseClient) {
    return null;
  }
  try {
    const { data, error } = await supabaseClient
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(30);

    if (error) throw error;
    if (data && data.length > 0) {
      return data.map(item => ({
        id: item.id || `r${item.created_at}`,
        guest: item.guest_name,
        city: item.city,
        dish: item.dish,
        rating: item.rating,
        comment: item.comment,
        verified: item.verified,
        date: 'Recent'
      }));
    }
    return null;
  } catch (err) {
    console.warn("Could not fetch reviews from Supabase:", err.message);
    return null;
  }
}
