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
  const discountX = 1 - purchase.discount / 100;
  return sale_price * quantity * discountX;
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
  let bonus = 0.05;
  if (index === 0) {
    bonus = 0.15;
  } else if (index === 1 || index === 2) {
    bonus = 0.1;
  } else if (index === total - 1) {
    bonus = 0;
  }
  return profit * (bonus);
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
  if (!calculateRevenue || !calculateBonus) {
    throw new Error("Some options are missing");
  }

  if (
    typeof calculateRevenue !== "function" ||
    typeof calculateBonus !== "function"
  ) {
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
  const sellerIndex = sellerStats.reduce(
    (result, item) => ({
      ...result,
      [item.id]: item,
    }),
    {},
  );

  const productIndex = data.products.reduce(
    (result, item) => ({
      ...result,
      [item.sku]: item,
    }),
    {},
  );

  // @TODO: Расчет выручки и прибыли для каждого продавца

  data.purchase_records.forEach((record) => {
    // Чек
    const seller = sellerIndex[record.seller_id]; // Продавец
    // Увеличить количество продаж
    seller.sales_count++;
    // Увеличить общую сумму выручки всех продаж
    seller.revenue += record.total_amount;

    // Расчёт прибыли для каждого товара
    record.items.forEach((item) => {
      const product = productIndex[item.sku]; // Товар
      // Посчитать себестоимость (cost) товара как product.purchase_price, умноженную на количество товаров из чека
      let cost = product.purchase_price * item.quantity;
      // Посчитать выручку (revenue) с учётом скидки через функцию calculateRevenue
      let revenue = calculateRevenue(item, product);
      // Посчитать прибыль: выручка минус себестоимость
      let finValue = revenue - cost;
      // Увеличить общую накопленную прибыль (profit) у продавца
      seller.profit += finValue;

      // Учёт количества проданных товаров
      if (!seller.products_sold[item.sku]) {
        seller.products_sold[item.sku] = 0;
      }
      // По артикулу товара увеличить его проданное количество у продавца
      seller.products_sold[item.sku] += item.quantity;
    });
  });

  // @TODO: Сортировка продавцов по прибыли
  sellerStats.sort((a, b) => b.profit - a.profit);

  // @TODO: Назначение премий на основе ранжирования
  sellerStats.forEach((seller, index) => {
    seller.bonus = calculateBonus(index, sellerStats.length, seller); // Считаем бонус

    let arrSki = Object.entries(seller.products_sold);
    let mapRes = arrSki.map((item) => ({
      sku: item[0],
      quantity: item[1],
    }));
    mapRes.sort((a, b) => b.quantity - a.quantity);
    let mapSliced = mapRes.slice(0, 10);
    seller.top_products = mapSliced; // Формируем топ-10 товаров
  });

  // @TODO: Подготовка итоговой коллекции с нужными полями

  return sellerStats.map((seller) => ({
    seller_id: seller.id, // Строка, идентификатор продавца
    name: seller.name, // Строка, имя продавца
    revenue: +seller.revenue.toFixed(2), // Число с двумя знаками после точки, выручка продавца
    profit: +seller.profit.toFixed(2), // Число с двумя знаками после точки, прибыль продавца
    sales_count: seller.sales_count, // Целое число, количество продаж продавца
    top_products: seller.top_products, // Массив объектов вида: { "sku": "SKU_008","quantity": 10}, топ-10 товаров продавца
    bonus: +seller.bonus.toFixed(2), // Число с двумя знаками после точки, бонус продавца
  }));
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
