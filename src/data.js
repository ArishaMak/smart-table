import {makeIndex} from "./lib/utils.js";

// Константа с адресом сервера
const BASE_URL = 'https://webinars.webdev.education-services.ru/sp7-api'; 

// функция инициализации данных
export function initData() {
    // переменные для кеширования данных, объявленные в замыкании initData
    let sellers; // Будет хранить индексированных продавцов после первого запроса
    let customers; // Будет хранить индексированных покупателей после первого запроса
    let lastResult; // Будет хранить результат последнего успешного запроса записей
    let lastQuery; // Будет хранить строковое представление параметров последнего запроса
    
    // функция для приведения строк в тот вид, который нужен нашей таблице
    // Использует внешние переменные 'sellers' и 'customers' для подстановки имен
    const mapRecords = (data) => data.map(item => ({
        id: item.receipt_id,
        date: item.date,
        // seller/customer IDs заменяются на имена, используя кешированные индексы
        seller: sellers[item.seller_id], 
        customer: customers[item.customer_id],
        total: item.total_amount
    }));

    // return {sellers, customers, data};
    // временный мок api; возвращает индексы (имитация запроса на сервер)
    // функция получения индексов
    const getIndexes = async () => {
    if (!sellers || !customers) { // если индексы ещё не установлены, то делаем запросы
        [sellers, customers] = await Promise.all([ // запрашиваем и деструктурируем в уже объявленные ранее переменные
            fetch(`${BASE_URL}/sellers`).then(res => res.json()), // запрашиваем продавцов
            fetch(`${BASE_URL}/customers`).then(res => res.json()), // запрашиваем покупателей
        ]);
    }

    return { sellers, customers };
    }
    // возвращает список записей (имитация запроса на сервер)
    // функция получения записей о продажах с сервера
    const getRecords = async (query, isUpdated = false) => {
        const qs = new URLSearchParams(query); // преобразуем объект параметров в SearchParams объект, представляющий query часть url
        const nextQuery = qs.toString(); // и приводим к строковому виду

        if (lastQuery === nextQuery && !isUpdated) { // isUpdated параметр нужен, чтобы иметь возможность делать запрос без кеша
            return lastResult; // если параметры запроса не поменялись, то отдаём сохранённые ранее данные
        }

        // если прошлый квери не был ранее установлен или поменялись параметры, то запрашиваем данные с сервера
        const response = await fetch(`${BASE_URL}/records?${nextQuery}`);
        const records = await response.json();

        lastQuery = nextQuery; // сохраняем для следующих запросов
        lastResult = {
            total: records.total,
            items: mapRecords(records.items)
        };

        return lastResult;
    };

    return {
        getIndexes,
        getRecords
    }; 
}
