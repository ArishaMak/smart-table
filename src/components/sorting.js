import {sortMap} from "../lib/sort.js";

// СОРТИРОВКА
export function initSorting(columns) {
    return (query, state, action) => {
        let field = null; // поле, по которому сортируем
        let order = null; // направление сортировки

        // проверка на клик пользователя по кнопке и действие связано с сортировкой
        if (action && action.name === 'sort') {
            // @todo: #3.1 — запомнить выбранный режим сортировки
            action.dataset.value = sortMap[action.dataset.value]; // переключаем состояние (none → asc → desc → none)
            
            /*const currentOrder = action.dataset.order || 'none'; текущее состояние сортировки у этой кнопки (data-order)
            const nextOrder = sortMap[currentOrder]; карта переходов: none -> asc -> desc -> none
            action.dataset.order = nextOrder; кнопка будет хранить рновое состояние сортировки */

            field = action.dataset.field; // берем имя по которому сортировать
            order = action.dataset.value;   // направление сортировки (asc / desc / none)

            // @todo: #3.2 — сбросить сортировки остальных колонок
            columns.forEach(column => {
                if (column.dataset.field !== action.dataset.field) {
                column.dataset.value = 'none'; // сброс для всех остальных
                }
            });
        } else {
            // когла новый render() вызывается без action
            // чтобы сортировка работала не только в момент клика, но и при каждой новой перерисовке таблицы
            // (при смене страницы пагинации либо при обновлении фильтров)
            // @todo: #3.3 — получить выбранный режим сортировки
            columns.forEach(column => { // перебирает все кнопки сортировки
                if (column.dataset.value !== 'none') { // ищем активную кнопку
                    field = column.dataset.field; // поле для сортировки
                    order = column.dataset.value; // сохраняем текущее направление сортировки
                }
            });
        }

        const sort = (field && order !== 'none') ? `${field}:${order}` : null; // сохраним в переменную параметр сортировки в виде field:direction

        return sort ? Object.assign({}, query, { sort }) : query; // по общему принципу, если есть сортировка, добавляем, если нет, то не трогаем query
    }
}
