const API_BASE = (import.meta.env.VITE_API_URL || 'https://api.vitaliy-armss.ru/nord-shop/api').replace(/\/$/, '');

export async function apiRequest(path, options = {}) {
  const { token, headers, ...rest } = options;
  const response = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers: {
      ...(rest.body != null ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  const payload = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error(payload?.message || payload?.title || 'Не удалось выполнить запрос.');
    error.status = response.status;
    throw error;
  }
  return payload;
}

export const demoProducts = [
  { id: 1, name: 'Наушники Studio One', description: 'Чистый звук и мягкие амбушюры для долгих поездок.', category: 'Электроника', price: 7490, imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=85', stock: 18, isFeatured: true },
  { id: 2, name: 'Настольная лампа Aura', description: 'Тёплый свет для спокойных вечеров и рабочего стола.', category: 'Для дома', price: 3290, imageUrl: 'https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=1000&q=85', stock: 12, isFeatured: true },
  { id: 3, name: 'Рюкзак Daily Form', description: 'Лаконичный городской рюкзак с отделением для ноутбука.', category: 'Аксессуары', price: 5190, imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1000&q=85', stock: 23, isFeatured: false },
  { id: 4, name: 'Кофейная пара Mono', description: 'Керамика ручной работы для любимого утреннего ритуала.', category: 'Для дома', price: 1590, imageUrl: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=1000&q=85', stock: 30, isFeatured: true },
  { id: 5, name: 'Колонка Move Mini', description: 'Компактная колонка с объёмным звучанием и защитой от брызг.', category: 'Электроника', price: 4290, imageUrl: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=1000&q=85', stock: 14, isFeatured: false },
  { id: 6, name: 'Бутылка Flow', description: 'Многоразовая бутылка из нержавеющей стали, 650 мл.', category: 'Аксессуары', price: 1290, imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=1000&q=85', stock: 40, isFeatured: false },
  { id: 7, name: 'Плед Soft Weekend', description: 'Мягкий фактурный плед для дома и неспешных выходных.', category: 'Для дома', price: 3890, imageUrl: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1000&q=85', stock: 9, isFeatured: true },
  { id: 8, name: 'Часы Field Watch', description: 'Сдержанный дизайн и удобный ремешок на каждый день.', category: 'Аксессуары', price: 8990, imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=85', stock: 7, isFeatured: false },
];
