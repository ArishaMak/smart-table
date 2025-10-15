import {createComparison, defaultRules} from "../lib/compare.js";

// @todo: #4.3 — настроить компаратор
const compare = createComparison(defaultRules);

// ФИЛЬТРАЦИЯ
export function initFiltering(elements) {
    const updateIndexes = (indexes) => {  // elements не нужны, так как indexes — это объект с ключами как имена элементов
        Object.keys(indexes).forEach((elementName) => {
            const select = elements[elementName];  // получаем select из замыкания elements
            if (select) {
                select.append(...Object.values(indexes[elementName]).map(name => {
                    const el = document.createElement('option');
                    el.textContent = name;
                    el.value = name;
                    return el;
                }));
            }
        });
    }

    const applyFiltering = (query, state, action) => {
        // код с обработкой очистки поля
        if (action && action.name === "clear") {
            const field = action.dataset?.field; // имя фильтра из data-field
            if (field) {
                // найти input/select в родительском контейнере кнопки
                const parent = action.closest('[data-filter]') || action.parentElement;
                const input = parent?.querySelector(`[name="${field}"]`);
                if (input) {
                    input.value = ""; // сброс в UI
                }
            }
        }
        // @todo: #4.5 — отфильтровать данные, используя компаратор
        const filter = {};
        Object.keys(elements).forEach(key => {
            const el = elements[key];
            if (el && ['INPUT', 'SELECT'].includes(el.tagName) && el.value) { // ищем поля ввода в фильтре с непустыми данными
                filter[`filter[${el.name}]`] = el.value; // чтобы сформировать в query вложенный объект фильтра
            }
        })

        return Object.keys(filter).length ? Object.assign({}, query, filter) : query; // если в фильтре что-то добавилось, применим к запросу
    }

    return {
        updateIndexes,
        applyFiltering
    }
}
