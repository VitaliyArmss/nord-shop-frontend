import { useEffect, useMemo, useState } from 'react';
import {
  ArrowDownWideNarrow, ArrowRight, Check, ChevronDown, ChevronRight,
  Heart, Leaf, Menu, Minus, PackageCheck, Plus, Search, ShieldCheck, ShoppingBag,
  ShoppingCart, Sparkles, Truck, UserRound, X,
} from 'lucide-react';
import { apiRequest, demoProducts } from './api.js';

const categories = ['Все товары', 'Для дома', 'Электроника', 'Аксессуары'];
const rubles = new Intl.NumberFormat('ru-RU', {
  style: 'currency', currency: 'RUB', maximumFractionDigits: 0,
});
const money = (value) => rubles.format(value || 0);
const readStorage = (key, fallback) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

function BrandMark() {
  return <span className="brand-mark" aria-hidden="true"><span /><span /><span /></span>;
}

function ProductCard({ product, isFavorite, onFavorite, onAdd, onOpen }) {
  return (
    <article className="product-card">
      <button className="product-image-button" onClick={() => onOpen(product)} aria-label={`Подробнее: ${product.name}`}>
        <img className="product-image" src={product.imageUrl} alt={product.name} loading="lazy" />
        {product.isFeatured && <span className="product-tag">Выбор NORD</span>}
      </button>
      <button
        className={`favorite-button ${isFavorite ? 'is-active' : ''}`}
        onClick={() => onFavorite(product.id)}
        aria-label={isFavorite ? 'Убрать из избранного' : 'В избранное'}
      >
        <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
      </button>
      <div className="product-info">
        <span className="product-category">{product.category}</span>
        <button className="product-name" onClick={() => onOpen(product)}>{product.name}</button>
        <div className="product-bottom">
          <span className="product-price">{money(product.price)}</span>
          <button className="add-button" onClick={() => onAdd(product)} aria-label={`Добавить ${product.name} в корзину`}>
            <Plus size={19} strokeWidth={2.2} />
          </button>
        </div>
      </div>
    </article>
  );
}

function Dialog({ title, eyebrow, onClose, children, extraClass = '' }) {
  return (
    <div className="overlay" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className={`dialog ${extraClass}`} role="dialog" aria-modal="true" aria-label={title}>
        <button className="dialog-close icon-button" onClick={onClose} aria-label="Закрыть"><X size={20} /></button>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h2>{title}</h2>
        {children}
      </section>
    </div>
  );
}

export default function App() {
  const [products, setProducts] = useState(demoProducts);
  const [apiOnline, setApiOnline] = useState(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Все товары');
  const [sort, setSort] = useState('popular');
  const [favorites, setFavorites] = useState(() => readStorage('nord-favorites', []));
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [cart, setCart] = useState(() => readStorage('nord-cart', {}));
  const [cartOpen, setCartOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [productOpen, setProductOpen] = useState(null);
  const [loginValues, setLoginValues] = useState({ username: 'demo', password: 'demo123' });
  const [loginError, setLoginError] = useState('');
  const [loginBusy, setLoginBusy] = useState(false);
  const [token, setToken] = useState(() => localStorage.getItem('nord-token') || '');
  const [user, setUser] = useState(() => readStorage('nord-user', null));
  const [orders, setOrders] = useState([]);
  const [ordersBusy, setOrdersBusy] = useState(false);
  const [address, setAddress] = useState('');
  const [orderComment, setOrderComment] = useState('');
  const [toast, setToast] = useState('');

  useEffect(() => {
    let active = true;
    apiRequest('/products')
      .then((data) => {
        if (!active) return;
        setProducts(Array.isArray(data) && data.length ? data : demoProducts);
        setApiOnline(true);
      })
      .catch(() => {
        if (!active) return;
        setProducts(demoProducts);
        setApiOnline(false);
      });
    return () => { active = false; };
  }, []);

  useEffect(() => localStorage.setItem('nord-cart', JSON.stringify(cart)), [cart]);
  useEffect(() => localStorage.setItem('nord-favorites', JSON.stringify(favorites)), [favorites]);

  useEffect(() => {
    if (!accountOpen || !token) return;
    let active = true;
    setOrdersBusy(true);
    apiRequest('/orders/mine', { token })
      .then((data) => { if (active) setOrders(Array.isArray(data) ? data : []); })
      .catch(() => { if (active) setOrders([]); })
      .finally(() => { if (active) setOrdersBusy(false); });
    return () => { active = false; };
  }, [accountOpen, token]);

  const shownProducts = useMemo(() => {
    let list = [...products];
    if (category !== 'Все товары') list = list.filter((item) => item.category === category);
    if (favoritesOnly) list = list.filter((item) => favorites.includes(item.id));
    const query = search.trim().toLocaleLowerCase('ru-RU');
    if (query) list = list.filter((item) => `${item.name} ${item.description} ${item.category}`.toLocaleLowerCase('ru-RU').includes(query));
    if (sort === 'price-up') list.sort((a, b) => a.price - b.price);
    if (sort === 'price-down') list.sort((a, b) => b.price - a.price);
    if (sort === 'popular') list.sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured));
    return list;
  }, [products, category, favoritesOnly, favorites, search, sort]);

  const cartItems = useMemo(() => Object.entries(cart)
    .map(([id, quantity]) => ({ product: products.find((item) => item.id === Number(id)), quantity: Number(quantity) }))
    .filter((item) => item.product && item.quantity > 0), [cart, products]);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const notify = (message) => {
    setToast(message);
    window.clearTimeout(notify.timer);
    notify.timer = window.setTimeout(() => setToast(''), 2800);
  };

  const addToCart = (product) => {
    setCart((current) => {
      const currentQuantity = current[product.id] || 0;
      if (currentQuantity >= product.stock) {
        notify('Больше этого товара сейчас нет на складе.');
        return current;
      }
      notify('Добавлено в корзину');
      return { ...current, [product.id]: currentQuantity + 1 };
    });
  };

  const changeQuantity = (product, delta) => {
    setCart((current) => {
      const nextQuantity = (current[product.id] || 0) + delta;
      if (nextQuantity > product.stock) {
        notify('Достигнуто максимальное количество на складе.');
        return current;
      }
      const next = { ...current };
      if (nextQuantity <= 0) delete next[product.id];
      else next[product.id] = nextQuantity;
      return next;
    });
  };

  const toggleFavorite = (id) => {
    setFavorites((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id]);
  };

  const submitLogin = async (event) => {
    event.preventDefault();
    setLoginError('');
    setLoginBusy(true);
    try {
      const result = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify(loginValues),
      });
      localStorage.setItem('nord-token', result.token);
      localStorage.setItem('nord-user', JSON.stringify(result.user));
      setToken(result.token);
      setUser(result.user);
      setLoginOpen(false);
      notify(`Рады видеть, ${result.user.displayName}!`);
    } catch (error) {
      setLoginError(apiOnline === false
        ? 'API сейчас недоступно. Запустите backend по инструкции в README.'
        : (error.message || 'Не удалось войти. Проверьте данные.'));
    } finally {
      setLoginBusy(false);
    }
  };

  const placeOrder = async (event) => {
    event.preventDefault();
    if (!cartItems.length) return;
    if (!token) {
      setLoginOpen(true);
      setLoginError('Войдите под тестовым аккаунтом, чтобы оформить заказ.');
      return;
    }
    if (!address.trim() || address.trim().length < 5) {
      notify('Укажите адрес доставки.');
      return;
    }
    if (!apiOnline) {
      notify('Для оформления заказа запустите API и PostgreSQL.');
      return;
    }
    try {
      const result = await apiRequest('/orders', {
        method: 'POST',
        token,
        body: JSON.stringify({
          deliveryAddress: address.trim(),
          comment: orderComment.trim() || null,
          items: cartItems.map(({ product, quantity }) => ({ productId: product.id, quantity })),
        }),
      });
      setCart({});
      setAddress('');
      setOrderComment('');
      setCartOpen(false);
      notify(`Заказ №${result.id} оформлен. Спасибо!`);
      apiRequest('/products').then(setProducts).catch(() => {});
    } catch (error) {
      if (error.status === 401) {
        localStorage.removeItem('nord-token');
        setToken('');
        setUser(null);
        setLoginOpen(true);
      }
      notify(error.message || 'Не удалось оформить заказ.');
    }
  };

  const signOut = () => {
    localStorage.removeItem('nord-token');
    localStorage.removeItem('nord-user');
    setToken('');
    setUser(null);
    setOrders([]);
    setAccountOpen(false);
    notify('Вы вышли из аккаунта.');
  };

  const jumpToCatalog = () => document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div className="app-shell">
      <div className="announcement"><Sparkles size={13} /> Маленькие вещи — большие перемены <span className="announcement-dot">·</span> Доставка по всей России</div>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="NORD — на главную"><BrandMark /><span>NORD</span></a>
        <nav className="desktop-nav" aria-label="Основная навигация">
          <a href="#catalog" onClick={() => { setCategory('Все товары'); setFavoritesOnly(false); }}>Каталог</a>
          <a href="#benefits">Почему NORD</a>
          <a href="#footer">Контакты</a>
        </nav>
        <div className="header-actions">
          <label className="search-box">
            <Search size={18} />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Найти что-то хорошее" aria-label="Поиск товаров" />
            {search && <button onClick={() => setSearch('')} aria-label="Очистить поиск"><X size={15} /></button>}
          </label>
          <button className={`header-icon ${favoritesOnly ? 'header-icon-active' : ''}`} onClick={() => { setFavoritesOnly((value) => !value); jumpToCatalog(); }} aria-label="Избранное">
            <Heart size={20} />{favorites.length > 0 && <span className="icon-count">{favorites.length}</span>}
          </button>
          <button className="header-icon account-trigger" onClick={() => user ? setAccountOpen(true) : setLoginOpen(true)} aria-label="Аккаунт">
            <UserRound size={20} />
          </button>
          <button className="header-cart" onClick={() => setCartOpen(true)} aria-label={`Корзина, товаров: ${cartCount}`}>
            <ShoppingBag size={18} /><span>Корзина</span>{cartCount > 0 && <b>{cartCount}</b>}
          </button>
        </div>
      </header>

      <main id="top">
        <section className="hero-section">
          <div className="hero-copy">
            <span className="eyebrow"><span className="eyebrow-line" /> ПРОСТО. УДОБНО. НАДОЛГО.</span>
            <h1>Вещи, которые<br />делают день <em>лучше.</em></h1>
            <p>Собираем полезные и красивые предметы для дома, работы и всех маршрутов между ними.</p>
            <div className="hero-actions">
              <button className="primary-button" onClick={jumpToCatalog}>Смотреть каталог <ArrowRight size={17} /></button>
              <span className="hero-note"><span className="note-star">✳</span> Выбираем с заботой</span>
            </div>
            <div className="hero-proof">
              <div className="proof-avatars"><span>А</span><span>М</span><span>К</span><span>+</span></div>
              <div><strong>Вещи для жизни</strong><small>в своём ритме</small></div>
            </div>
          </div>
          <div className="hero-art">
            <div className="hero-orbit orbit-one" /><div className="hero-orbit orbit-two" />
            <div className="hero-label"><span>01 / EVERYDAY EDIT</span><span>Новая коллекция</span></div>
            <img src="https://images.unsplash.com/photo-1490312278390-ab64016e0aa9?auto=format&fit=crop&w=1400&q=90" alt="Минималистичный интерьер в тёплых оттенках" />
            <div className="hero-sticker"><span>less</span><span>but</span><strong>better.</strong></div>
            <div className="hero-caption"><span>Предметы с характером</span><span className="caption-arrow">↗</span></div>
          </div>
          <div className="hero-bottom-note"><span>01</span><span className="tiny-rule" /><span>Хороший выбор начинается с простого</span></div>
        </section>

        <section className="benefits-strip" id="benefits">
          <div className="benefit"><span className="benefit-icon"><Truck size={19} /></span><div><strong>Бережная доставка</strong><span>От 5 000 ₽ — бесплатно</span></div></div>
          <div className="benefit"><span className="benefit-icon"><ShieldCheck size={19} /></span><div><strong>Покупка без сюрпризов</strong><span>Понятные условия и цены</span></div></div>
          <div className="benefit"><span className="benefit-icon"><Leaf size={19} /></span><div><strong>Вещи надолго</strong><span>Отбираем не на один сезон</span></div></div>
          <div className="benefit-stock"><span className="stock-dot" /> Всё самое нужное — здесь</div>
        </section>

        <section id="catalog" className="catalog-section">
          <div className="section-heading">
            <div><span className="eyebrow"><span className="eyebrow-line" /> МАГАЗИН NORD</span><h2>{favoritesOnly ? 'То, что понравилось' : 'Найди своё'}</h2><p>Продуманные детали для повседневных моментов.</p></div>
            <div className="catalog-controls">
              <label className="sort-select"><ArrowDownWideNarrow size={16} /><select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Сортировка"><option value="popular">Сначала выбранное</option><option value="price-up">Сначала дешевле</option><option value="price-down">Сначала дороже</option></select><ChevronDown size={15} /></label>
              <span className="results-count">{shownProducts.length} товаров</span>
            </div>
          </div>
          <div className="category-row">
            <div className="category-pills">{categories.map((item) => <button key={item} className={`category-pill ${category === item ? 'selected' : ''}`} onClick={() => { setCategory(item); setFavoritesOnly(false); }}>{item}</button>)}</div>
            {(favoritesOnly || search) && <button className="clear-filter" onClick={() => { setFavoritesOnly(false); setSearch(''); }}>Сбросить фильтры <X size={14} /></button>}
          </div>
          {apiOnline === false && <div className="demo-notice"><span className="notice-point" /> Каталог открыт на демонстрационных данных. Для входа и заказа запустите backend из инструкции.</div>}
          <div className="product-grid">
            {shownProducts.map((product) => <ProductCard key={product.id} product={product} isFavorite={favorites.includes(product.id)} onFavorite={toggleFavorite} onAdd={addToCart} onOpen={setProductOpen} />)}
          </div>
          {shownProducts.length === 0 && <div className="empty-state"><span className="empty-state-icon"><Search size={24} /></span><h3>Ничего не нашлось</h3><p>Попробуйте другой запрос или выберите другую категорию.</p><button className="text-button" onClick={() => { setCategory('Все товары'); setFavoritesOnly(false); setSearch(''); }}>Показать все товары <ArrowRight size={16} /></button></div>}
          <div className="catalog-end"><span /><p>Ты посмотрел всё. Пока что.</p><span /></div>
        </section>

        <section className="closing-banner">
          <div className="closing-symbol"><BrandMark /></div>
          <div><span className="eyebrow">ХОРОШИЕ ВЕЩИ. ХОРОШИЙ ДЕНЬ.</span><h2>Меньше лишнего.<br /><em>Больше своего.</em></h2></div>
          <button className="light-button" onClick={jumpToCatalog}>Выбрать вещи <ArrowRight size={17} /></button>
          <span className="banner-decoration">N° 001</span>
        </section>
      </main>

      <footer className="site-footer" id="footer">
        <a className="brand footer-brand" href="#top"><BrandMark /><span>NORD</span></a>
        <p>Для дома, работы и хороших поводов.</p>
        <div className="footer-right"><span>Учебный проект · Тестовые заказы</span><a href="#top">Наверх ↑</a></div>
      </footer>

      {cartOpen && <div className="overlay drawer-overlay" onMouseDown={(event) => event.target === event.currentTarget && setCartOpen(false)}>
        <aside className="cart-drawer" role="dialog" aria-modal="true" aria-label="Корзина">
          <div className="drawer-heading"><div><span className="eyebrow">ВАШ ВЫБОР</span><h2>Корзина <span>({cartCount})</span></h2></div><button className="icon-button" onClick={() => setCartOpen(false)} aria-label="Закрыть корзину"><X size={21} /></button></div>
          {cartItems.length === 0 ? <div className="cart-empty"><span className="cart-empty-icon"><ShoppingBag size={27} /></span><h3>Пока здесь пусто</h3><p>Добавьте что-нибудь из каталога — хорошие вещи долго не задерживаются.</p><button className="primary-button full-button" onClick={() => { setCartOpen(false); jumpToCatalog(); }}>Перейти в каталог <ArrowRight size={16} /></button></div> : <>
            <div className="cart-items">{cartItems.map(({ product, quantity }) => <div className="cart-line" key={product.id}>
              <img src={product.imageUrl} alt={product.name} />
              <div className="cart-line-main"><span className="product-category">{product.category}</span><strong>{product.name}</strong><span className="cart-line-price">{money(product.price)}</span><div className="quantity-control"><button onClick={() => changeQuantity(product, -1)} aria-label="Уменьшить количество"><Minus size={13} /></button><span>{quantity}</span><button onClick={() => changeQuantity(product, 1)} aria-label="Увеличить количество"><Plus size={13} /></button></div></div>
              <button className="remove-line" onClick={() => setCart((current) => { const next = { ...current }; delete next[product.id]; return next; })} aria-label="Удалить товар"><X size={16} /></button>
            </div>)}</div>
            <form className="checkout-form" onSubmit={placeOrder}>
              <label>Адрес доставки<input value={address} onChange={(event) => setAddress(event.target.value)} placeholder="Город, улица, дом, квартира" minLength={5} maxLength={250} required /></label>
              <label>Комментарий <span className="optional">необязательно</span><textarea value={orderComment} onChange={(event) => setOrderComment(event.target.value)} placeholder="Например, позвонить за 10 минут" maxLength={500} rows={2} /></label>
              {!user && <div className="login-hint"><ShieldCheck size={16} /><span>Войдите под тестовым аккаунтом, чтобы оформить заказ.</span></div>}
              <div className="cart-summary"><span>Сумма заказа</span><strong>{money(cartTotal)}</strong></div>
              {cartTotal < 5000 && <p className="shipping-note">До бесплатной доставки осталось {money(5000 - cartTotal)}</p>}
              <button className="primary-button full-button" type="submit">{user ? 'Оформить заказ' : 'Войти и оформить'} <ArrowRight size={17} /></button>
              <p className="checkout-footnote">Демо-магазин. Реальная оплата не производится.</p>
            </form>
          </>}
        </aside>
      </div>}

      {loginOpen && <Dialog title="С возвращением" eyebrow="ВХОД В NORD" onClose={() => { setLoginOpen(false); setLoginError(''); }} extraClass="login-dialog">
        <p className="dialog-intro">Регистрация не нужна. Используйте один из тестовых аккаунтов ниже.</p>
        <div className="demo-accounts">
          <button type="button" className="demo-account" onClick={() => setLoginValues({ username: 'demo', password: 'demo123' })}><span className="account-avatar buyer-avatar">Д</span><span><strong>Покупатель</strong><small>demo / demo123</small></span><ChevronRight size={17} /></button>
          <button type="button" className="demo-account" onClick={() => setLoginValues({ username: 'manager', password: 'manager123' })}><span className="account-avatar manager-avatar">М</span><span><strong>Менеджер</strong><small>manager / manager123</small></span><ChevronRight size={17} /></button>
        </div>
        <form className="login-form" onSubmit={submitLogin}>
          <label>Логин<input autoComplete="username" value={loginValues.username} onChange={(event) => setLoginValues((current) => ({ ...current, username: event.target.value }))} required minLength={2} /></label>
          <label>Пароль<input type="password" autoComplete="current-password" value={loginValues.password} onChange={(event) => setLoginValues((current) => ({ ...current, password: event.target.value }))} required minLength={4} /></label>
          {loginError && <p className="form-error">{loginError}</p>}
          <button className="primary-button full-button" disabled={loginBusy} type="submit">{loginBusy ? 'Входим…' : 'Войти в аккаунт'} <ArrowRight size={17} /></button>
        </form>
        <p className="privacy-note"><ShieldCheck size={14} /> Аккаунты демонстрационные. Создать новый аккаунт нельзя.</p>
      </Dialog>}

      {accountOpen && user && <Dialog title="Ваш аккаунт" eyebrow="ЛИЧНЫЙ КАБИНЕТ" onClose={() => setAccountOpen(false)} extraClass="account-dialog">
        <div className="signed-in-card"><span className="account-avatar buyer-avatar"><Check size={20} /></span><div><strong>{user.displayName}</strong><span>@{user.username} · {user.role === 'Manager' ? 'Менеджер' : 'Покупатель'}</span></div><button className="text-button signout-button" onClick={signOut}>Выйти</button></div>
        <div className="orders-heading"><h3>История заказов</h3><span>{orders.length}</span></div>
        {ordersBusy ? <p className="orders-empty">Загружаем историю…</p> : orders.length === 0 ? <div className="orders-empty"><PackageCheck size={23} /><p>Здесь появятся ваши заказы после оформления.</p></div> : <div className="orders-list">{orders.map((order) => <article className="order-card" key={order.id}><div className="order-card-top"><strong>Заказ №{order.id}</strong><span>{new Date(order.createdAtUtc).toLocaleDateString('ru-RU')}</span></div><div className="order-card-bottom"><span>{order.items.reduce((sum, item) => sum + item.quantity, 0)} товаров · {order.status}</span><strong>{money(order.total)}</strong></div><p className="order-address">{order.deliveryAddress}</p></article>)}</div>}
      </Dialog>}

      {productOpen && <Dialog title={productOpen.name} eyebrow={productOpen.category.toUpperCase()} onClose={() => setProductOpen(null)} extraClass="product-dialog">
        <div className="product-detail"><img src={productOpen.imageUrl} alt={productOpen.name} /><div className="product-detail-copy"><p>{productOpen.description}</p><div className="detail-stock"><span className="stock-dot" /> В наличии: {productOpen.stock} шт.</div><strong>{money(productOpen.price)}</strong><button className="primary-button full-button" onClick={() => { addToCart(productOpen); setProductOpen(null); }}>Добавить в корзину <Plus size={17} /></button></div></div>
      </Dialog>}

      {toast && <div className="toast" role="status"><span><Check size={16} /></span>{toast}</div>}
      <button className="mobile-menu" aria-label="К каталогу" onClick={jumpToCatalog}><Menu size={20} /></button>
    </div>
  );
}
