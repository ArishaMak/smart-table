/* import {rules, createComparison} from "../lib/compare.js"; */

// ПОИСК
export function initSearching(searchField) {
    /* // @todo: #5.1 — настроить компаратор
    const compare = createComparison([
        rules.skipEmptyTargetValues, // пропускаем пустые значения в state
        rules.searchMultipleFields(searchField, ['date', 'customer', 'seller'], false) 
        // searchField — имя поля в state
        // массив — список полей, по которым ищем
        // false — означает "без строгого совпадения" (можно частичное)
    ]);*/

    return (query, state, action) => { // result заменили на query
        return state[searchField] ? Object.assign({}, query, { // проверяем, что в поле поиска было что-то введено
            search: state[searchField], // устанавливаем в query параметр
        }) : query; // если поле с поиском пустое, просто возвращаем query без изменений
    } 
}
