const productsContainer = document.querySelector('#products-container');
const emptyMsg = document.querySelector('#empty-msg');
const addProductForm = document.querySelector('#add-product-form');
const updateProductForm = document.querySelector('#update-product-form');
const updateProductId = document.querySelector('#update-id');
const updateProductName = document.querySelector('#update-name');
const updateProductDescription = document.querySelector('#update-description');
const updateProductPrice = document.querySelector('#update-price');
const modalOverlay = document.querySelector('#modal-overlay');
const modalClose = document.querySelector('#modal-close');
const modalCancel = document.querySelector('#modal-cancel');

const API_URL = 'http://COLOQUE_O_IP_DO_BACKEND_AQUI:3000';

// ── Buscar e renderizar todos os produtos ─────────────────────────────────────
async function fetchProducts() {
  try {
    const response = await fetch(`${API_URL}/products`);
    const products = await response.json();

    productsContainer.innerHTML = '';

    if (!products || products.length === 0) {
      productsContainer.innerHTML = '<p class="empty-msg">Nenhum produto cadastrado.</p>';
      return;
    }

    products.forEach(product => {
      const card = document.createElement('div');
      card.className = 'product-card';
      card.innerHTML = `
        <div class="product-info">
          <span class="product-name">${product.name}</span>
          <span class="product-desc">${product.description || '—'}</span>
          <span class="product-price">R$ ${parseFloat(product.price).toFixed(2)}</span>
        </div>
        <div class="product-actions">
          <button class="btn btn-primary btn-sm" onclick="openEditModal(${product.id}, '${escapeStr(product.name)}', '${escapeStr(product.description || '')}', ${product.price})">
            ✏️ Editar
          </button>
          <button class="btn btn-danger btn-sm" onclick="confirmDelete(${product.id}, '${escapeStr(product.name)}')">
            🗑️ Apagar
          </button>
        </div>
      `;
      productsContainer.appendChild(card);
    });
  } catch (err) {
    productsContainer.innerHTML = '<p class="empty-msg error">Erro ao carregar produtos. O servidor está rodando?</p>';
    console.error('Erro ao buscar produtos:', err);
  }
}

// Escapa aspas para não quebrar o onclick inline
function escapeStr(str) {
  return String(str).replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

// ── Adicionar produto ─────────────────────────────────────────────────────────
addProductForm.addEventListener('submit', async event => {
  event.preventDefault();
  const name = addProductForm.elements['name'].value.trim();
  const description = addProductForm.elements['description'].value.trim();
  const price = addProductForm.elements['price'].value;

  const btn = addProductForm.querySelector('button[type="submit"]');
  btn.disabled = true;
  btn.textContent = 'Adicionando...';

  try {
    await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description, price }),
    });
    addProductForm.reset();
    await fetchProducts();
  } catch (err) {
    alert('Erro ao adicionar produto.');
    console.error(err);
  } finally {
    btn.disabled = false;
    btn.textContent = '＋ Adicionar';
  }
});

// ── Modal de edição ───────────────────────────────────────────────────────────
function openEditModal(id, name, description, price) {
  updateProductId.value = id;
  updateProductName.value = name;
  updateProductDescription.value = description;
  updateProductPrice.value = price;
  modalOverlay.classList.remove('hidden');
}

function closeModal() {
  modalOverlay.classList.add('hidden');
  updateProductForm.reset();
}

modalClose.addEventListener('click', closeModal);
modalCancel.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', e => {
  if (e.target === modalOverlay) closeModal();
});

// ── Salvar edição ─────────────────────────────────────────────────────────────
updateProductForm.addEventListener('submit', async event => {
  event.preventDefault();
  const id = updateProductId.value;
  const name = updateProductName.value.trim();
  const description = updateProductDescription.value.trim();
  const price = updateProductPrice.value;

  const btn = updateProductForm.querySelector('button[type="submit"]');
  btn.disabled = true;
  btn.textContent = 'Salvando...';

  try {
    await fetch(`${API_URL}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description, price }),
    });
    closeModal();
    await fetchProducts();
  } catch (err) {
    alert('Erro ao atualizar produto.');
    console.error(err);
  } finally {
    btn.disabled = false;
    btn.textContent = '💾 Salvar';
  }
});

// ── Deletar produto ───────────────────────────────────────────────────────────
async function confirmDelete(id, name) {
  if (!confirm(`Deseja apagar o produto "${name}"?`)) return;

  try {
    await fetch(`${API_URL}/products/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });
    await fetchProducts();
  } catch (err) {
    alert('Erro ao apagar produto.');
    console.error(err);
  }
}

// ── Buscar produto por ID ─────────────────────────────────────────────────────
const searchIdForm = document.querySelector('#search-id-form');
const searchResult = document.querySelector('#search-result');

searchIdForm.addEventListener('submit', async event => {
  event.preventDefault();
  const id = document.querySelector('#search-id').value;
  searchResult.innerHTML = '<p class="search-loading">Buscando...</p>';

  try {
    const response = await fetch(`${API_URL}/products/${id}`);
    const data = await response.json();

    if (!data || data.length === 0) {
      searchResult.innerHTML = `<p class="empty-msg">Nenhum produto encontrado com ID ${id}.</p>`;
      return;
    }

    const product = Array.isArray(data) ? data[0] : data;
    searchResult.innerHTML = `
      <div class="search-card">
        <div class="search-field"><span class="search-label">ID</span><span>${product.id}</span></div>
        <div class="search-field"><span class="search-label">Nome</span><span>${product.name}</span></div>
        <div class="search-field"><span class="search-label">Descrição</span><span>${product.description || '—'}</span></div>
        <div class="search-field"><span class="search-label">Preço</span><span class="product-price">R$ ${parseFloat(product.price).toFixed(2)}</span></div>
      </div>
    `;
  } catch (err) {
    searchResult.innerHTML = '<p class="empty-msg error">Erro ao buscar produto.</p>';
    console.error(err);
  }
});

// ── Carrega ao abrir a página ─────────────────────────────────────────────────
fetchProducts();
