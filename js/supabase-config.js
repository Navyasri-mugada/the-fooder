/**
 * Supabase Cloud PostgreSQL Service for The Fooder
 * 
 * INSTRUCTIONS:
 * 1. Go to https://supabase.com/ and click "Start your project" (Sign in with GitHub).
 * 2. Click "New project", name it "the-fooder".
 * 3. Go to Project Settings -> API and copy:
 *    - Project URL
 *    - Project API Key (anon / public)
 * 4. Paste them into the SUPABASE_URL and SUPABASE_ANON_KEY constants below!
 */

const SUPABASE_URL = "YOUR_SUPABASE_PROJECT_URL"; // e.g. https://abcdefghijklm.supabase.co
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY"; // starts with eyJhbGci...

let supabaseClient = null;
let supabaseInitialized = false;

// Initialize Supabase if user has provided real credentials
if (typeof supabase !== 'undefined' && SUPABASE_URL !== "YOUR_SUPABASE_PROJECT_URL" && SUPABASE_ANON_KEY !== "YOUR_SUPABASE_ANON_KEY") {
  try {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    supabaseInitialized = true;
    console.log("⚡ Supabase PostgreSQL connected successfully to The Fooder!");
  } catch (err) {
    console.warn("Supabase initialization error, falling back to local storage:", err);
  }
} else {
  console.log("ℹ️ Supabase credentials not set yet. Running with local browser storage. Update js/supabase-config.js with your keys to enable cloud sync.");
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
