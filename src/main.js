import './fonts/ys-display/fonts.css'
import './style.css';

import {initData} from "./data.js";
import {processFormData} from "./lib/utils.js";

import {initTable} from "./components/table.js";
import {initPagination} from "./components/pagination.js";
import {initSorting} from "./components/sorting.js";
import {initFiltering} from "./components/filtering.js";
import {initSearching } from "./components/searching.js";

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
    let query = {}; // объект параметров для будущего запроса
    
    // применяем другие apply*
    query = applySearching(query, state, action);
    query = applyFiltering(query, state, action);
    query = applySorting(query, state, action);
    query = applyPagination(query, state, action); // обновляем query
    
    // получаем данные через api
    const { total, items } = await api.getRecords(query); // запрашиваем данные с собранными параметрами
    updatePagination(total, { page: state.page, limit: state.rowsPerPage }); // перерисовываем пагинатор
    // рендерим таблицу (передаём items вместо result)
    sampleTable.render(items);
}

const sampleTable = initTable({
    tableTemplate: "table",
    rowTemplate: "row",
    before: ["search", "header", "filter"],
    after: ["pagination"], // реализация пагинации
}, render);

// сортировка
const applySorting = initSorting([
    sampleTable.header.elements.sortByDate,
    sampleTable.header.elements.sortByTotal
]);

// пагинация
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

const { applyFiltering, updateIndexes } = initFiltering(
    sampleTable.filter.elements
);

// --- ПОИСК ---
const applySearching = initSearching("search");

// --- ФИЛЬТРАЦИЯ ---
// инициализируем фильтрацию, передаём элементы фильтра и набор индексов
/**
 * Асинхронная инициализация приложения
 */

const appRoot = document.querySelector("#app");
appRoot.appendChild(sampleTable.container);

async function init() {
    // получаем индексы (мок-запрос)
    const indexes = await api.getIndexes();
    updateIndexes({
        searchBySeller: indexes.sellers,
    });
}

// --- Запуск приложения ---
// Сначала инициализация, затем рендер
init()
  .then(render)
  .catch(err => console.error('Ошибка при инициализации:', err));