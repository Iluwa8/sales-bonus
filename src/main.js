/**
 * Функция для расчета выручки
 * @param purchase запись о покупке
 * @param _product карточка товара
 * @returns {number}
 */
function calculateSimpleRevenue(arg1, arg2, arg3) {
    // если передали объект
    if (arg1 && typeof arg1 === 'object') {
        const { discount = 0, sale_price = 0, quantity = 0 } = arg1;
        const price = Number(sale_price) || 0;
        const qty = Number(quantity) || 0;
        const disc = Number(discount) || 0;
        return price * qty * (1 - disc / 100);
    }
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
    const {profit} = seller;

}

/**
 * Функция для анализа данных продаж
 * @param data
 * @param options
 * @returns {{revenue, top_products, bonus, name, sales_count, profit, seller_id}[]}
 */
function analyzeSalesData(data, options) {
    // @TODO: Проверка входных данных
    if (!data
        || !Array.isArray(data.sellers)
        || !Array.isArray(data.products)
        || !Array.isArray(data.purchase_records)
        || data.sellers.length === 0
    ) {
        throw new Error('Некорректные входные данные!');
    }

    const {calculateRevenue, calculateBonus} = options;

    // @TODO: Проверка наличия опций

    if (typeof calculateRevenue !== 'function' || typeof calculateBonus !== 'function') {
        throw new Error('Функции или функция опций не поределены!')
    }

    // @TODO: Подготовка промежуточных данных для сбора статистики

    const sellerStats = data.sellers.map (seller => ({
        id: seller.id,
        name: `${seller.first_name} ${seller.last_name}`,
        revenue: 0,
        profit: 0,
        sales_count: 0,
        products_sold: {}
    }));

    console.log('sellerStats');
    console.log(sellerStats);

    // @TODO: Индексация продавцов и товаров для быстрого доступа

    const sellerIndex = Object.fromEntries(sellerStats.map(item => [item.id, item]));

    console.log('sellerIndex');
    console.log(sellerIndex);

    const productIndex = Object.fromEntries(data.products.map(item => [item.sku, item]));

    console.log('productIndex')
    console.log(productIndex);  

    // @TODO: Расчет выручки и прибыли для каждого продавца

    data.purchase_records.forEach(record => {
        const seller = sellerIndex[record.seller_id];
        seller.sales_count += 1;
        seller.revenue += record.total_amount;


        record.items.forEach(item => {
            const product = productIndex[item.sku];
            const qnt = Number(item.quantity);
            const price = Number(product.purchase_price);
            const cost = qnt * price;
            const revenue = calculateRevenue(item);
            const profit = (Number(revenue)) - cost;
            seller.profit += profit; 

            if (!seller.products_sold[item.sku]) {
                seller.products_sold[item.sku] = 0;
            }
            seller.products_sold[item.sku] += qnt;
        });

        const sortedByProfit = sellerStats.sort((a, b) => a.profit - b.profit);
        sortedByProfit.forEach((seller, index) => {
            seller.bonus = calculateBonus(index, sortedByProfit.length, seller);
        });

    });

    // @TODO: Сортировка продавцов по прибыли

    // @TODO: Назначение премий на основе ранжирования

    // @TODO: Подготовка итоговой коллекции с нужными полями

    return sellerStats;
}
