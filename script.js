document.addEventListener('DOMContentLoaded', () => {

  // ---------- Refs ----------
  const productList = document.getElementById('productList');
  const searchInput = document.getElementById('searchInput');
  const sortSelect = document.getElementById('sortSelect');
  const paginationControls = document.getElementById('paginationControls');
  
  const loginModal = document.getElementById('loginModal');
  const btnOpenLogin = document.getElementById('btnOpenLogin');
  const btnLogout = document.getElementById('btnLogout');
  const loginClose = document.getElementById('loginClose');
  const loginSubmit = document.getElementById('loginSubmit');
  const loginUser = document.getElementById('loginUser');
  const loginPass = document.getElementById('loginPass');
  const loginGreeting = document.getElementById('loginGreeting');
  
  const productModal = document.getElementById('productModal');
  const pdClose = document.getElementById('pdClose');
  const pdImage = document.getElementById('pdImage');
  const pdTitle = document.getElementById('pdTitle');
  const pdDesc = document.getElementById('pdDesc');
  const pdPrice = document.getElementById('pdPrice');
  const pdQty = document.getElementById('pdQty');
  const pdAdd = document.getElementById('pdAdd');
  
  const cartDrawer = document.getElementById('cartDrawer');
  const btnOpenCart = document.getElementById('btnOpenCart');
  const cartClose = document.getElementById('cartClose');
  const cartItemsEl = document.getElementById('cartItems');
  const cartTotalEl = document.getElementById('cartTotal');
  const cartCount = document.getElementById('cartCount');
  const checkoutBtn = document.getElementById('checkoutBtn');
  
  const msgContainer = document.getElementById('msgContainer');

  let products = [];
  let pins = [];
  let cart = JSON.parse(localStorage.getItem('prime_cart') || '[]');
  let currentUser = localStorage.getItem('prime_user') || null;

  let currentPage = 1;
  const itemsPerPage = 12;  


  // ---------- Datos de productos ----------
  const productNames = [
    "LA Lakers Plana","NY Yankees Curve","Chicago Bulls Retro","Miami Heat Snapback",
    "Boston Red Sox Classic","Golden Warriors Low","Brooklyn Nets Clean","NY Mets Era",
    "San Francisco Giants OG","San Diego Padres Fresh","Chicago Cubs Vintage","Philadelphia Phillies Pro",
    "Atlanta Braves Icon","Seattle Mariners Wave","Dallas Mavericks Court","Phoenix Suns Flame",
    "Los Angeles Cap Co","Toronto Raptors Edge","Cleveland Shadows","Detroit Caps",
    "Houston Hustle","Orlando Vibes","Portland Core","Memphis Street",
    "Washington Elite","Milwaukee Heritage","Indiana Prime","Utah Flow",
    "Charlotte Peak","Sacramento Court","Tampa Bay Retro","Minnesota North",
    "Kansas City Classic","New Orleans Vibe","San Antonio Turf","Oklahoma Pulse",
    "Vegas Night","Columbus Core","Nashville Wave","St Louis Prime",
    "Miami Wave Extra","Boston Slam","Dallas Hustle","Chicago Flow",
    "KOF Cap","LA Lakers Cap","Red Sox Icon Food","LA Street Blue"
  ];

  for(let i = 1; i <= 48; i++){
    const name = productNames[i-1] || `Gorra ${i}`;
    products.push({
      id: i,
      name,
      price: Number((18 + (i % 12) + (i % 3) * 2).toFixed(2)),
      img: `assets/img/gorra${i}.jpg`,
      desc: `Diseño ${name} — Street premium. Edición ${i}.`,
      popular: i <= 12,
      new: i > 30
    });
  }

  // ---------- Pines ----------
  const pinNames = [
    "Pin Creeper","Pin Gato","Pin Perro","Pin Flame",
    "Pin Ryu","Pin Lakers","Pin Duck Hunt","Pin Kirby"
  ];

  for(let i = 1; i <= 8; i++){
    const name = pinNames[i-1];
    pins.push({
      id: 100 + i,
      name,
      price: Number((5 + i).toFixed(2)),
      img: `assets/img/pin${i}.jpg`,
      desc: `Pin metálico ${name} para personalizar tus gorras.`
    });
  }

  // ---------- Mensajes ----------
  function showMessage(text, isError=false){
    if(!msgContainer.style.cssText){
      msgContainer.style.cssText=`position: fixed; top: 10px; right: 10px; z-index: 1000; padding:10px 15px; border-radius:8px; box-shadow:0 8px 30px rgba(0,0,0,0.12); color:white; transition: opacity .3s, transform .3s; transform: translateY(-50px); opacity:0; max-width:90%;`;
    }
    msgContainer.textContent = text;
    msgContainer.style.background = isError ? '#cc0000' : '#111';
    msgContainer.style.transform = 'translateY(0)';
    msgContainer.style.opacity = '1';
    clearTimeout(msgContainer.timer);
    msgContainer.timer = setTimeout(()=>{
      msgContainer.style.transform = 'translateY(-50px)';
      msgContainer.style.opacity = '0';
    },3000);
  }

  // ---------- Login ----------
  function updateLoginUI(){
    if(currentUser){
      btnOpenLogin.style.display = 'none';
      btnLogout.style.display = 'inline-block';
      loginGreeting.textContent = `Hola, ${currentUser}`;
      loginGreeting.style.display = 'inline-block';
    } else {
      btnOpenLogin.style.display = 'inline-block';
      btnLogout.style.display = 'none';
      loginGreeting.style.display = 'none';
      cart = [];
      localStorage.removeItem('prime_cart');
      renderCart();
    }
  }

  btnOpenLogin.addEventListener('click', ()=>loginModal.classList.add('open'));
  loginClose.addEventListener('click', ()=>loginModal.classList.remove('open'));
  btnLogout.addEventListener('click', ()=>{
    currentUser = null;
    localStorage.removeItem('prime_user');
    updateLoginUI();
    showMessage('Has cerrado sesión');
  });

  loginSubmit.addEventListener('click', ()=>{
    const user = loginUser.value.trim();
    const pass = loginPass.value.trim();
    if(user === 'adminprime' && pass === 'adminprime123'){
      currentUser = user;
      localStorage.setItem('prime_user', user);
      updateLoginUI();
      loginModal.classList.remove('open');
      showMessage('Bienvenido adminprime ✅');
      loginUser.value = '';
      loginPass.value = '';
    } else {
      showMessage('Usuario o contraseña incorrectos', true);
    }
  });

  // ---------- Abrir/Cerrar modales ----------
  const openModal = el => el.classList.add('open');
  const closeModal = el => el.classList.remove('open');
  pdClose.addEventListener('click', ()=>closeModal(productModal));

  // ---------- Instagram ----------
  document.getElementById('btnInstagram').addEventListener('click', e=>{
    e.preventDefault();
    window.open('https://www.instagram.com/prime_caps_sv/','_blank');
  });

  // ---------- Render productos ----------
  function renderProducts(list){
    productList.innerHTML = '';
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageItems = list.slice(start,end);
    pageItems.forEach(p=>{
      const card = document.createElement('article');
      card.className = 'product-card';
      card.innerHTML = `
        <img src="${p.img}" alt="${p.name}" />
        <h3>${p.name}</h3>
        <p>$${p.price.toFixed(2)}</p>
        <div class="card-actions">
          <button class="btn view" data-id="${p.id}">Ver</button>
          <button class="btn add" data-id="${p.id}">Agregar</button>
        </div>`;
      productList.appendChild(card);
    });
    if(pageItems.length === 0) productList.innerHTML='<p style="grid-column:1/-1;text-align:center;color:#666;">No se encontraron productos.</p>';
    renderPagination(list);
  }

  function renderPagination(list){
    const totalPages = Math.ceil(list.length / itemsPerPage);
    paginationControls.innerHTML = '';
    if(totalPages <= 1) return;

    const createBtn = (text, page, cls='') => {
        const btn = document.createElement('button');
        btn.className = `page-btn ${cls}`;
        btn.textContent = text;
        btn.addEventListener('click', () => {
            currentPage = page;

            // Animación al cambiar de página
            productList.style.opacity = 0;
            setTimeout(() => {
                renderProducts(filteredList); // renderiza productos filtrados
                productList.scrollIntoView({ behavior: 'smooth', block: 'start' }); // va a la primera fila
                productList.style.opacity = 1;
            }, 150);

            renderPagination(filteredList); // refresca la paginación
        });
        return btn;
    };

    paginationControls.appendChild(createBtn('«', Math.max(1,currentPage-1),'arrow'));
    for(let i = 1; i <= totalPages; i++){
        const btn = createBtn(i, i, i === currentPage ? 'active' : '');
        paginationControls.appendChild(btn);
    }
    paginationControls.appendChild(createBtn('»', Math.min(totalPages,totalPages),'arrow'));
}


  // ---------- Filtrado y orden ----------
  let filteredList = products.concat(pins);

  searchInput.addEventListener('input', ()=>{
    currentPage = 1;
    const term = searchInput.value.toLowerCase();
    filteredList = products.concat(pins).filter(p=>p.name.toLowerCase().includes(term));
    applySort();
    renderProducts(filteredList);
  });

  sortSelect.addEventListener('change', ()=>{
    currentPage = 1;
    applySort();
    renderProducts(filteredList);
  });

  function applySort(){
    const val = sortSelect.value;
    if(val === 'price-asc') filteredList.sort((a,b)=>a.price-b.price);
    else if(val === 'price-desc') filteredList.sort((a,b)=>b.price-a.price);
    else if(val === 'popular') filteredList.sort((a,b)=>b.popular-a.popular);
    else if(val === 'new') filteredList.sort((a,b)=>b.new-a.new);
  }

  // ---------- Carrito ----------
  function openCartDrawer(){
    if(!currentUser){ showMessage('Debes iniciar sesión para ver el carrito',true); return; }
    cartDrawer.classList.add('open');
  }
  function closeCartDrawer(){ cartDrawer.classList.remove('open'); }

  btnOpenCart.addEventListener('click', openCartDrawer);
  cartClose.addEventListener('click', closeCartDrawer);

  function addToCart(id, qty){
    if(!currentUser){ showMessage('Debes iniciar sesión para añadir al carrito',true); return; }
    const p = products.concat(pins).find(x=>x.id===id);
    if(!p) return;
    const existing = cart.find(x=>x.id===id);
    if(existing) existing.qty += qty;
    else cart.push({id, qty});
    localStorage.setItem('prime_cart', JSON.stringify(cart));
    renderCart();
    showMessage(`${qty}x ${p.name} agregado al carrito`);
  }

  function renderCart(){
    cartItemsEl.innerHTML = '';
    let total = 0, count = 0;
    cart.forEach(item=>{
        const p = products.concat(pins).find(x=>x.id===item.id);
        if(!p) return;
        total += p.price*item.qty; 
        count += item.qty;

        const div = document.createElement('div'); 
        div.className='cart-item';
        div.innerHTML = `
            <img src="${p.img}" alt="${p.name}" />
            <div>
                <strong>${p.name}</strong><br>
                $${p.price.toFixed(2)} x ${item.qty}
            </div>
            <button class="btn outline remove" data-id="${p.id}">✕</button>`;

        const removeBtn = div.querySelector('.remove');
        removeBtn.style.fontSize = '18px';   // tamaño de la X
        removeBtn.style.lineHeight = '1';    // centrado vertical
        removeBtn.style.padding = '4px 8px';
        removeBtn.addEventListener('click', ()=>{
            cart = cart.filter(x=>x.id !== p.id);
            localStorage.setItem('prime_cart', JSON.stringify(cart));
            renderCart();
        });

        cartItemsEl.appendChild(div);
    });

    cartTotalEl.textContent = total.toFixed(2);
    cartCount.textContent = count;
}


  checkoutBtn.addEventListener('click', ()=>{
    cart = []; localStorage.removeItem('prime_cart'); renderCart();
    showMessage('Compra simulada realizada ✅'); closeCartDrawer();
  });

  // ---------- Product modal ----------
  productList.addEventListener('click', e=>{
    if(e.target.matches('.view') || e.target.matches('.add')){
      const id = parseInt(e.target.dataset.id);
      const p = products.concat(pins).find(x=>x.id===id);
      if(!p) return;
      if(e.target.matches('.view')){
        pdImage.src = p.img; pdTitle.textContent = p.name;
        pdDesc.textContent = p.desc; pdPrice.textContent = `$${p.price.toFixed(2)}`;
        pdQty.value = 1; pdAdd.dataset.id = p.id;
        openModal(productModal);
      } else addToCart(id,1);
    }
  });

  pdAdd.addEventListener('click', ()=>{
    const id = parseInt(pdAdd.dataset.id);
    const qty = parseInt(pdQty.value) || 1;
    addToCart(id, qty); closeModal(productModal);
  });

  // ---------- Inicial ----------
  filteredList = products.concat(pins);
  applySort();
  updateLoginUI();
  renderCart();
  renderProducts(filteredList);

});
