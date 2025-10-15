import {getPages} from "../lib/utils.js";

// ПЕРЕКЛЮЧЕНИЕ СТРАНИЦ
export const initPagination = ({pages, fromRow, toRow, totalRows}, createPage) => {
    // @todo: #2.3 — подготовить шаблон кнопки для страницы и очистить контейнер
    // выводим кнопки пагинации и проверяем, что они работают
    const pageTemplate = pages.firstElementChild.cloneNode(true); // в качестве шаблона берём первый элемент из контейнера со страницами
    pages.firstElementChild.remove(); // и удаляем его (предполагаем, что там больше ничего, как вариант, можно и всё удалить из pages)
    
    let pageCount; // глобальная переменная для хранения количества страниц, которое отображалось при последней отрисовке

    // логика формирования параметров пагинации
    // функция вызывается до отправки запроса на сервер, чтобы добавить параметры page и limit (количество строк на страницу) в query.
    const applyPagination = (query, state, action) => {
        const limit = state.rowsPerPage;
        let page = state.page;

        // @todo: #2.6 — обработать действия
        if (action) switch(action.name) {
        case 'prev': page = Math.max(1, page - 1); break; // переход на предыдущую страницу
        case 'next': page = Math.min(pageCount, page + 1); break; // переход на следующую страницу
        case 'first': page = 1; break; // переход на первую страницу
        case 'last': page = pageCount; break; // переход на последнюю страницу
        }

        return Object.assign({}, query, {  // возвращаем обновлённый query
            limit,
            page,
        });
    }

    const updatePagination = (total, { page, limit }) => {
        pageCount = Math.ceil(total / limit);  // @todo: #2.1

        // @todo: #2.4 — получить список видимых страниц и вывести их
        const visiblePages = getPages(page, pageCount, 5); // получим массив страниц, которые нужно показать, выводим только 5 страниц
        pages.replaceChildren(...visiblePages.map(pageNumber => { // перебираем их и создаём для них кнопку
            const el = pageTemplate.cloneNode(true); // клонируем шаблон, который запомнили ранее
            return createPage(el, pageNumber, pageNumber === page); // вызываем колбэк из настроек, чтобы заполнить кнопку данными
        }))

        // @todo: #2.5 — обновить статус пагинации
        fromRow.textContent = (page - 1) * limit + 1; // c какой строки выводим
        toRow.textContent = Math.min((page * limit), total); // до какой строки выводим, если это последняя страница, то отображаем оставшееся количество
        totalRows.textContent = total; // сколько всего строк выводим на всех страницах вместе (после фильтрации будет меньше)
    }
    
    return {
        /*  @todo: #2.1 — посчитать количество страниц, объявить переменные и константы
        const rowsPerPage = state.rowsPerPage; // будем часто обращаться, чтобы короче записывать
        const pageCount = Math.ceil(data.length / rowsPerPage); // число страниц округляем в большую сторону
        let page = state.page; // страница переменной, потому что она может меняться при обработке действий позже
        
        ТЕПЕРЬ СРЕЗ НА СЕРВЕРЕ
        // @todo: #2.2 — посчитать сколько строк нужно пропустить и получить срез данных
        const skip = (page - 1) * rowsPerPage; // сколько строк нужно пропустить
        return data.slice(skip, skip + rowsPerPage); // получаем нужную часть строк (заменяем имеющийся return)
        /*return data.slice(0, 10);*/
        updatePagination,
        applyPagination
    }
}
