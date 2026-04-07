/**
 * Функция для расчета выручки
 * @param purchase запись о покупке
 * @param _product карточка товара
 * @returns {number}
 */
function calculateSimpleRevenue(purchase, _product) {
  // @TODO: Расчет выручки от операции
  // purchase — это одна из записей в поле items из чека в data.purchase_records
  // _product — это продукт из коллекции data.products
  const { discount, sale_price, quantity } = purchase;
}

/**
 * Функция для расчета бонусов
 * @param index порядковый номер в отсортированном массиве
 * @param total общее число продавцов
 * @param seller карточка продавца
 * @returns {number}
 */
function calculateBonusByProfit(index, total, seller) {
  // @TODO: Расчет бонуса от позиции в рейтинге
  const { profit } = seller;
}

/**
 * Функция для анализа данных продаж
 * @param data
 * @param options
 * @returns {{revenue, top_products, bonus, name, sales_count, profit, seller_id}[]}
 */
function analyzeSalesData(data, options) {
  // @TODO: Проверка входных данных
  CheckAllDataStuff(data);

  if (typeof options === "Object") throw new Error("options is not an object");

  const { calculateRevenue, calculateBonus } = options;

  // @TODO: Проверка наличия опций
  if (!calculateRevenue || !calculateBonus)
  {
    throw new Error("Some options are missing");
  }

  if (
    typeof calculateRevenue !== "function" ||
    typeof calculateBonus !== "function"
  )
  {
    throw new Error("Some options are not a functions");
  }

  // @TODO: Подготовка промежуточных данных для сбора статистики
  const sellerStats = data.sellers.map((seller) => ({
    id: seller.id,
    name: `${seller.first_name} ${seller.last_name}`,
    revenue: 0,
    profit: 0,
    sales_count: 0,
    products_sold: {},
  }));

  // return sellerStats;

  // @TODO: Индексация продавцов и товаров для быстрого доступа
  const sellerIndex = sellerStats.reduce((result, item) => ({
    ...result,
    [item.id] : item
  }), {})

  const productIndex = data.products.reduce((result, item) => ({
    ...result,
    [item.sku] : item
  }), {})

  return productIndex;

  // @TODO: Расчет выручки и прибыли для каждого продавца

  // @TODO: Сортировка продавцов по прибыли

  // @TODO: Назначение премий на основе ранжирования

  // @TODO: Подготовка итоговой коллекции с нужными полями
}

function CheckAllDataStuff(data) {
  if (
    !data ||
    !Array.isArray(data.customers) ||
    !Array.isArray(data.products) ||
    !Array.isArray(data.sellers) ||
    !Array.isArray(data.purchase_records) ||
    data.customers.length === 0 ||
    data.products.length === 0 ||
    data.sellers.length === 0 ||
    data.purchase_records.length === 0
  )
    throw new Error("Некорректные входные данные");
}

// В products_sold будем накапливать количество всех проданных товаров:
// ключ объекта — артикул товара;
// значение — количество, которое будет увеличиваться по мере обработки записей о продажах.

// Исходные данные представлены массивами, поэтому удобно преобразовать их в объекты или словари (Map) для быстрого доступа, чтобы постоянно не выполнять поиск.
