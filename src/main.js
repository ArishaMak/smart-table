import './fonts/ys-display/fonts.css'
import './style.css';

import {data as sourceData} from "./data/dataset_1.js";

import {initData} from "./data.js";
import {processFormData} from "./lib/utils.js";

import {initTable} from "./components/table.js";
import {initPagination} from "./components/pagination.js";
import {initSorting} from "./components/sorting.js";
import {initFiltering} from "./components/filtering.js";
import {initSearching } from "./components/searching.js";

// @todo: подключение

/* Исходные данные используемые в render()
const {data, ...indexes} = initData(sourceData); */
// создаём "мок-api"
const api = initData(sourceData);

/**
 * Сбор и обработка полей из таблицы
 * @returns {Object}
 */
function collectState() {
    const state = processFormData(new FormData(sampleTable.container));
    const rowsPerPage = parseInt(state.rowsPerPage) || 10; // fallback
    const page = parseInt(state.page ?? 1) || 1;
    return {
        ...state,
        rowsPerPage,
        page
    };
}

/**
 * Перерисовка состояния таблицы при любых изменениях
 * Асинхронная функция рендера таблицы
 * @param {HTMLButtonElement?} action
 */
// ОСНОВНОЙ ЦИКЛ РЕНДЕРА И ИНИЦИАЛИЗАЦИЯ КОМПОНЕНТОВ
async function render(action) {
    const state = collectState(); // вызов; собираем состояние формы
    /* let result = [...data]; // копируем для последующего изменения */
    let query = {}; // объект параметров для будущего запроса
    
    // другие apply*
    query = applySearching(query, state, action);
    query = applyFiltering(query, state, action);
    query = applySorting(query, state, action);
    query = applyPagination(query, state, action); // обновляем query
    
    // поиск
    // if (typeof applySearching === 'function') {
    // result = applySearching(result, state, action);
    // }

    // применяем фильтрацию раньше сортировки и пагинации
    // if (typeof applyFiltering === 'function') {
        // result = applyFiltering(result, state, action);
    // }

    // result = applySorting(result, state, action); // сортировка
    // result = applyPagination(result, state, action); // пагинация

    // получаем данные через api
    const { total, items } = await api.getRecords(query); // запрашиваем данные с собранными параметрами
    updatePagination(total, query); // перерисовываем пагинатор
    // рендерим таблицу (передаём items вместо result)
    sampleTable.render(items);
}

const sampleTable = initTable({
    tableTemplate: "table",
    rowTemplate: "row",
    before: ["search", "header", "filter"],
    after: ["pagination"], // реализация пагинации
}, render);
/*}, null);*/

// сортировка
const applySorting = initSorting([
    sampleTable.header.elements.sortByDate,
    sampleTable.header.elements.sortByTotal
]);

//новое. инициализация
const { applyPagination, updatePagination } = initPagination(
  sampleTable.pagination.elements,
  (el, page, isCurrent) => {
    const input = el.querySelector("input");
    const label = el.querySelector("span");
    input.value = page;
    input.checked = isCurrent;
    label.textContent = page;
    return el;
  }
);

// @todo: инициализация, вызов функции
// пагинация
const applyPagination = initPagination( // сохраняет функцию для пагинации, созданную в другом модуле, в константу
    sampleTable.pagination.elements, // передаём сюда элементы пагинации, найденные в шаблоне
    (el, page, isCurrent) => { // и колбэк (стрелочная функция), чтобы заполнять кнопки страниц данными
        // el - dom эл, предоставляющий страницу, page - номер страницы, isCurrent - булевое знач, указ явл ли стр текущей
        const input = el.querySelector('input');
        const label = el.querySelector('span');
        input.value = page; // value — свойство HTMLInputElement для установки значения радиобаттона.
        input.checked = isCurrent; // checked — свойство HTMLInputElement для установки состояния радиобаттона.
        label.textContent = page; // textContent — свойство HTMLElement для установки текста.
        return el;
    }
);

const applySorting = initSorting([
  sampleTable.header.elements.sortByDate,
  sampleTable.header.elements.sortByTotal,
]);

const { applyFiltering, updateIndexes } = initFiltering(
  sampleTable.filter.elements
);

// --- ПОИСК ---
const applySearching = initSearching("search");

// --- ФИЛЬТРАЦИЯ ---
// инициализируем фильтрацию, передаём элементы фильтра и набор индексов
/* const applyFiltering = initFiltering(sampleTable.filter.elements, {
    // пример: для поля searchBySeller используем индекс sellers
    searchBySeller: indexes.sellers,
    searchByCustomer: indexes.customers
}); */
/**
 * Асинхронная инициализация приложения
 */

const appRoot = document.querySelector("#app");
appRoot.appendChild(sampleTable.container);

/*const { applyFiltering, updateIndexes } = initFiltering(sampleTable.filter.elements);*/
async function init() {
    // получаем индексы (мок-запрос)
    const indexes = await api.getIndexes();
    updateIndexes(sampleTable.filter.elements, {
    searchBySeller: indexes.sellers,
  });
}
    // Заполняем <select> опциями на основе indexes
    /* Object.entries(indexes).forEach(([elementName, values]) => {
    const el = sampleTable.filter?.elements?.[elementName];
    if (!el) return;
        el.append(
            ...Object.values(values).map(name => {
                const opt = document.createElement('option');
                opt.value = name;
                opt.textContent = name;
                return opt;
            })
        );
    });*/
    /*updateIndexes(indexes);
    // вставляем таблицу в DOM
    const appRoot = document.querySelector('#app');
    appRoot.appendChild(sampleTable.container);
}*/

// --- Запуск приложения ---
// Сначала инициализация, затем рендер
init()
  .then(render)
  .catch(err => console.error('Ошибка при инициализации:', err));
