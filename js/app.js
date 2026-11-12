/**
 * The Fooder - Andhra Food Restaurant
 * Core Interactive Application Logic
 * Supports Supabase PostgreSQL Cloud with automatic LocalStorage Fallback
 */

// Application State
const STATE = {
  activeBranchId: localStorage.getItem('thefooder_branch') || 'vijayawada',
  cart: JSON.parse(localStorage.getItem('thefooder_cart') || '[]'),
  currentCategory: 'all',
  currentDiet: 'all', // 'all', 'Veg', 'Non-veg'
  searchQuery: '',
  currentSort: 'default',
  soundEnabled: localStorage.getItem('thefooder_sound') !== 'false',
  selectedPayment: 'COD',
  activeOrder: JSON.parse(localStorage.getItem('thefooder_active_order') || 'null'),
  trackingTimer: null,
  reviews: JSON.parse(localStorage.getItem('thefooder_reviews') || JSON.stringify(RESTAURANT_DATA.reviews)),
  user: JSON.parse(localStorage.getItem('thefooder_user') || 'null')
};

// Web Audio API Sound Synthesizer (Zero external dependencies)
let audioCtx = null;

function initAudio() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      audioCtx = new AudioContext();
    }
  }
}

function playSound(type) {
  if (!STATE.soundEnabled) return;
  try {
    initAudio();
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    const now = audioCtx.currentTime;

    if (type === 'add') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
      osc.start(now);
      osc.stop(now + 0.15);
    } else if (type === 'remove') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(261.63, now + 0.1);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.start(now);
      osc.stop(now + 0.13);
    } else if (type === 'success') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.start(now);
      osc.stop(now + 0.45);
    }
  } catch (e) {
    console.debug('Audio error:', e);
  }
}

function toggleSound() {
  STATE.soundEnabled = !STATE.soundEnabled;
  localStorage.setItem('thefooder_sound', STATE.soundEnabled);
  const btn = document.getElementById('sound-toggle-btn');
  if (btn) {
    btn.innerHTML = STATE.soundEnabled ? '🔔' : '🔕';
    btn.title = STATE.soundEnabled ? 'Sound is ON' : 'Sound is OFF';
  }
  showToast(STATE.soundEnabled ? 'Sound effects enabled' : 'Sound effects muted');
  if (STATE.soundEnabled) playSound('add');
}

// Toast Notifications
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  
  let icon = 'ℹ️';
  if (type === 'success') icon = '✓';
  if (type === 'cart') icon = '🛒';
  if (type === 'gift') icon = '🎁';

  toast.innerHTML = `<span style="font-weight:800; color:var(--gold);">${icon}</span> <span>${message}</span>`;
  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 350);
  }, 3200);
}

// Branch Selection & Updates
function getActiveBranch() {
  return RESTAURANT_DATA.branches.find(b => b.id === STATE.activeBranchId) || RESTAURANT_DATA.branches[0];
}

function selectActiveBranch(branchId) {
  const branch = RESTAURANT_DATA.branches.find(b => b.id === branchId);
  if (!branch) return;

  STATE.activeBranchId = branchId;
  localStorage.setItem('thefooder_branch', branchId);

  updateBranchUI();
  closeBranchModal();
  showToast(`Branch switched to ${branch.city} (${branch.address})`, 'success');
  playSound('add');
}

function updateBranchUI() {
  const branch = getActiveBranch();

  const quickBranch = document.getElementById('quick-branch-text');
  if (quickBranch) quickBranch.textContent = `${branch.city} (${branch.address.split(',')[0]}) • Open`;

  const navBranch = document.getElementById('nav-branch-name');
  if (navBranch) navBranch.textContent = branch.city;

  const bannerCity = document.getElementById('banner-branch-city');
  if (bannerCity) bannerCity.textContent = `${branch.city} Branch`;

  const bannerAddress = document.getElementById('banner-branch-address');
  if (bannerAddress) bannerAddress.textContent = `${branch.address} (Ph: ${branch.phone})`;

  const bannerDelivery = document.getElementById('banner-branch-delivery');
  if (bannerDelivery) bannerDelivery.textContent = branch.deliveryTime;

  const bannerTimings = document.getElementById('banner-branch-timings');
  if (bannerTimings) bannerTimings.textContent = branch.openHours;

  const checkoutBranch = document.getElementById('checkout-branch-name');
  if (checkoutBranch) checkoutBranch.textContent = `${branch.city} (${branch.address})`;

  const billCity = document.getElementById('bill-branch-city');
  if (billCity) billCity.textContent = branch.city;

  const resBranch = document.getElementById('res-branch');
  if (resBranch) resBranch.value = branch.city;

  renderBranchCards();
  renderBranchPickerList();
}

function renderBranchCards() {
  const container = document.getElementById('branches-cards-grid');
  if (!container) return;

  container.innerHTML = RESTAURANT_DATA.branches.map(b => {
    const isActive = b.id === STATE.activeBranchId;
    return `
      <div class="branch-card ${isActive ? 'active-branch' : ''}">
        <div class="branch-card-header">
          <div>
            <h3>${b.city}</h3>
            <span style="font-size:0.8rem; color:var(--text-light);">${b.popularLandmark}</span>
          </div>
          <span class="branch-status-badge">
            <span class="status-dot"></span> Open Today
          </span>
        </div>

        <div class="branch-meta-row">
          <span class="meta-icon">📍</span>
          <div>
            <strong>Address:</strong><br>
            <span>${b.address}</span>
          </div>
        </div>

        <div class="branch-meta-row">
          <span class="meta-icon">📞</span>
          <div>
            <strong>Phone Order:</strong><br>
            <a href="tel:${b.phone.replace(/[^0-9+]/g, '')}">${b.phone}</a>
          </div>
        </div>

        <div class="branch-meta-row">
          <span class="meta-icon">⏰</span>
          <div>
            <strong>Hours:</strong><br>
            <span>${b.openHours}</span>
          </div>
        </div>

        <div class="branch-meta-row">
          <span class="meta-icon">⚡</span>
          <div>
            <strong>Estimated Delivery:</strong><br>
            <span style="font-weight:700; color:var(--chilli);">${b.deliveryTime}</span>
          </div>
        </div>

        <div class="branch-card-actions">
          <button class="btn-branch-select" onclick="selectActiveBranch('${b.id}')">
            ${isActive ? '✓ Current Branch' : 'Order From Here'}
          </button>
          <button class="btn-branch-book" onclick="quickBookBranch('${b.city}')">
            Book Table
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function renderBranchPickerList() {
  const container = document.getElementById('branch-picker-list');
  if (!container) return;

  container.innerHTML = RESTAURANT_DATA.branches.map(b => {
    const isActive = b.id === STATE.activeBranchId;
    return `
      <div style="border:1.5px solid ${isActive ? 'var(--primary)' : 'var(--border-medium)'}; background:${isActive ? 'var(--primary-subtle)' : '#fff'}; border-radius:var(--radius-md); padding:1rem; cursor:pointer;" onclick="selectActiveBranch('${b.id}')">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.4rem;">
          <strong style="font-size:1.05rem; color:var(--primary);">${b.city}</strong>
          ${isActive ? '<span style="font-size:0.75rem; font-weight:800; color:var(--primary); background:#fff; padding:0.2rem 0.6rem; border-radius:999px;">Selected</span>' : ''}
        </div>
        <div style="font-size:0.85rem; color:var(--text-muted); margin-bottom:0.4rem;">${b.address}</div>
        <div style="font-size:0.8rem; display:flex; justify-content:space-between; color:var(--text-light);">
          <span>🕒 ${b.openHours}</span>
          <span style="font-weight:700; color:var(--chilli);">⚡ ${b.deliveryTime}</span>
        </div>
      </div>
    `;
  }).join('');
}

function openBranchModal() {
  const modal = document.getElementById('branch-modal');
  if (modal) modal.classList.add('open');
}

function closeBranchModal() {
  const modal = document.getElementById('branch-modal');
  if (modal) modal.classList.remove('open');
}

// Menu Category Tabs & Filters
function renderCategoryTabs() {
  const container = document.getElementById('category-tabs-container');
  if (!container) return;

  container.innerHTML = RESTAURANT_DATA.categories.map(cat => {
    const isActive = cat.id === STATE.currentCategory;
    return `
      <button class="tab-btn ${isActive ? 'active' : ''}" onclick="setCategoryFilter('${cat.id}')">
        <span>${cat.name}</span>
      </button>
    `;
  }).join('');
}

function setCategoryFilter(categoryId) {
  STATE.currentCategory = categoryId;
  renderCategoryTabs();
  renderMenuItems();
  playSound('add');
}

function filterMenuByCategory(categoryId) {
  STATE.currentCategory = categoryId;
  renderCategoryTabs();
  renderMenuItems();
  smoothScrollTo('#menu-section');
}

function setDietFilter(diet) {
  STATE.currentDiet = diet;
  const buttons = document.querySelectorAll('.diet-pill');
  buttons.forEach(btn => btn.classList.remove('active'));
  
  if (diet === 'all') buttons[0]?.classList.add('active');
  if (diet === 'Veg') buttons[1]?.classList.add('active');
  if (diet === 'Non-veg') buttons[2]?.classList.add('active');

  renderMenuItems();
  playSound('add');
}

function handleMenuSearch(val) {
  STATE.searchQuery = val.trim().toLowerCase();
  renderMenuItems();
}

function handleSortChange(sortVal) {
  STATE.currentSort = sortVal;
  renderMenuItems();
}

function getCartItemQuantity(dishId) {
  const item = STATE.cart.find(i => i.id === dishId);
  return item ? item.qty : 0;
}

// Menu Item Rendering
function renderMenuItems() {
  const container = document.getElementById('menu-items-grid');
  if (!container) return;

  let items = [...RESTAURANT_DATA.menuItems];

  if (STATE.currentCategory !== 'all') {
    items = items.filter(i => i.category === STATE.currentCategory);
  }

  if (STATE.currentDiet !== 'all') {
    items = items.filter(i => i.type.toLowerCase() === STATE.currentDiet.toLowerCase());
  }

  if (STATE.searchQuery) {
    items = items.filter(i => 
      i.name.toLowerCase().includes(STATE.searchQuery) ||
      i.description.toLowerCase().includes(STATE.searchQuery) ||
      i.tags.some(t => t.toLowerCase().includes(STATE.searchQuery))
    );
  }

  if (STATE.currentSort === 'price-asc') {
    items.sort((a, b) => a.price - b.price);
  } else if (STATE.currentSort === 'price-desc') {
    items.sort((a, b) => b.price - a.price);
  } else if (STATE.currentSort === 'name-asc') {
    items.sort((a, b) => a.name.localeCompare(b.name));
  }

  if (items.length === 0) {
    container.innerHTML = `
      <div style="grid-column:1/-1; text-align:center; padding:4rem 1rem; background:#fff; border-radius:var(--radius-lg); border:1px dashed var(--border-medium);">
        <div style="font-size:2.5rem; margin-bottom:1rem;">🍲</div>
        <h3 style="color:var(--primary); margin-bottom:0.5rem;">No dishes found matching your criteria</h3>
        <p style="color:var(--text-muted); font-size:0.95rem; margin-bottom:1.25rem;">Try clearing your search or switching diet filters.</p>
        <button class="btn-primary" onclick="resetFilters()">View All Dishes</button>
      </div>
    `;
    return;
  }

  container.innerHTML = items.map(dish => {
    const isVeg = dish.type.toLowerCase() === 'veg';
    const inCartQty = getCartItemQuantity(dish.id);

    let badgeClass = 'dish-badge-pill';
    if (dish.badge.includes('Fiery') || dish.badge.includes('Chef')) badgeClass += ' fiery';
    if (dish.badge.includes('Free') || dish.badge.includes('Sweet')) badgeClass += ' sweet';

    return `
      <div class="dish-card" id="dish-card-${dish.id}">
        <div class="dish-card-top">
          <div class="dish-diet-badge">
            <span class="diet-indicator ${isVeg ? 'veg' : 'nonveg'}" title="${dish.type}">
              <span class="dot"></span>
            </span>
            <span class="${badgeClass}">${dish.badge}</span>
          </div>
          <span style="font-size:0.75rem; text-transform:uppercase; color:var(--text-light); font-weight:700;">
            ${dish.category}
          </span>
        </div>

        <h3 class="dish-title">${dish.name}</h3>
        <p class="dish-desc">${dish.description}</p>

        <div class="dish-tags">
          ${dish.tags.map(t => `<span class="dish-tag">#${t}</span>`).join('')}
        </div>

        <div class="dish-footer">
          <div class="dish-price">
            <span class="currency">₹</span>
            <span>${dish.price}</span>
          </div>

          <div class="dish-action-wrap">
            ${inCartQty === 0 ? `
              <button class="btn-add-item" onclick="addToCart('${dish.id}', true)">
                <span>+ ADD</span>
              </button>
            ` : `
              <div class="qty-counter">
                <button class="qty-btn" onclick="decreaseCartItem('${dish.id}')" title="Decrease">−</button>
                <span class="qty-number">${inCartQty}</span>
                <button class="qty-btn" onclick="addToCart('${dish.id}', false)" title="Increase">+</button>
              </div>
            `}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function resetFilters() {
  STATE.currentCategory = 'all';
  STATE.currentDiet = 'all';
  STATE.searchQuery = '';
  STATE.currentSort = 'default';
  const searchInput = document.getElementById('menu-search-input');
  if (searchInput) searchInput.value = '';
  renderCategoryTabs();
  setDietFilter('all');
  renderMenuItems();
}

// Cart Operations
function saveCart() {
  localStorage.setItem('thefooder_cart', JSON.stringify(STATE.cart));
  updateCartUI();
  renderMenuItems();
}

/**
 * Adds an item to the basket.
 * If autoOpen is true (e.g. clicking + ADD from the dish card),
 * it automatically slides open the cart drawer so the user immediately sees the order & checkout button!
 */
function addToCart(dishId, autoOpen = true) {
  const dish = RESTAURANT_DATA.menuItems.find(d => d.id === dishId);
  if (!dish) return;

  const existing = STATE.cart.find(i => i.id === dishId);
  if (existing) {
    existing.qty += 1;
  } else {
    STATE.cart.push({
      id: dish.id,
      name: dish.name,
      price: dish.price,
      type: dish.type,
      category: dish.category,
      qty: 1
    });
  }

  playSound('add');
  showToast(`Added "${dish.name}" to basket`, 'cart');
  saveCart();

  // If clicked from menu card, immediately open the cart basket so user can see it!
  if (autoOpen) {
    openCartDrawer();
  }
}

function decreaseCartItem(dishId) {
  const existingIndex = STATE.cart.findIndex(i => i.id === dishId);
  if (existingIndex === -1) return;

  if (STATE.cart[existingIndex].qty > 1) {
    STATE.cart[existingIndex].qty -= 1;
  } else {
    STATE.cart.splice(existingIndex, 1);
  }

  playSound('remove');
  saveCart();
}

function getCartSubtotal() {
  return STATE.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
}

function getCartItemCount() {
  return STATE.cart.reduce((sum, item) => sum + item.qty, 0);
}

function updateCartUI() {
  const count = getCartItemCount();
  const subtotal = getCartSubtotal();

  // Header Nav button count & amount
  const countBadge = document.getElementById('cart-item-count');
  if (countBadge) countBadge.textContent = count;

  const navTotal = document.getElementById('cart-nav-total');
  if (navTotal) navTotal.textContent = `₹${subtotal}`;

  // Floating bottom bar update
  const floatingBar = document.getElementById('floating-cart-bar');
  const floatingCount = document.getElementById('floating-cart-count');
  const floatingTotal = document.getElementById('floating-cart-total');

  if (floatingBar) {
    if (count > 0) {
      floatingBar.classList.add('visible');
      if (floatingCount) floatingCount.textContent = `${count} Item${count > 1 ? 's' : ''}`;
      if (floatingTotal) floatingTotal.textContent = `₹${subtotal}`;
    } else {
      floatingBar.classList.remove('visible');
    }
  }

  // Free sweet perk progress bar
  const perkText = document.getElementById('free-sweet-perk-text');
  const progressBar = document.getElementById('free-sweet-progress');
  const freeLine = document.getElementById('bill-free-sweet-line');
  const threshold = RESTAURANT_DATA.brand.freeSweetOfferThreshold; // 500

  if (subtotal >= threshold) {
    const pct = 100;
    if (progressBar) progressBar.style.width = `${pct}%`;
    if (perkText) perkText.innerHTML = `<span>🎉 Unlocked: FREE Bobbatlu added to your order!</span>`;
    if (freeLine) freeLine.style.display = 'flex';
  } else {
    const diff = threshold - subtotal;
    const pct = Math.min(100, Math.round((subtotal / threshold) * 100));
    if (progressBar) progressBar.style.width = `${pct}%`;
    if (perkText) perkText.innerHTML = `<span>🎁 Add ₹${diff} more to get a FREE Bobbatlu</span>`;
    if (freeLine) freeLine.style.display = 'none';
  }

  // Cart List Items
  const listContainer = document.getElementById('cart-items-list');
  if (listContainer) {
    if (STATE.cart.length === 0) {
      listContainer.innerHTML = `
        <div class="cart-empty-state">
          <div class="icon">🛒</div>
          <h4 style="color:var(--primary); margin-bottom:0.5rem;">Your Food Basket is Empty</h4>
          <p style="font-size:0.9rem;">Add some mouth-watering Andhra curries, biryani, or meals to get started!</p>
          <button class="btn-primary" style="margin-top:1.25rem; padding:0.6rem 1.5rem;" onclick="closeCartDrawer()">
            Browse Dishes
          </button>
        </div>
      `;
    } else {
      let itemsHtml = STATE.cart.map(item => {
        const isVeg = item.type.toLowerCase() === 'veg';
        return `
          <div class="cart-item-row">
            <span class="diet-indicator ${isVeg ? 'veg' : 'nonveg'}" style="width:14px; height:14px;">
              <span class="dot" style="width:6px; height:6px;"></span>
            </span>
            <div class="cart-item-info">
              <div class="cart-item-name">${item.name}</div>
              <div class="cart-item-price-each">₹${item.price} each</div>
            </div>
            <div class="qty-counter" style="margin-right:0.5rem;">
              <button class="qty-btn" style="width:26px; height:26px; font-size:0.85rem;" onclick="decreaseCartItem('${item.id}')">−</button>
              <span class="qty-number" style="min-width:20px; font-size:0.8rem;">${item.qty}</span>
              <button class="qty-btn" style="width:26px; height:26px; font-size:0.85rem;" onclick="addToCart('${item.id}', false)">+</button>
            </div>
            <div class="cart-item-total">₹${item.price * item.qty}</div>
          </div>
        `;
      }).join('');

      if (subtotal >= threshold) {
        itemsHtml += `
          <div class="free-gift-row">
            <div style="display:flex; align-items:center; gap:0.5rem;">
              <span style="font-size:1.1rem;">🎁</span>
              <div>
                <strong style="color:#166534; font-size:0.9rem;">Complimentary Bobbatlu</strong>
                <div style="font-size:0.75rem; color:#15803d;">Free with orders above ₹500</div>
              </div>
            </div>
            <span class="free-gift-badge">FREE</span>
          </div>
        `;
      }

      listContainer.innerHTML = itemsHtml;
    }
  }

  const subtotalEl = document.getElementById('bill-subtotal');
  if (subtotalEl) subtotalEl.textContent = `₹${subtotal}`;

  const totalEl = document.getElementById('bill-total');
  if (totalEl) totalEl.textContent = `₹${subtotal}`;

  const proceedBtn = document.getElementById('btn-proceed-checkout');
  if (proceedBtn) {
    proceedBtn.disabled = STATE.cart.length === 0;
    proceedBtn.style.opacity = STATE.cart.length === 0 ? '0.5' : '1';
    proceedBtn.style.cursor = STATE.cart.length === 0 ? 'not-allowed' : 'pointer';
  }
}

// Open & Close Drawer
function openCartDrawer() {
  const overlay = document.getElementById('cart-overlay');
  const drawer = document.getElementById('cart-drawer');
  if (!overlay || !drawer) return;

  updateCartUI();
  drawer.classList.add('open');
  overlay.classList.add('open');
}

function closeCartDrawer() {
  const overlay = document.getElementById('cart-overlay');
  const drawer = document.getElementById('cart-drawer');
  if (drawer) drawer.classList.remove('open');
  if (overlay) overlay.classList.remove('open');
}

// Checkout & Payment (Syncs to Supabase Cloud)
function openCheckoutModal() {
  if (STATE.cart.length === 0) {
    showToast('Your basket is empty. Please add dishes first.');
    return;
  }

  closeCartDrawer();
  const modal = document.getElementById('checkout-modal');
  const branch = getActiveBranch();

  const checkoutBranch = document.getElementById('checkout-branch-name');
  if (checkoutBranch) checkoutBranch.textContent = `${branch.city} (${branch.address})`;

  const totalDisplay = document.getElementById('checkout-total-display');
  if (totalDisplay) totalDisplay.textContent = `₹${getCartSubtotal()}`;

  prefillCustomerForms();

  if (modal) modal.classList.add('open');
}

function closeCheckoutModal() {
  const modal = document.getElementById('checkout-modal');
  if (modal) modal.classList.remove('open');
}

function selectPaymentMethod(method) {
  STATE.selectedPayment = method;
  const codCard = document.getElementById('pay-opt-cod');
  const upiCard = document.getElementById('pay-opt-upi');
  const upiBox = document.getElementById('upi-details-box');

  if (method === 'COD') {
    codCard?.classList.add('selected');
    upiCard?.classList.remove('selected');
    if (upiBox) upiBox.style.display = 'none';
  } else {
    upiCard?.classList.add('selected');
    codCard?.classList.remove('selected');
    if (upiBox) upiBox.style.display = 'block';
  }
}

async function handleOrderSubmission(e) {
  e.preventDefault();

  const name = document.getElementById('order-customer-name')?.value.trim();
  const phone = document.getElementById('order-customer-phone')?.value.trim();
  const address = document.getElementById('order-address')?.value.trim();
  const notes = document.getElementById('order-notes')?.value.trim();

  if (!name || !phone || !address) {
    showToast('Please fill in all required fields.');
    return;
  }

  if (phone.length !== 10 || !/^\d{10}$/.test(phone)) {
    showToast('Please enter a valid 10-digit mobile number.');
    return;
  }

  const branch = getActiveBranch();
  const subtotal = getCartSubtotal();
  const qualifiesForFreeSweet = subtotal >= RESTAURANT_DATA.brand.freeSweetOfferThreshold;
  const orderNum = Math.floor(1000 + Math.random() * 9000);
  const orderId = `FD${orderNum}`;

  const newOrder = {
    orderId,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    customer: { name, phone, address, notes },
    branch: { id: branch.id, city: branch.city, address: branch.address, phone: branch.phone },
    items: [...STATE.cart],
    hasFreeSweet: qualifiesForFreeSweet,
    subtotal,
    paymentMethod: STATE.selectedPayment,
    currentStep: 1,
    stepHistory: [
      { step: 1, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    ]
  };

  // 1. Save in local browser storage
  STATE.activeOrder = newOrder;
  localStorage.setItem('thefooder_active_order', JSON.stringify(newOrder));

  // 2. Sync to Supabase Cloud PostgreSQL
  if (typeof saveOrderToSupabase === 'function') {
    saveOrderToSupabase(newOrder).then(res => {
      if (res && res.mode === 'supabase') {
        console.log('Order successfully synced to Supabase PostgreSQL!');
      }
    });
  }

  // Reset cart
  STATE.cart = [];
  saveCart();

  // If user credentials not explicitly set, auto-save customer profile for future visits
  if (!STATE.user) {
    STATE.user = { name, phone, address, email: '' };
    localStorage.setItem('thefooder_user', JSON.stringify(STATE.user));
    updateUserUI();
  }

  closeCheckoutModal();
  playSound('success');
  showToast(`Order #${orderId} placed successfully!`, 'success');

  startTrackingSimulation();
  openTrackOrderModal();
}

// Live Order Tracking
function openTrackOrderModal() {
  if (!STATE.activeOrder) {
    const branch = getActiveBranch();
    STATE.activeOrder = {
      orderId: 'FD4821',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      customer: { name: 'Diner', phone: '9848011223', address: 'MG Road', notes: 'Extra spicy' },
      branch: { id: branch.id, city: branch.city, address: branch.address, phone: branch.phone },
      items: [
        { name: 'Andhra Veg Meals', qty: 1, price: 180, type: 'Veg' },
        { name: 'Gongura Mutton', qty: 1, price: 360, type: 'Non-veg' }
      ],
      hasFreeSweet: true,
      subtotal: 540,
      paymentMethod: 'UPI',
      currentStep: 1,
      stepHistory: [{ step: 1, time: 'Just now' }]
    };
    localStorage.setItem('thefooder_active_order', JSON.stringify(STATE.activeOrder));
    startTrackingSimulation();
  }

  renderTrackingUI();
  const modal = document.getElementById('tracking-modal');
  if (modal) modal.classList.add('open');
}

function closeTrackingModal() {
  const modal = document.getElementById('tracking-modal');
  if (modal) modal.classList.remove('open');
}

function renderTrackingUI() {
  const order = STATE.activeOrder;
  if (!order) return;

  const idDisplay = document.getElementById('track-order-id-display');
  if (idDisplay) idDisplay.textContent = `Order #${order.orderId}`;

  const branchDisplay = document.getElementById('track-branch-name');
  if (branchDisplay) branchDisplay.textContent = `${order.branch.city} (${order.branch.address})`;

  const phoneDisplay = document.getElementById('track-branch-phone');
  if (phoneDisplay) phoneDisplay.textContent = `📞 ${order.branch.phone}`;

  const estDisplay = document.getElementById('track-est-delivery');
  if (estDisplay) {
    if (order.currentStep === 4) {
      estDisplay.textContent = 'Delivered! 🎉';
      estDisplay.style.color = '#15803d';
    } else {
      estDisplay.textContent = '25-35 mins';
      estDisplay.style.color = 'var(--chilli)';
    }
  }

  const stepperContainer = document.getElementById('tracking-stepper-container');
  if (stepperContainer) {
    stepperContainer.innerHTML = RESTAURANT_DATA.orderTrackingSteps.map(stepDef => {
      const isCompleted = stepDef.step < order.currentStep;
      const isActive = stepDef.step === order.currentStep;
      let stateClass = '';
      if (isCompleted) stateClass = 'completed';
      if (isActive) stateClass = 'active';

      let stepTime = '';
      const hist = order.stepHistory.find(h => h.step === stepDef.step);
      if (hist) {
        stepTime = `<div class="step-timestamp">✓ ${hist.time}</div>`;
      } else if (isActive) {
        stepTime = `<div class="step-timestamp" style="color:var(--chilli); font-weight:700;">In Progress...</div>`;
      }

      return `
        <div class="tracker-step-item ${stateClass}">
          <div class="tracker-step-icon">
            ${isCompleted ? '✓' : stepDef.step}
          </div>
          <div class="tracker-step-info">
            <h4>${stepDef.title}</h4>
            <p>${stepDef.meaning}</p>
            ${stepTime}
          </div>
        </div>
      `;
    }).join('');
  }

  const summaryContainer = document.getElementById('tracker-items-summary');
  if (summaryContainer) {
    summaryContainer.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.6rem;">
        <strong style="color:var(--primary); font-size:0.9rem;">Order Details (${order.paymentMethod}):</strong>
        <span style="font-weight:800; color:var(--primary);">Total: ₹${order.subtotal}</span>
      </div>
      <div style="font-size:0.85rem; color:var(--text-muted); display:flex; flex-direction:column; gap:0.25rem;">
        ${order.items.map(it => `<div>• ${it.qty}x ${it.name} (₹${it.price * it.qty})</div>`).join('')}
        ${order.hasFreeSweet ? `<div style="color:#15803d; font-weight:700;">• 1x Complimentary Bobbatlu (FREE)</div>` : ''}
      </div>
    `;
  }
}

function advanceTrackingStep() {
  if (!STATE.activeOrder) return;
  if (STATE.activeOrder.currentStep < 4) {
    STATE.activeOrder.currentStep += 1;
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    STATE.activeOrder.stepHistory.push({ step: STATE.activeOrder.currentStep, time: timeNow });
    localStorage.setItem('thefooder_active_order', JSON.stringify(STATE.activeOrder));
    playSound(STATE.activeOrder.currentStep === 4 ? 'success' : 'add');
    renderTrackingUI();
    
    const curStepObj = RESTAURANT_DATA.orderTrackingSteps.find(s => s.step === STATE.activeOrder.currentStep);
    showToast(`Order status: ${curStepObj.title}`, 'info');
  } else {
    showToast('Order has already been delivered! Enjoy your meal.', 'success');
  }
}

function resetTrackingSimulation() {
  if (!STATE.activeOrder) return;
  STATE.activeOrder.currentStep = 1;
  STATE.activeOrder.stepHistory = [{ step: 1, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }];
  localStorage.setItem('thefooder_active_order', JSON.stringify(STATE.activeOrder));
  renderTrackingUI();
  showToast('Simulation reset to Step 1: Order received');
  startTrackingSimulation();
}

function startTrackingSimulation() {
  if (STATE.trackingTimer) clearInterval(STATE.trackingTimer);

  STATE.trackingTimer = setInterval(() => {
    if (STATE.activeOrder && STATE.activeOrder.currentStep < 4) {
      advanceTrackingStep();
    } else {
      clearInterval(STATE.trackingTimer);
    }
  }, 14000);
}

// Table Booking System (Syncs to Supabase Cloud)
async function handleReservationSubmit(e) {
  e.preventDefault();

  const name = document.getElementById('res-name')?.value.trim();
  const phone = document.getElementById('res-phone')?.value.trim();
  const branchCity = document.getElementById('res-branch')?.value;
  const guests = document.getElementById('res-guests')?.value;
  const date = document.getElementById('res-date')?.value;
  const time = document.getElementById('res-time')?.value;
  const notes = document.getElementById('res-notes')?.value.trim();

  if (!name || !phone || !date || !time) {
    showToast('Please fill in all required booking details.');
    return;
  }

  if (phone.length !== 10 || !/^\d{10}$/.test(phone)) {
    showToast('Please enter a valid 10-digit mobile number.');
    return;
  }

  const resId = `TB-${Math.floor(1000 + Math.random() * 9000)}`;
  const bookingDoc = { bookingId: resId, name, phone, branch: branchCity, guests, date, time, notes, status: 'Pending Confirmation' };

  // Save to Supabase Cloud PostgreSQL
  if (typeof saveBookingToSupabase === 'function') {
    saveBookingToSupabase(bookingDoc).then(res => {
      if (res && res.mode === 'supabase') console.log('Booking stored in Supabase PostgreSQL');
    });
  }

  const idEl = document.getElementById('pass-res-id');
  if (idEl) idEl.textContent = resId;

  const nameEl = document.getElementById('pass-guest-name');
  if (nameEl) nameEl.textContent = name;

  const guestsEl = document.getElementById('pass-guest-count');
  if (guestsEl) guestsEl.textContent = `${guests} Persons`;

  const branchEl = document.getElementById('pass-branch-name');
  if (branchEl) branchEl.textContent = `${branchCity} Branch`;

  const datetimeEl = document.getElementById('pass-datetime');
  if (datetimeEl) datetimeEl.textContent = `${date}, ${time}`;

  const modal = document.getElementById('reservation-success-modal');
  if (modal) modal.classList.add('open');

  playSound('success');
  showToast(`Table request ${resId} submitted! The branch will call you.`, 'success');

  if (!STATE.user) {
    STATE.user = { name, phone, address: '', email: '' };
    localStorage.setItem('thefooder_user', JSON.stringify(STATE.user));
    updateUserUI();
  }

  e.target.reset();
  setupDatePicker();
  prefillCustomerForms();
}

function closeReservationModal() {
  const modal = document.getElementById('reservation-success-modal');
  if (modal) modal.classList.remove('open');
}

function quickBookBranch(branchCity) {
  const branchSelect = document.getElementById('res-branch');
  if (branchSelect) branchSelect.value = branchCity;
  smoothScrollTo('#table-booking');
  showToast(`Selected ${branchCity} for table booking.`);
}

function setupDatePicker() {
  const dateInput = document.getElementById('res-date');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
    dateInput.value = today;
  }
}

// Reviews & Testimonials (Syncs to Supabase Cloud)
function renderReviews() {
  const container = document.getElementById('reviews-grid');
  if (!container) return;

  container.innerHTML = STATE.reviews.map(rev => {
    const stars = '★'.repeat(rev.rating) + '☆'.repeat(5 - rev.rating);
    const initial = rev.guest.charAt(0).toUpperCase();

    return `
      <div class="review-card">
        <div class="review-stars">${stars}</div>
        <p class="review-comment">"${rev.comment}"</p>
        <div class="reviewer-meta">
          <div class="reviewer-avatar">${initial}</div>
          <div class="reviewer-info">
            <h4>${rev.guest}, ${rev.city}</h4>
            <span>Ordered: ${rev.dish} • Verified Diner</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

async function loadCloudReviews() {
  if (typeof fetchReviewsFromSupabase === 'function') {
    const cloudReviews = await fetchReviewsFromSupabase();
    if (Array.isArray(cloudReviews) && cloudReviews.length > 0) {
      STATE.reviews = cloudReviews;
      renderReviews();
    }
  }
}

async function handleReviewSubmit(e) {
  e.preventDefault();

  const name = document.getElementById('review-name')?.value.trim();
  const city = document.getElementById('review-branch')?.value;
  const dish = document.getElementById('review-dish')?.value.trim();
  const rating = parseInt(document.getElementById('review-rating')?.value, 10) || 5;
  const comment = document.getElementById('review-text')?.value.trim();

  if (!name || !dish || !comment) {
    showToast('Please fill in all review fields.');
    return;
  }

  const newReview = {
    id: `r${Date.now()}`,
    guest: name,
    city: city,
    dish: dish,
    rating: rating,
    comment: comment,
    verified: true,
    date: 'Just now'
  };

  STATE.reviews.unshift(newReview);
  localStorage.setItem('thefooder_reviews', JSON.stringify(STATE.reviews));
  renderReviews();

  // Save to Supabase Cloud PostgreSQL
  if (typeof saveReviewToSupabase === 'function') {
    saveReviewToSupabase(newReview).then(res => {
      if (res && res.mode === 'supabase') console.log('Review saved to Supabase PostgreSQL');
    });
  }

  e.target.reset();
  playSound('success');
  showToast('Thank you for sharing your authentic feedback!', 'success');
}

// Navigation & Smooth Scroll
function smoothScrollTo(selector) {
  const el = document.querySelector(selector);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function toggleMobileNav() {
  const navMenu = document.querySelector('.nav-menu');
  if (navMenu) {
    const isVisible = navMenu.style.display === 'flex';
    navMenu.style.display = isVisible ? 'none' : 'flex';
    if (!isVisible) {
      navMenu.style.flexDirection = 'column';
      navMenu.style.position = 'absolute';
      navMenu.style.top = '4.5rem';
      navMenu.style.left = '0';
      navMenu.style.width = '100%';
      navMenu.style.background = '#fff';
      navMenu.style.padding = '1.5rem';
      navMenu.style.borderBottom = '2px solid var(--border-medium)';
      navMenu.style.boxShadow = 'var(--shadow-lg)';
    }
  }
}

// User Authentication & Credentials Management
function openAuthModal(defaultTab = 'profile') {
  const modal = document.getElementById('auth-modal');
  if (!modal) return;

  switchAuthTab(defaultTab);

  const credName = document.getElementById('cred-name');
  const credPhone = document.getElementById('cred-phone');
  const credAddress = document.getElementById('cred-address');
  const credEmail = document.getElementById('cred-email');
  const logoutWrap = document.getElementById('logout-btn-wrap');
  const modalTitle = document.getElementById('auth-modal-title');

  if (STATE.user) {
    if (credName) credName.value = STATE.user.name || '';
    if (credPhone) credPhone.value = STATE.user.phone || '';
    if (credAddress) credAddress.value = STATE.user.address || '';
    if (credEmail) credEmail.value = STATE.user.email || '';
    if (logoutWrap) logoutWrap.style.display = 'block';
    if (modalTitle) modalTitle.textContent = `👤 Profile: ${STATE.user.name.split(' ')[0]}`;
  } else {
    if (credName) credName.value = '';
    if (credPhone) credPhone.value = '';
    if (credAddress) credAddress.value = '';
    if (credEmail) credEmail.value = '';
    if (logoutWrap) logoutWrap.style.display = 'none';
    if (modalTitle) modalTitle.textContent = '👤 Customer Credentials';
  }

  // Prefill cloud key if saved
  const keyInput = document.getElementById('cloud-supabase-key');
  const savedKey = localStorage.getItem('thefooder_supabase_anon_key');
  if (keyInput && savedKey) {
    keyInput.value = savedKey;
  }
  updateSupabaseStatusUI();

  modal.classList.add('open');
}

function closeAuthModal() {
  const modal = document.getElementById('auth-modal');
  if (modal) modal.classList.remove('open');
}

function switchAuthTab(tab) {
  const profileTab = document.getElementById('auth-tab-profile');
  const cloudTab = document.getElementById('auth-tab-cloud');
  const profileSection = document.getElementById('auth-section-profile');
  const cloudSection = document.getElementById('auth-section-cloud');

  if (tab === 'profile') {
    profileTab?.classList.add('active');
    cloudTab?.classList.remove('active');
    if (profileSection) profileSection.style.display = 'block';
    if (cloudSection) cloudSection.style.display = 'none';
  } else {
    cloudTab?.classList.add('active');
    profileTab?.classList.remove('active');
    if (cloudSection) cloudSection.style.display = 'block';
    if (profileSection) profileSection.style.display = 'none';
    updateSupabaseStatusUI();
  }
}

function handleUserCredentialsSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('cred-name')?.value.trim();
  const phone = document.getElementById('cred-phone')?.value.trim();
  const address = document.getElementById('cred-address')?.value.trim();
  const email = document.getElementById('cred-email')?.value.trim();

  if (!name || !phone) {
    showToast('Please provide your name and phone number.');
    return;
  }

  if (phone.length !== 10 || !/^\d{10}$/.test(phone)) {
    showToast('Please enter a valid 10-digit mobile number.');
    return;
  }

  STATE.user = { name, phone, address, email };
  localStorage.setItem('thefooder_user', JSON.stringify(STATE.user));

  updateUserUI();
  prefillCustomerForms();
  closeAuthModal();
  playSound('success');
  showToast(`Welcome, ${name}! Your credentials have been saved.`, 'success');
}

function logoutUser() {
  STATE.user = null;
  localStorage.removeItem('thefooder_user');
  updateUserUI();
  closeAuthModal();
  playSound('remove');
  showToast('You have signed out from this device.');
}

function updateUserUI() {
  const label = document.getElementById('nav-user-label');
  const icon = document.getElementById('nav-user-icon');
  const btn = document.getElementById('nav-user-btn');

  if (STATE.user && STATE.user.name) {
    const firstName = STATE.user.name.split(' ')[0];
    if (label) label.textContent = firstName;
    if (icon) icon.textContent = '👤';
    if (btn) {
      btn.title = `Signed in as ${STATE.user.name} (${STATE.user.phone}) - Click to edit`;
      btn.style.borderColor = 'var(--primary)';
      btn.style.color = 'var(--primary-dark)';
    }
  } else {
    if (label) label.textContent = 'Sign In';
    if (icon) icon.textContent = '👤';
    if (btn) {
      btn.title = 'Sign In / Customer Profile';
      btn.style.borderColor = 'var(--border-medium)';
      btn.style.color = 'var(--primary)';
    }
  }
}

function prefillCustomerForms() {
  if (!STATE.user) return;

  const orderName = document.getElementById('order-customer-name');
  const orderPhone = document.getElementById('order-customer-phone');
  const orderAddress = document.getElementById('order-address');

  if (orderName && !orderName.value) orderName.value = STATE.user.name || '';
  if (orderPhone && !orderPhone.value) orderPhone.value = STATE.user.phone || '';
  if (orderAddress && !orderAddress.value) orderAddress.value = STATE.user.address || '';

  const resName = document.getElementById('res-name');
  const resPhone = document.getElementById('res-phone');

  if (resName && !resName.value) resName.value = STATE.user.name || '';
  if (resPhone && !resPhone.value) resPhone.value = STATE.user.phone || '';

  const revName = document.getElementById('review-name');
  if (revName && !revName.value) revName.value = STATE.user.name || '';
}

// Supabase Cloud Credentials UI handlers
function saveSupabaseCredentials() {
  const keyInput = document.getElementById('cloud-supabase-key');
  const key = keyInput ? keyInput.value.trim() : '';

  if (!key) {
    showToast('Please paste your Supabase anon public API key.');
    return;
  }

  if (typeof initSupabase === 'function') {
    const connected = initSupabase(key);
    updateSupabaseStatusUI();
    if (connected) {
      playSound('success');
      showToast('⚡ Supabase Cloud Connected successfully!', 'success');
      if (typeof loadCloudReviews === 'function') loadCloudReviews();
    } else {
      showToast('Supabase key saved into browser settings.', 'info');
    }
  }
}

function clearSupabaseCredentials() {
  localStorage.removeItem('thefooder_supabase_anon_key');
  const keyInput = document.getElementById('cloud-supabase-key');
  if (keyInput) keyInput.value = '';
  if (typeof initSupabase === 'function') {
    initSupabase('YOUR_SUPABASE_ANON_KEY');
  }
  updateSupabaseStatusUI();
  showToast('Supabase credentials reset to local storage fallback.');
}

function updateSupabaseStatusUI() {
  const dot = document.getElementById('supabase-status-dot');
  const text = document.getElementById('supabase-status-text');
  if (!dot || !text) return;

  const connected = typeof isSupabaseConnected === 'function' && isSupabaseConnected();
  if (connected) {
    dot.style.background = '#22c55e';
    text.textContent = 'Cloud status: Connected to Supabase PostgreSQL (Live Sync Active)';
    text.style.color = '#15803d';
    text.style.fontWeight = '700';
  } else {
    dot.style.background = '#f59e0b';
    text.textContent = 'Cloud status: Local storage fallback active (Offline-first)';
    text.style.color = '#b45309';
    text.style.fontWeight = '500';
  }
}

// Initialization on DOM Loaded
document.addEventListener('DOMContentLoaded', () => {
  updateBranchUI();
  renderCategoryTabs();
  renderMenuItems();
  renderBranchCards();
  renderBranchPickerList();
  renderReviews();
  updateCartUI();
  setupDatePicker();
  loadCloudReviews();
  updateUserUI();
  prefillCustomerForms();

  const soundBtn = document.getElementById('sound-toggle-btn');
  if (soundBtn) {
    soundBtn.innerHTML = STATE.soundEnabled ? '🔔' : '🔕';
  }

  if (STATE.activeOrder && STATE.activeOrder.currentStep < 4) {
    startTrackingSimulation();
  }
});
