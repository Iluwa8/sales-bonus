/**
 * Функция для расчета выручки
 * @param purchase запись о покупке
 * @param _product карточка товара
 * @returns {number}
 */
function calculateSimpleRevenue(purchase) {
    const { price, discount = 1 - (purchase.discount / 100), quantity } = purchase;
    return price * quantity * discount;
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

    if (index === 0) {
        return profit * 0.15;
    } else if (index === 1 || index === 2){
        return profit * 0.10;
    } else if (index === total - 1) {
        return 0;
    } else {
        return profit * 0.05;
    }

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
        // seller.revenue += record.total_amount;


        record.items.forEach(item => {
            const product = productIndex[item.sku];
            const qnt = Number(item.quantity);
            const price = Number(product.purchase_price);
            const cost = qnt * price;

            // const revenue = calculateRevenue({
            //     price: Number(item.price),         
            //     discount: Number(item.discount ?? 0),
            //     quantity: Number(item.quantity)
            // }, product);
            const revenue = calculateRevenue(item, product);
            seller.revenue += revenue;  

            const profit = revenue - cost;
            seller.profit += profit;

            if (!seller.products_sold[item.sku]) {
                seller.products_sold[item.sku] = 0;
            }
            seller.products_sold[item.sku] += qnt;
        });

    });

    const sortedByProfit = [...sellerStats].sort((a, b) => b.profit - a.profit);

    sortedByProfit.forEach((seller, index) => {
        seller.bonus = calculateBonus(index, sortedByProfit.length, seller);

        seller.top_products = Object
            .entries(seller.products_sold)
            .map(([sku, quantity]) => ({ sku, quantity }))
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 10);
    });

    return sellerStats;

    // @TODO: Сортировка продавцов по прибыли

    // @TODO: Назначение премий на основе ранжирования

    // @TODO: Подготовка итоговой коллекции с нужными полями

    return sellerStats;
}
