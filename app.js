// ==========================
// ML Refeições - V2 Delivery
// ==========================



// ===== Supabase =====

const { createClient } = supabase;

const SUPABASE_URL = "https://ihauhhokrwfcuaxzyekj.supabase.co";
const SUPABASE_KEY = "sb_publishable_Ub3qFInK-frmOKrn7x7TFQ_4l4YPo85";

const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testConnection() {
  const { data, error } = await supabaseClient.from("stores")
    .select("*");

  if (error) {
    console.error("Erro Supabase:", error);
  } else {
    console.log("Conectado ao Supabase:", data);
  }
}

testConnection();

// 1 loja (por enquanto). Depois dá pra virar multi-loja com ?store=
const STORE_ID = "COLE_AQUI_O_UUID_DA_LOJA";

// -------- helpers ----------
const moneyBR = (v) => (Number(v) || 0).toLocaleString("pt-BR", { style:"currency", currency:"BRL" });
const onlyDigits = (s) => String(s || "").replace(/\D+/g, "");
const escapeHtml = (s) => String(s || "")
  .replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;")
  .replaceAll('"',"&quot;").replaceAll("'","&#039;");

function formatPhoneBR(s){
  const d = onlyDigits(s);
  if (d.length === 11) return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`;
  return s;
}

function nowBR(){
  const d = new Date();
  const pad = (n)=>String(n).padStart(2,"0");
  const dd = pad(d.getDate());
  const mm = pad(d.getMonth()+1);
  const yyyy = d.getFullYear();
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  return { date:`${dd}/${mm}/${yyyy}`, time:`${hh}:${mi}`, isoDate:`${yyyy}-${mm}-${dd}` };
}

const toast = (msg) => {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.classList.remove("hidden");
  clearTimeout(window.__t);
  window.__t = setTimeout(() => el.classList.add("hidden"), 2300);
};

const ls = {
  get(k, fallback){
    try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fallback; }
    catch { return fallback; }
  },
  set(k, v){ localStorage.setItem(k, JSON.stringify(v)); }
};

// -------- defaults ----------
const DEFAULT_CONFIG = {
  storeName: "ML Refeições",
  whatsappReceiver: "91993388521", // teste
  pix: { key: "91993388521", bank: "Banco Inter", name: "Adriano Costa" },
  delivery: { mode: "FREE", value: 0 }, // FREE | FIXED
  minOrder: { enabled: false, value: 0 },
  storeOpen: true
};

// Seu cardápio (com emojis por categoria só pra dar cara de delivery)
const DEFAULT_MENU = [
  { id:"c1", cat:"Carnes", emoji:"🥩", name:"Bife Acebolado", price:16, active:true },
  { id:"c2", cat:"Carnes", emoji:"🥩", name:"Carne de Sol com Purê", price:22, active:true },
  { id:"c3", cat:"Carnes", emoji:"🥩", name:"Cupim na Chapa", price:16, active:true },
  { id:"c4", cat:"Carnes", emoji:"🥩", name:"Picadinho com Ovo", price:16, active:true },
  { id:"c5", cat:"Carnes", emoji:"🥩", name:"Isca de Alcatra", price:18, active:true },
  { id:"c6", cat:"Carnes", emoji:"🥩", name:"Carne assada de Panela", price:18, active:true },
  { id:"c7", cat:"Carnes", emoji:"🥩", name:"Chapa Mista", price:20, active:true },
  { id:"c8", cat:"Carnes", emoji:"🥩", name:"Guisado de Charque", price:18, active:true },
  { id:"c9", cat:"Carnes", emoji:"🥩", name:"Costelinha Guisada", price:18, active:true },
  { id:"c10", cat:"Carnes", emoji:"🥩", name:"Bisteca na Chapa", price:18, active:true },
  { id:"c11", cat:"Carnes", emoji:"🥩", name:"Picanha na Chapa", price:25, active:true },
  { id:"c12", cat:"Carnes", emoji:"🥩", name:"Bife com Fritas", price:20, active:true },
  { id:"c13", cat:"Carnes", emoji:"🥩", name:"Bife com Purê", price:20, active:true },

  { id:"a1", cat:"Aves", emoji:"🍗", name:"Frango com Calabresa", price:15, active:true },
  { id:"a2", cat:"Aves", emoji:"🍗", name:"Frango Acebolado", price:15, active:true },
  { id:"a3", cat:"Aves", emoji:"🍗", name:"Frango na Chapa", price:20, active:true },
  { id:"a4", cat:"Aves", emoji:"🍗", name:"Frango Empanado", price:17, active:true },
  { id:"a5", cat:"Aves", emoji:"🍗", name:"Frango Frito", price:17, active:true },
  { id:"a6", cat:"Aves", emoji:"🍗", name:"Frango Guisado", price:16, active:true },

  { id:"p1", cat:"Peixes", emoji:"🐟", name:"Dourada Empanada", price:18, active:true },
  { id:"p2", cat:"Peixes", emoji:"🐟", name:"Filé de Gó", price:16, active:true },

  { id:"d1", cat:"Diversos", emoji:"🍽️", name:"Linguiça Toscana", price:15, active:true },
  { id:"d2", cat:"Diversos", emoji:"🍽️", name:"Fígado Acebolado", price:15, active:true },
  { id:"d3", cat:"Diversos", emoji:"🍽️", name:"Língua Guisada", price:17, active:true },
  { id:"d4", cat:"Diversos", emoji:"🍽️", name:"Calabresa Acebolada", price:15, active:true },
  { id:"d5", cat:"Diversos", emoji:"🍽️", name:"Dobradinha", price:17, active:true }

];

const K = {
  cfg: "ml_cfg_v2",
  menu: "ml_menu_v2",
  cart: "ml_cart_v2",
  nextId: "ml_next_id_v2",
  myOrders: "ml_my_orders_v2",        // histórico do cliente (aparelho)
  profile: "ml_profile_v2",           // dados do cliente (aparelho)
  admPass: "ml_adm_pass_v2",
  admOrders: "ml_adm_orders_v2",      // pedidos salvos do lado da loja (aparelho)
  admAuthed: "ml_adm_authed_v2"
};

// -------- state ----------
let cfg = ls.get(K.cfg, DEFAULT_CONFIG);
let menu = ls.get(K.menu, DEFAULT_MENU);
let cart = ls.get(K.cart, {}); // { id: qty }
let nextId = ls.get(K.nextId, 1);

let profile = ls.get(K.profile, { name:"", phone:"", address:"", ref:"" });

// histórico do cliente: pedidos que ele já fez neste aparelho
let myOrders = ls.get(K.myOrders, []);

// pedidos do ADM (loja): fica no aparelho do ADM; no MVP é o mesmo dispositivo se você testar tudo
let admOrders = ls.get(K.admOrders, []);

function saveAll(){
  ls.set(K.cfg, cfg);
  ls.set(K.menu, menu);
  ls.set(K.cart, cart);
  ls.set(K.nextId, nextId);
  ls.set(K.profile, profile);
  ls.set(K.myOrders, myOrders);
  ls.set(K.admOrders, admOrders);
}

// -------- PWA install + SW ----------
let deferredPrompt = null;
const btnInstall = document.getElementById("btnInstall");

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  btnInstall.classList.remove("hidden");
});

btnInstall.addEventListener("click", async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
  btnInstall.classList.add("hidden");
});

if ("serviceWorker" in navigator){
  navigator.serviceWorker.register("./sw.js").catch(()=>{});
}

// -------- UI refs ----------
const storeNameEl = document.getElementById("storeName");
const storeStatusEl = document.getElementById("storeStatus");
const storeDotEl = document.getElementById("storeDot");
const storeDeliveryEl = document.getElementById("storeDelivery");
const storeMinOrderEl = document.getElementById("storeMinOrder");

const catBar = document.getElementById("catBar");
const menuList = document.getElementById("menuList");

const viewHome = document.getElementById("viewHome");
const viewOrders = document.getElementById("viewOrders");
const viewCart = document.getElementById("viewCart");
const viewCheckout = document.getElementById("viewCheckout");
const viewAdmin = document.getElementById("viewAdmin");

const myOrdersList = document.getElementById("myOrdersList");

const cartList = document.getElementById("cartList");
const sumSubtotal = document.getElementById("sumSubtotal");
const sumDelivery = document.getElementById("sumDelivery");
const sumTotal = document.getElementById("sumTotal");
const btnCheckout = document.getElementById("btnCheckout");

const cartBadge = document.getElementById("cartBadge");

const btnGoAdmin = document.getElementById("btnGoAdmin");
const btnBackApp = document.getElementById("btnBackApp");

const searchOverlay = document.getElementById("searchOverlay");
const btnOpenSearch = document.getElementById("btnOpenSearch");
const btnCloseSearch = document.getElementById("btnCloseSearch");
const searchEl = document.getElementById("search");
const btnClearSearch = document.getElementById("btnClearSearch");

// Checkout fields
const cName = document.getElementById("cName");
const cPhone = document.getElementById("cPhone");
const cAddress = document.getElementById("cAddress");
const cRef = document.getElementById("cRef");
const cPay = document.getElementById("cPay");
const trocoWrap = document.getElementById("trocoWrap");
const cTroco = document.getElementById("cTroco");
const cObs = document.getElementById("cObs");

const pixBox = document.getElementById("pixBox");
const pixKeyEl = document.getElementById("pixKey");
const pixBankEl = document.getElementById("pixBank");
const pixNameEl = document.getElementById("pixName");
const btnCopyPix = document.getElementById("btnCopyPix");
const pixProof = document.getElementById("pixProof");

const btnBackCart = document.getElementById("btnBackCart");
const btnSendWhats = document.getElementById("btnSendWhats");
const btnEditProfile = document.getElementById("btnEditProfile");

// Bottom nav
const navBtns = [...document.querySelectorAll(".navBtn")];

// Admin auth + panels
const adminLocked = document.getElementById("adminLocked");
const adminPanel = document.getElementById("adminPanel");
const admPass = document.getElementById("admPass");
const btnSetAdmPass = document.getElementById("btnSetAdmPass");
const btnAdmLogin = document.getElementById("btnAdmLogin");

const aTabs = [...document.querySelectorAll(".aTab")];
const aOrders = document.getElementById("aOrders");
const aMenu = document.getElementById("aMenu");
const aSettings = document.getElementById("aSettings");

const admFilter = document.getElementById("admFilter");
const btnAdmRefresh = document.getElementById("btnAdmRefresh");
const admOrdersList = document.getElementById("admOrdersList");
const admMenuList = document.getElementById("admMenuList");

const btnAddItem = document.getElementById("btnAddItem");
const btnResetMenu = document.getElementById("btnResetMenu");

// Admin config inputs
const cfgStoreName = document.getElementById("cfgStoreName");
const cfgWhats = document.getElementById("cfgWhats");
const cfgPixKey = document.getElementById("cfgPixKey");
const cfgPixBank = document.getElementById("cfgPixBank");
const cfgPixName = document.getElementById("cfgPixName");

const cfgDeliveryMode = document.getElementById("cfgDeliveryMode");
const cfgDeliveryValueWrap = document.getElementById("cfgDeliveryValueWrap");
const cfgDeliveryValue = document.getElementById("cfgDeliveryValue");

const cfgMinEnabled = document.getElementById("cfgMinEnabled");
const cfgMinValueWrap = document.getElementById("cfgMinValueWrap");
const cfgMinValue = document.getElementById("cfgMinValue");

const btnSaveCfg = document.getElementById("btnSaveCfg");

// ===== Modal de quantidade + botão finalizar =====
const qtyModal = document.getElementById("qtyModal");
const qmName = document.getElementById("qmName");
const qmCat = document.getElementById("qmCat");
const qmPrice = document.getElementById("qmPrice");
const qmClose = document.getElementById("qmClose");
const qmMinus = document.getElementById("qmMinus");
const qmPlus = document.getElementById("qmPlus");
const qmQty = document.getElementById("qmQty");
const qmAdd = document.getElementById("qmAdd");

const stickyCheckout = document.getElementById("stickyCheckout");
const btnGoCart = document.getElementById("btnGoCart");
const stickyTotal = document.getElementById("stickyTotal");

let modalItemId = null;
let modalQty = 1;

function openQtyModal(itemId){
  const it = menu.find(x => x.id === itemId);
  if (!it) return;

  if (!it.active) return toast("Item esgotado ❌");

  modalItemId = itemId;
  modalQty = 1;

  qmName.textContent = it.name;
  qmCat.textContent = it.cat;
  qmPrice.textContent = moneyBR(it.price);
  qmQty.textContent = String(modalQty);

  qtyModal.classList.remove("hidden");
}

function closeQtyModal(){
  qtyModal.classList.add("hidden");
  modalItemId = null;
  modalQty = 1;
}

qmClose?.addEventListener("click", closeQtyModal);
qtyModal?.addEventListener("click", (e) => {
  if (e.target === qtyModal) closeQtyModal();
});

qmMinus?.addEventListener("click", () => {
  modalQty = Math.max(1, modalQty - 1);
  qmQty.textContent = String(modalQty);
});

qmPlus?.addEventListener("click", () => {
  modalQty = Math.min(50, modalQty + 1);
  qmQty.textContent = String(modalQty);
});

qmAdd?.addEventListener("click", () => {
  if (!modalItemId) return;

  cart[modalItemId] = (cart[modalItemId] || 0) + modalQty;
  saveAll();
  updateBadge();
  updateStickyCheckout();

  toast(`Adicionado x${modalQty} ✅`);
  closeQtyModal();
});

// botão fixo: ir para carrinho
btnGoCart?.addEventListener("click", () => {
  showView("cart");
});

// -------- navigation ----------
function showView(name){
  // name: home | orders | cart | checkout | admin
  const map = { home:viewHome, orders:viewOrders, cart:viewCart, checkout:viewCheckout, admin:viewAdmin };
  Object.values(map).forEach(v => v.classList.add("hidden"));
  map[name].classList.remove("hidden");

     // ✅ Sticky "Finalizar pedido" só no Cardápio (home)
  if (name === "home") {
    updateStickyCheckout(); // mostra se tiver itens
  } else {
    stickyCheckout.classList.add("hidden"); // esconde no carrinho/checkout/pedidos/admin
  }

  // bottom nav highlight (admin não tem)
  if (name !== "admin"){
    navBtns.forEach(b => b.classList.toggle("active", b.dataset.nav === name));
  }
  if (name === "home") renderMenu();
  if (name === "cart") renderCart();
  if (name === "orders") renderMyOrders();
  if (name === "checkout") fillCheckoutFromProfile();
}

navBtns.forEach(btn => btn.addEventListener("click", () => showView(btn.dataset.nav)));

btnCheckout.addEventListener("click", () => {
  const items = cartItems();
  if (!items.length) return toast("Carrinho vazio ❌");
  showView("checkout");
});

btnBackCart.addEventListener("click", () => showView("cart"));

// Search overlay
btnOpenSearch.addEventListener("click", () => {
  searchOverlay.classList.remove("hidden");
  setTimeout(()=>searchEl.focus(), 50);
});
btnCloseSearch.addEventListener("click", () => searchOverlay.classList.add("hidden"));
btnClearSearch.addEventListener("click", () => { searchEl.value = ""; renderMenu(); });
searchEl.addEventListener("input", () => renderMenu());

// -------- computed ----------
function deliveryFee(){
  if (cfg.delivery?.mode === "FIXED") return Number(cfg.delivery.value || 0);
  return 0;
}
function cartSubtotal(){
  return cartItems().reduce((s, i) => s + i.subtotal, 0);
}
function cartTotal(){
  return cartSubtotal() + deliveryFee();
}
function cartCount(){
  return Object.values(cart).reduce((s,q)=>s+q,0);
}

// -------- categories chips ----------
function categories(){
  const cats = [...new Set(menu.map(m => m.cat))];
  return cats;
}

let activeCat = "Todos";

function renderCatBar(){
  const cats = ["Todos", ...categories()];
  catBar.innerHTML = cats.map(c => `
    <button class="catChip ${c===activeCat ? "active":""}" data-cat="${escapeHtml(c)}">${escapeHtml(c)}</button>
  `).join("");

  catBar.querySelectorAll(".catChip").forEach(btn => {
    btn.addEventListener("click", () => {
      activeCat = btn.dataset.cat;
      renderCatBar();
      renderMenu();
    });
  });
}

// -------- menu ----------
function renderMenu(){
  const q = (searchEl.value || "").trim().toLowerCase();

  const list = menu
    .filter(i => activeCat === "Todos" ? true : i.cat === activeCat)
    .filter(i => !q || i.name.toLowerCase().includes(q) || i.cat.toLowerCase().includes(q));

  if (!list.length){
    menuList.innerHTML = `<div class="card"><strong>Nenhum item encontrado.</strong></div>`;
    return;
  }

  menuList.innerHTML = list.map(i => {
    const esgotado = !i.active;
    return `
      <div class="prodCard">
        <div class="prodLeft">
          <div class="prodImg">${escapeHtml(i.emoji || "🍲")}</div>
          <div class="prodInfo">
            <div class="prodName">${escapeHtml(i.name)}</div>
            <div class="prodDesc">Acompanha: Arroz, Feijão, Macarrão, Salada e Farofa</div>
          </div>
        </div>
        <div class="prodRight">
          <div class="prodPrice">${moneyBR(i.price)}</div>
          ${esgotado
            ? `<div class="badgeEsgotado">Esgotado</div>`
            : `<button class="btn btnAdd" data-open="${i.id}">Selecionar</button>`
          }
        </div>
      </div>
    `;
  }).join("");

 menuList.querySelectorAll("button[data-open]").forEach(btn => {
  btn.addEventListener("click", () => openQtyModal(btn.dataset.open));
});
}

// -------- cart ----------
function cartItems(){
  const items = [];
  for (const [id, qty] of Object.entries(cart)){
    const m = menu.find(x => x.id === id);
    if (!m) continue;
    items.push({
      id, name: m.name, price: m.price, qty,
      subtotal: m.price * qty
    });
  }
  return items;
}

function addToCart(id){
  const m = menu.find(x => x.id === id);
  if (!m) return;
  if (!m.active) return toast("Item esgotado ❌");
  cart[id] = (cart[id] || 0) + 1;
  saveAll();
  updateBadge();
  updateStickyCheckout();
}

function minusCart(id){
  if (!cart[id]) return;
  cart[id] -= 1;
  if (cart[id] <= 0) delete cart[id];
  saveAll();
  updateBadge();
  renderCart();
  updateStickyCheckout();
}

function removeCart(id){
  if (!cart[id]) return;
  delete cart[id];
  saveAll();
  updateBadge();
  renderCart();
  updateStickyCheckout();
}

function updateBadge(){
  const n = cartCount();
  if (n <= 0){
    cartBadge.classList.add("hidden");
  } else {
    cartBadge.textContent = String(n);
    cartBadge.classList.remove("hidden");
  }
}

function updateStickyCheckout(){
  // ✅ Só pode aparecer na HOME
  const isHome = !viewHome.classList.contains("hidden");
  if (!isHome){
    stickyCheckout.classList.add("hidden");
    return;
  }

  const total = cartTotal();
  const count = cartCount();

  if (count <= 0){
    stickyCheckout.classList.add("hidden");
    return;
  }

  stickyTotal.textContent = moneyBR(total);
  stickyCheckout.classList.remove("hidden");
}

function renderCart(){
  const items = cartItems();
  if (!items.length){
    cartList.innerHTML = `<div class="card"><strong>Seu carrinho está vazio.</strong></div>`;
  } else {
    cartList.innerHTML = items.map(i => `
      <div class="cartItem">
        <div class="cartItemTop">
          <div>
            <div class="cartItemName">${escapeHtml(i.name)}</div>
            <div class="cartItemSub">${moneyBR(i.price)} • Subtotal: <strong>${moneyBR(i.subtotal)}</strong></div>
          </div>
          <strong>${moneyBR(i.subtotal)}</strong>
        </div>

        <div class="qtyRow">
          <button class="qtyBtn" data-act="minus" data-id="${i.id}">−</button>
          <div class="qtyVal">${i.qty}</div>
          <button class="qtyBtn" data-act="plus" data-id="${i.id}">+</button>
          <button class="removeBtn" data-act="remove" data-id="${i.id}">Remover</button>
        </div>
      </div>
    `).join("");

    cartList.querySelectorAll("button[data-act]").forEach(b => {
      b.addEventListener("click", () => {
        const id = b.dataset.id;
        const act = b.dataset.act;
        if (act === "minus") minusCart(id);
        if (act === "plus") addToCart(id);
        if (act === "remove") removeCart(id);
      });
    });
  }

  const sub = cartSubtotal();
  const del = deliveryFee();
  const tot = sub + del;

  sumSubtotal.textContent = moneyBR(sub);
  sumDelivery.textContent = del > 0 ? moneyBR(del) : "Grátis";
  sumTotal.textContent = moneyBR(tot);

  // ✅ garante que o botão fixo sempre reflita o carrinho atual
  updateStickyCheckout();
}

// -------- profile (salvar dados do cliente) ----------
function fillCheckoutFromProfile(){
  cName.value = profile.name || "";
  cPhone.value = profile.phone ? formatPhoneBR(profile.phone) : "";
  cAddress.value = profile.address || "";
  cRef.value = profile.ref || "";
}

btnEditProfile.addEventListener("click", () => {
  // desbloqueia edição (já é editável), só dá feedback
  toast("Você pode editar e salvar ao finalizar ✅");
});

// -------- pagamento ----------
cPay.addEventListener("change", () => {
  trocoWrap.classList.toggle("hidden", cPay.value !== "DINHEIRO");

  if (cPay.value === "PIX"){
    pixBox.classList.remove("hidden");
    pixKeyEl.textContent = cfg.pix.key;
    pixBankEl.textContent = cfg.pix.bank;
    pixNameEl.textContent = cfg.pix.name;
  } else {
    pixBox.classList.add("hidden");
  }
});

btnCopyPix.addEventListener("click", async () => {
  try{
    await navigator.clipboard.writeText(cfg.pix.key);
    toast("Chave Pix copiada ✅");
  } catch {
    toast("Não deu pra copiar automaticamente ❌");
  }
});

// -------- build comanda ----------
function buildComanda(order){
  const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.customer.address)}`;

  const lines = [];
  lines.push(`🧾 *COMANDA #${order.id}* — ${order.date} ${order.time}`);
  lines.push(`*Cliente:* ${order.customer.name}`);
  lines.push(`*Telefone:* ${formatPhoneBR(order.customer.phone)}`);
  lines.push(`*Endereço:* ${order.customer.address}`);
  lines.push(`*Referência:* ${order.customer.ref}`);
  lines.push(`📍 *Maps:* ${maps}`);
  lines.push(``);
  lines.push(`*Pedido:*`);
  order.items.forEach(it => lines.push(`- ${it.qty}x ${it.name} — ${moneyBR(it.subtotal)}`));
  lines.push(``);
  lines.push(`*Subtotal:* ${moneyBR(order.subtotal)}`);
  lines.push(`*Entrega:* ${order.deliveryFee > 0 ? moneyBR(order.deliveryFee) : "Grátis"}`);
  lines.push(`*Total:* ${moneyBR(order.total)}`);
  lines.push(``);
  lines.push(`*Pagamento:* ${order.pay.method === "PIX" ? "Pix" : order.pay.method === "DINHEIRO" ? "Dinheiro" : "Cartão"}`);

  if (order.pay.method === "PIX"){
    lines.push(`*Chave Pix:* ${cfg.pix.key}`);
    lines.push(`*Banco:* ${cfg.pix.bank}`);
    lines.push(`*Nome:* ${cfg.pix.name}`);
    lines.push(`*Comprovante:* (anexado)`); // intenção
  }
  if (order.pay.method === "DINHEIRO" && order.pay.troco){
    lines.push(`*Troco para:* ${moneyBR(order.pay.troco)}`);
  }

  lines.push(`*Obs:* ${order.obs || "-"}`);

  return lines.join("\n");
}

// -------- enviar pedido ----------
btnSendWhats.addEventListener("click", async () => {
  const items = cartItems();
  if (!items.length) return toast("Carrinho vazio ❌");

  const name = cName.value.trim();
  const phone = onlyDigits(cPhone.value);
  const address = cAddress.value.trim();
  const ref = cRef.value.trim();
  const pay = cPay.value;
  const troco = cTroco.value.trim();
  const obs = cObs.value.trim();

  if (!name) return toast("Informe o nome ❌");
  if (phone.length < 10) return toast("Telefone inválido ❌");
  if (!address) return toast("Informe o endereço ❌");
  if (!ref) return toast("Referência é obrigatória ❌");
  if (!pay) return toast("Selecione o pagamento ❌");

  // pedido mínimo (opcional)
  const sub = cartSubtotal();
  const del = deliveryFee();
  const total = sub + del;

  if (cfg.minOrder?.enabled && total < Number(cfg.minOrder.value || 0)){
    return toast(`Pedido mínimo: ${moneyBR(cfg.minOrder.value)} ❌`);
  }

  // pix: comprovante obrigatório
  let proofFile = null;
  if (pay === "PIX"){
    proofFile = pixProof?.files?.[0] || null;
    if (!proofFile) return toast("Comprovante do Pix obrigatório ❌");
  }

  // salvar perfil do cliente (pra próxima compra)
  profile = { name, phone, address, ref };
  ls.set(K.profile, profile);

  // criar pedido
  const t = nowBR();
  const id = nextId++;

  const order = {
    id,
    date: t.date,
    time: t.time,
    isoDate: t.isoDate,
    status: (pay === "PIX") ? "AGUARDANDO_PAGAMENTO" : "ATIVO",
    customer: { name, phone, address, ref },
    items,
    subtotal: sub,
    deliveryFee: del,
    total,
    pay: { method: pay, troco: (pay === "DINHEIRO" ? troco : "") },
    obs
  };

  // salvar no histórico do cliente (no aparelho)
  myOrders.unshift(order);
  ls.set(K.myOrders, myOrders);

  // salvar no painel da loja (ADM) também (no mesmo aparelho no MVP)
  admOrders.unshift(order);
  ls.set(K.admOrders, admOrders);

  // comanda
  const msg = buildComanda(order);

  // limpar carrinho
cart = {};
ls.set(K.cart, cart);
updateBadge();
renderCart();
updateStickyCheckout();

  // tentar compartilhar arquivo + texto (quando suportado)
  const waTo = onlyDigits(cfg.whatsappReceiver);
  const waUrl = `https://wa.me/55${waTo}?text=${encodeURIComponent(msg)}`;

  if (pay === "PIX" && proofFile){
    if (navigator.canShare && navigator.canShare({ files: [proofFile] })) {
      try{
        await navigator.share({
          title: `Comanda #${order.id}`,
          text: msg,
          files: [proofFile]
        });
        toast("Compartilhamento aberto ✅");
        showView("orders");
        return;
      } catch {
        // usuário cancelou ou falhou
      }
    }

    // fallback
    toast("Abra o WhatsApp e ANEXE o comprovante 📎");
    window.location.href = waUrl;
    showView("orders");
    return;
  }

  window.location.href = waUrl;
  showView("orders");
});

// -------- meus pedidos (cliente) ----------
function renderMyOrders(){
  if (!myOrders.length){
    myOrdersList.innerHTML = `<div class="card"><strong>Nenhum pedido ainda.</strong></div>`;
    return;
  }

  myOrdersList.innerHTML = myOrders.map(o => `
    <div class="orderCard">
      <div class="row">
        <div>
          <strong>Pedido #${o.id}</strong>
          <div class="small">${o.date} ${o.time}</div>
        </div>
        <span class="pill ${pillClass(o.status)}">${statusLabel(o.status)}</span>
      </div>

      <div class="small" style="margin-top:10px;">
        ${o.items.slice(0,2).map(it => `${it.qty}x ${escapeHtml(it.name)}`).join("<br>")}
        ${o.items.length > 2 ? "<br>..." : ""}
      </div>

      <div class="row" style="margin-top:10px;">
        <strong>${moneyBR(o.total)}</strong>
        <div class="row gap">
          <button class="ghost" data-act="details" data-id="${o.id}">Detalhes</button>
          <button class="primary" data-act="repeat" data-id="${o.id}">Repetir</button>
        </div>
      </div>

      <div class="hidden" id="details-${o.id}" style="margin-top:10px;">
        <div class="small"><strong>Endereço:</strong> ${escapeHtml(o.customer.address)}</div>
        <div class="small"><strong>Referência:</strong> ${escapeHtml(o.customer.ref)}</div>
        <div class="small"><strong>Pagamento:</strong> ${statusPayLabel(o)}</div>
      </div>
    </div>
  `).join("");

  myOrdersList.querySelectorAll("button[data-act]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.id);
      const act = btn.dataset.act;
      const o = myOrders.find(x => x.id === id);
      if (!o) return;

      if (act === "details"){
        const el = document.getElementById(`details-${id}`);
        el.classList.toggle("hidden");
      }
      if (act === "repeat"){
        // coloca itens no carrinho de novo
        cart = {};
        o.items.forEach(it => { cart[it.id] = (cart[it.id] || 0) + it.qty; });
        ls.set(K.cart, cart);
        updateBadge();
        toast("Pedido repetido no carrinho ✅");
        showView("cart");
      }
    });
  });
}

function statusPayLabel(o){
  if (o.pay.method === "PIX") return "Pix (com comprovante)";
  if (o.pay.method === "DINHEIRO") return o.pay.troco ? `Dinheiro (Troco: ${moneyBR(o.pay.troco)})` : "Dinheiro";
  return "Cartão";
}

// -------- admin ----------
btnGoAdmin.addEventListener("click", () => {
  showView("admin");
  checkAdminAuth();
});
btnBackApp.addEventListener("click", () => showView("home"));

btnSetAdmPass.addEventListener("click", () => {
  const p = admPass.value.trim();
  if (p.length < 4) return toast("Senha muito curta (mín. 4) ❌");
  ls.set(K.admPass, p);
  toast("Senha definida ✅");
});

btnAdmLogin.addEventListener("click", () => {
  const saved = localStorage.getItem(K.admPass);
  if (!saved) return toast("Defina uma senha primeiro ❌");
  const p = admPass.value.trim();
  if (p !== JSON.parse(saved)) return toast("Senha incorreta ❌");
  ls.set(K.admAuthed, true);
  checkAdminAuth();
});

function checkAdminAuth(){
  const authed = ls.get(K.admAuthed, false);
  adminLocked.classList.toggle("hidden", authed);
  adminPanel.classList.toggle("hidden", !authed);
  if (authed){
    setAdminTab("orders");
  }
}

aTabs.forEach(btn => btn.addEventListener("click", () => setAdminTab(btn.dataset.atab)));

function setAdminTab(which){
  aTabs.forEach(b => b.classList.toggle("active", b.dataset.atab === which));
  [aOrders, aMenu, aSettings].forEach(p => p.classList.remove("active"));
  if (which === "orders"){ aOrders.classList.add("active"); renderAdmOrders(); }
  if (which === "menu"){ aMenu.classList.add("active"); renderAdmMenu(); }
  if (which === "settings"){ aSettings.classList.add("active"); fillSettings(); }
}

btnAdmRefresh.addEventListener("click", renderAdmOrders);
admFilter.addEventListener("change", renderAdmOrders);

function renderAdmOrders(){
  const f = admFilter.value;
  const list = admOrders.filter(o => o.status !== "EXCLUIDO")
    .filter(o => f === "ALL" ? true : o.status === f);

  if (!list.length){
    admOrdersList.innerHTML = `<div class="card"><strong>Nenhum pedido aqui.</strong></div>`;
    return;
  }

  admOrdersList.innerHTML = list.map(o => `
    <div class="orderCard">
      <div class="row">
        <div>
          <strong>Comanda #${o.id}</strong>
          <div class="small">${o.date} ${o.time} • ${escapeHtml(o.customer.name)}</div>
        </div>
        <span class="pill ${pillClass(o.status)}">${statusLabel(o.status)}</span>
      </div>

      <div class="small" style="margin-top:8px;">
        <strong>Total:</strong> ${moneyBR(o.total)} • <strong>Pagamento:</strong> ${statusPayLabel(o)}
      </div>

      <details style="margin-top:8px;">
        <summary style="cursor:pointer; font-weight:1000; color: var(--muted);">Detalhes</summary>
        <div class="small" style="margin-top:8px;"><strong>Telefone:</strong> ${formatPhoneBR(o.customer.phone)}</div>
        <div class="small"><strong>Endereço:</strong> ${escapeHtml(o.customer.address)}</div>
        <div class="small"><strong>Referência:</strong> ${escapeHtml(o.customer.ref)}</div>
        <div class="small"><strong>Itens:</strong><br>${o.items.map(it => `${it.qty}x ${escapeHtml(it.name)} (${moneyBR(it.subtotal)})`).join("<br>")}</div>
      </details>

      <div class="row gap" style="margin-top:10px; flex-wrap:wrap;">
        ${o.status === "AGUARDANDO_PAGAMENTO"
          ? `<button class="primary" data-act="paid" data-id="${o.id}">Marcar pago</button>`
          : `<button class="ghost" data-act="paid" data-id="${o.id}">Marcar pago</button>`
        }
        <button class="ghost" data-act="cancel" data-id="${o.id}">Cancelar</button>
        <button class="ghost" data-act="active" data-id="${o.id}">Reativar</button>
        <button class="removeBtn" data-act="del" data-id="${o.id}">Excluir</button>
      </div>
    </div>
  `).join("");

  admOrdersList.querySelectorAll("button[data-act]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.id);
      const act = btn.dataset.act;
      const o = admOrders.find(x => x.id === id);
      if (!o) return;

      if (act === "paid"){
        o.status = "PAGO";
        saveAll();
        renderAdmOrders();
        toast("Marcado como pago ✅");
      }
      if (act === "cancel"){
        o.status = "CANCELADO";
        saveAll();
        renderAdmOrders();
        toast("Pedido cancelado ✅");
      }
      if (act === "active"){
        o.status = "ATIVO";
        saveAll();
        renderAdmOrders();
        toast("Pedido reativado ✅");
      }
      if (act === "del"){
        if (!confirm(`Excluir comanda #${id}?`)) return;
        o.status = "EXCLUIDO";
        saveAll();
        renderAdmOrders();
        toast("Pedido excluído ✅");
      }
    });
  });
}

// Admin menu
btnAddItem.addEventListener("click", () => {
  const cat = prompt("Categoria (ex: Carnes):", "Carnes");
  if (cat === null) return;
  const name = prompt("Nome do item:", "");
  if (name === null) return;
  const price = prompt("Preço (ex: 18.00):", "18.00");
  if (price === null) return;

  const n = name.trim();
  const c = cat.trim() || "Outros";
  const p = Number(String(price).replace(",", "."));
  if (!n) return toast("Nome inválido ❌");
  if (!Number.isFinite(p) || p <= 0) return toast("Preço inválido ❌");

  const id = `x${Date.now()}`;
  menu.unshift({ id, cat: c, emoji:"🍲", name: n, price: p, active:true });
  saveAll();
  renderCatBar();
  renderMenu();
  renderAdmMenu();
  toast("Item adicionado ✅");
});

btnResetMenu.addEventListener("click", () => {
  if (!confirm("Resetar cardápio para o padrão?")) return;
  menu = DEFAULT_MENU.map(x => ({...x}));
  saveAll();
  renderCatBar();
  renderMenu();
  renderAdmMenu();
  toast("Cardápio resetado ✅");
});

function renderAdmMenu(){
  const grouped = groupBy(menu, "cat");
  const cats = Object.keys(grouped);

  admMenuList.innerHTML = cats.map(cat => `
    <div class="card">
      <strong>${escapeHtml(cat)}</strong>
      <div style="height:10px;"></div>
      ${grouped[cat].map(i => `
        <div class="row" style="padding:10px 0; border-bottom:1px dashed var(--line);">
          <div style="min-width:0;">
            <div style="font-weight:1000;">${escapeHtml(i.name)}</div>
            <div class="small">${moneyBR(i.price)} • ${i.active ? "Disponível ✅" : "Esgotado ❌"}</div>
          </div>
          <div class="row gap" style="flex:0 0 auto;">
            <button class="ghost" data-act="toggle" data-id="${i.id}">${i.active ? "Esgotar" : "Ativar"}</button>
            <button class="primary" data-act="edit" data-id="${i.id}">Editar</button>
          </div>
        </div>
      `).join("")}
    </div>
  `).join("");

  admMenuList.querySelectorAll("button[data-act]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      const act = btn.dataset.act;
      const it = menu.find(x => x.id === id);
      if (!it) return;

      if (act === "toggle"){
        it.active = !it.active;
        saveAll();
        renderMenu();
        renderAdmMenu();
        toast(it.active ? "Item ativado ✅" : "Marcado esgotado ❌");
      }

      if (act === "edit"){
        const newName = prompt("Nome:", it.name);
        if (newName === null) return;
        const newPrice = prompt("Preço (ex: 18.00):", String(it.price));
        if (newPrice === null) return;
        const n = newName.trim();
        const p = Number(String(newPrice).replace(",", "."));
        if (!n) return toast("Nome inválido ❌");
        if (!Number.isFinite(p) || p <= 0) return toast("Preço inválido ❌");
        it.name = n;
        it.price = p;
        saveAll();
        renderMenu();
        renderAdmMenu();
        toast("Atualizado ✅");
      }
    });
  });
}

// Admin settings
cfgDeliveryMode.addEventListener("change", () => {
  cfgDeliveryValueWrap.classList.toggle("hidden", cfgDeliveryMode.value !== "FIXED");
});
cfgMinEnabled.addEventListener("change", () => {
  cfgMinValueWrap.classList.toggle("hidden", cfgMinEnabled.value !== "YES");
});

btnSaveCfg.addEventListener("click", () => {
  cfg.storeName = cfgStoreName.value.trim() || "ML Refeições";
  cfg.whatsappReceiver = onlyDigits(cfgWhats.value);

  cfg.pix.key = cfgPixKey.value.trim();
  cfg.pix.bank = cfgPixBank.value.trim();
  cfg.pix.name = cfgPixName.value.trim();

  cfg.delivery.mode = cfgDeliveryMode.value;
  cfg.delivery.value = (cfg.delivery.mode === "FIXED") ? Number(cfgDeliveryValue.value || 0) : 0;

  cfg.minOrder.enabled = (cfgMinEnabled.value === "YES");
  cfg.minOrder.value = cfg.minOrder.enabled ? Number(cfgMinValue.value || 0) : 0;

  saveAll();
  applyStoreHeader();
  toast("Configurações salvas ✅");
});

function fillSettings(){
  cfgStoreName.value = cfg.storeName || "ML Refeições";
  cfgWhats.value = cfg.whatsappReceiver || "";

  cfgPixKey.value = cfg.pix.key || "";
  cfgPixBank.value = cfg.pix.bank || "";
  cfgPixName.value = cfg.pix.name || "";

  cfgDeliveryMode.value = cfg.delivery?.mode || "FREE";
  cfgDeliveryValue.value = cfg.delivery?.value ?? 0;
  cfgDeliveryValueWrap.classList.toggle("hidden", cfgDeliveryMode.value !== "FIXED");

  cfgMinEnabled.value = cfg.minOrder?.enabled ? "YES" : "NO";
  cfgMinValue.value = cfg.minOrder?.value ?? 0;
  cfgMinValueWrap.classList.toggle("hidden", cfgMinEnabled.value !== "YES");
}

// -------- header info ----------
function applyStoreHeader(){
  storeNameEl.textContent = cfg.storeName || "ML Refeições";

  if (cfg.storeOpen){
    storeStatusEl.textContent = "Aberto";
    storeDotEl.classList.remove("off");
    storeDotEl.classList.add("ok");
  } else {
    storeStatusEl.textContent = "Fechado";
    storeDotEl.classList.remove("ok");
    storeDotEl.classList.add("off");
  }

  const d = deliveryFee();
  storeDeliveryEl.textContent = d > 0 ? `Entrega ${moneyBR(d)}` : "Entrega grátis";

  if (cfg.minOrder?.enabled){
    storeMinOrderEl.textContent = `Pedido mín. ${moneyBR(cfg.minOrder.value)}`;
  } else {
    storeMinOrderEl.textContent = "Sem pedido mínimo";
  }
}

// -------- utils ----------
function groupBy(arr, key){
  return arr.reduce((acc, item) => {
    const k = item[key] || "Outros";
    (acc[k] = acc[k] || []).push(item);
    return acc;
  }, {});
}

function statusLabel(s){
  if (s === "AGUARDANDO_PAGAMENTO") return "Aguardando Pix";
  if (s === "PAGO") return "Pago";
  if (s === "ATIVO") return "Ativo";
  if (s === "CANCELADO") return "Cancelado";
  if (s === "EXCLUIDO") return "Excluído";
  return s;
}

function pillClass(s){
  if (s === "AGUARDANDO_PAGAMENTO") return "yellow";
  if (s === "PAGO") return "green";
  if (s === "ATIVO") return "gray";
  if (s === "CANCELADO") return "red";
  if (s === "EXCLUIDO") return "red";
  return "gray";
}

// -------- init ----------
function init(){
  saveAll();             // garante persistência
  applyStoreHeader();
  renderCatBar();
  renderMenu();
  updateBadge();
  updateStickyCheckout();

  // defaults
  showView("home");
}
init();