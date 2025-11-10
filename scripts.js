/* scripts.js - product data, UI logic, cart (localStorage) */
document.addEventListener('DOMContentLoaded', () => {
  // sample product data - replace with your real images/prices/descriptions
  const products = [
    { id: 'p1', title: 'Pearl Drop Necklace', price: 599, category:'necklace', img:'necklace.jpeg', desc:'Elegant freshwater pearl on a dainty chain.'},
    { id: 'p2', title: 'Gold Stud Earrings', price: 299, category:'earrings', img:'earings.jpeg', desc:'Classic studs finished in 18K vermeil.'},
    
    { id: 'p3', title: 'Minimal Bar Pendant', price: 999, category:' Big necklace', img:'Big necklCE.jpeg', desc:'Everyday minimalist pendant.'},
    
  ];

  // cache DOM
  const productsGrid = document.getElementById('productsGrid');
  const modal = document.getElementById('modal');
  const modalContent = document.getElementById('modalContent');
  const closeModal = document.getElementById('closeModal');
  const cartBtn = document.getElementById('cartBtn');
  const cartPanel = document.getElementById('cartPanel');
  const closeCart = document.getElementById('closeCart');
  const cartCountEl = document.getElementById('cartCount');
  const cartItemsEl = document.getElementById('cartItems');
  const cartTotalEl = document.getElementById('cartTotal');
  const filterCategory = document.getElementById('filterCategory');
  const sortBy = document.getElementById('sortBy');
  const checkoutBtn = document.getElementById('checkoutBtn');
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileNav = document.getElementById('mobileNav');

  // initialize UI
  document.getElementById('year').textContent = new Date().getFullYear();

  // CART helpers
  const CART_KEY = 'rij_cart_v1';
  function loadCart() {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY)) || {};
    } catch {
      return {};
    }
  }
  function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    renderCart();
  }
  function addToCart(productId, qty = 1) {
    const cart = loadCart();
    cart[productId] = (cart[productId] || 0) + qty;
    saveCart(cart);
  }
  function removeFromCart(productId) {
    const cart = loadCart();
    delete cart[productId];
    saveCart(cart);
  }
  function setCartQty(productId, qty) {
    const cart = loadCart();
    if (qty <= 0) delete cart[productId];
    else cart[productId] = qty;
    saveCart(cart);
  }
  function cartCount() {
    const cart = loadCart();
    return Object.values(cart).reduce((s,n) => s + n, 0);
  }
  function cartSubtotal() {
    const cart = loadCart();
    let total = 0;
    for (const id in cart) {
      const prod = products.find(p => p.id === id);
      if (prod) total += prod.price * cart[id];
    }
    return total;
  }

  // Render products according to filters
  function renderProducts(list) {
    productsGrid.innerHTML = '';
    list.forEach(p => {
      const card = document.createElement('article');
      card.className = 'card';
      card.innerHTML = `
        <img loading="lazy" src="${p.img}" alt="${escapeHtml(p.title)}">
        <h3>${escapeHtml(p.title)}</h3>
        <p class="muted">${escapeHtml(p.desc)}</p>
        <div class="price">₹${formatPrice(p.price)}</div>
        <div class="actions">
          <button class="btn add-js" data-id="${p.id}">Add to cart</button>
          <button class="btn-outline view-js" data-id="${p.id}">Quick view</button>
        </div>
      `;
      productsGrid.appendChild(card);
    });
  }

  // initial render
  renderProducts(products);

  // event delegation for product buttons
  productsGrid.addEventListener('click', (e) => {
    const target = e.target;
    if (target.matches('.add-js')) {
      const id = target.dataset.id;
      addToCart(id, 1);
    } else if (target.matches('.view-js')) {
      const id = target.dataset.id;
      openQuickView(id);
    }
  });

  // Quick view / modal content
  function openQuickView(id) {
    const p = products.find(x => x.id === id);
    if (!p) return;
    modalContent.innerHTML = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
        <div><img src="${p.img}" alt="${escapeHtml(p.title)}" style="width:100%;border-radius:10px"></div>
        <div>
          <h2 style="margin-top:0">${escapeHtml(p.title)}</h2>
          <p style="color:var(--muted)">${escapeHtml(p.desc)}</p>
          <p style="font-weight:700;font-size:1.2rem">₹${formatPrice(p.price)}</p>
          <div style="margin-top:12px;display:flex;gap:8px">
            <button id="quickAdd" class="btn">Add to cart</button>
            <button id="closeQuick" class="btn-outline">Close</button>
          </div>
        </div>
      </div>
    `;
    showModal();
    document.getElementById('quickAdd').addEventListener('click', () => {
      addToCart(p.id, 1);
      hideModal();
    });
    document.getElementById('closeQuick').addEventListener('click', hideModal);
  }
  function showModal() {
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');
  }
  function hideModal() {
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
  }
  closeModal.addEventListener('click', hideModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) hideModal();
  });

  // CART UI
  cartBtn.addEventListener('click', () => {
    cartPanel.classList.toggle('hidden');
    cartPanel.setAttribute('aria-hidden', cartPanel.classList.contains('hidden'));
    renderCart();
  });
  closeCart.addEventListener('click', () => { cartPanel.classList.add('hidden'); });

  function renderCart() {
    const cart = loadCart();
    cartItemsEl.innerHTML = '';
    const ids = Object.keys(cart);
    if (ids.length === 0) {
      cartItemsEl.innerHTML = '<p class="muted">Your cart is empty.</p>';
      cartCountEl.textContent = '0';
      cartTotalEl.textContent = '₹0';
      return;
    }
    ids.forEach(id => {
      const prod = products.find(p => p.id === id);
      const qty = cart[id];
      if (!prod) return;
      const row = document.createElement('div');
      row.style.display = 'flex';
      row.style.gap = '10px';
      row.style.marginBottom = '12px';
      row.innerHTML = `
        <img src="${prod.img}" alt="${escapeHtml(prod.title)}" style="width:72px;height:72px;object-fit:cover;border-radius:8px">
        <div style="flex:1">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <strong>${escapeHtml(prod.title)}</strong>
            <div>₹${formatPrice(prod.price * qty)}</div>
          </div>
          <div style="margin-top:6px;display:flex;gap:8px;align-items:center">
            <button class="qty-minus" data-id="${id}">−</button>
            <input class="qty-input" data-id="${id}" value="${qty}" style="width:44px;text-align:center;padding:6px;border-radius:6px;border:1px solid #eee">
            <button class="qty-plus" data-id="${id}">+</button>
            <button class="remove-item" data-id="${id}" style="margin-left:auto;color:#c33;border:0;background:none;cursor:pointer">Remove</button>
          </div>
        </div>
      `;
      cartItemsEl.appendChild(row);
    });
    cartCountEl.textContent = cartCount();
    cartTotalEl.textContent = '₹' + formatPrice(cartSubtotal());
  }
  function openCatalog() {
  document.getElementById("catalogModal").style.display = "block";
}

function closeCatalog() {
  document.getElementById("catalogModal").style.display = "none";
}

// Close if click outside the box
window.onclick = function(e) {
  let modal = document.getElementById("catalogModal");
  if (e.target == modal) {
    modal.style.display = "none";
  }
}


  // quantity buttons on cart items
  cartItemsEl.addEventListener('click', (e) => {
    const id = e.target.dataset.id;
    if (!id) return;
    if (e.target.matches('.qty-plus')) {
      setCartQty(id, loadCart()[id] + 1);
    } else if (e.target.matches('.qty-minus')) {
      setCartQty(id, loadCart()[id] - 1);
    } else if (e.target.matches('.remove-item')) {
      removeFromCart(id);
    }
  });

  // allow manual qty edit
  cartItemsEl.addEventListener('change', (e) => {
    if (e.target.matches('.qty-input')) {
      const id = e.target.dataset.id;
      const v = parseInt(e.target.value, 10) || 0;
      setCartQty(id, v);
    }
  });

  // checkout (demo)
  checkoutBtn.addEventListener('click', () => {
    if (cartCount() === 0) {
      alert('Your cart is empty.');
      return;
    }
    // demo checkout flow
    alert('Checkout demo — integrate payment gateway or contact form.');
    // empty cart
    saveCart({});
  });

  // filters
  function applyFilters() {
    let list = [...products];
    const cat = filterCategory.value;
    const sort = sortBy.value;
    if (cat !== 'all') list = list.filter(p => p.category === cat);
    if (sort === 'price-asc') list.sort((a,b)=>a.price - b.price);
    else if (sort === 'price-desc') list.sort((a,b)=>b.price - a.price);
    renderProducts(list);
  }
  filterCategory.addEventListener('change', applyFilters);
  sortBy.addEventListener('change', applyFilters);

  // mobile nav toggle
  mobileMenuBtn.addEventListener('click', () => {
    mobileNav.classList.toggle('hidden');
  });

  // contact form demo
  const contactForm = document.getElementById('contactForm');
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Thanks! We received your message — we will reply soon.');
    contactForm.reset();
  });

  // initialize cart render on load
  renderCart();

  // utility helpers
  function formatPrice(num) {
    return Number(num).toLocaleString('en-IN');
  }
  function escapeHtml(s){
    return String(s).replace(/[&<>"']/g, (m) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  }
});
function openCatalog() {
  document.getElementById("catalogModal").style.display = "block";
}

function closeCatalog() {
  document.getElementById("catalogModal").style.display = "none";
}

window.onclick = function(event) {
  let modal = document.getElementById("catalogModal");
  if (event.target == modal) {
    modal.style.display = "none";
  }
}

