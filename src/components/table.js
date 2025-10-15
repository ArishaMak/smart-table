import {cloneTemplate} from "../lib/utils.js";
import {initFiltering} from "../components/filtering.js";

/**
 * Инициализирует таблицу и вызывает коллбэк при любых изменениях и нажатиях на кнопки
 *
 * @param {Object} settings
 * @param {(action: HTMLButtonElement | undefined) => void} onAction
 * @returns {{container: Node, elements: *, render: render}}
 */
export function initTable(settings, onAction) {
    const {tableTemplate, rowTemplate, before, after} = settings;
    const root = cloneTemplate(tableTemplate);

    // @todo: #1.2 —  вывести дополнительные шаблоны до и после таблицы
    // добавляем клонировнаные шаблоны до и после таблицы
    before.reverse().forEach((subName) => {  // выводим в обратном порядке
      root[subName] = cloneTemplate(subName); // клонируем и получаем объект, сохраняем в таблице
      root.container.prepend(root[subName].container); 
    });
    after.forEach((subName) => {
      root[subName] = cloneTemplate(subName);
      root.container.append(root[subName].container); // добавляем к таблице после (append) или до (prepend)
    });

    // шаг 4
    const applyFiltering = initFiltering(root.filter.elements);

    // @todo: #1.3 —  обработать события и вызвать onAction()
    // обработка событий 
    // метод addEventListener добавляет обработчик события change на элемент root.container
    root.container.addEventListener("change", () => onAction());
    root.container.addEventListener("submit", (e) => {
      e.preventDefault();
      onAction(e.submitter); // onAction — это коллбэк, переданный в initTable
    // передача e.submitter позволяет внешнему коду понять, какая кнопка была нажата, чтобы выполнить соответствующее действие
    });

    // настраиваем кнопку сброса для формы
    // ? - опциональная цепочка, предотовращает ошибку, если root.search или root.search.elements не сущ
    const resetBtn = root.search?.elements?.reset;
    if (resetBtn) { // если кнопка была найдена, ветвление будет выполнено
      resetBtn.addEventListener("click", (e) => { // добавляем слушателя на кнопку
        e.preventDefault(); // останавливаю стандартное поведение браузера для кнопок
        root.container.reset(); // сбросить все поля формы к начальным  значениям
        const sortBtns = [ // находит кнопки для сортировки
        root.header?.elements?.sortByDate,
        root.header?.elements?.sortByTotal,
        ].filter(Boolean); // убирает из списка все кнопки, которые не были найдены
        sortBtns.forEach((btn) => (btn.dataset.value = "none")); // проходит по всем найденным кнопкам сортировки и сбрасывает их состояние
        
        const firstPageRadio = // изем радио-кнопку, отвечающую за первую страницу
        root.pagination?.elements?.pages?.querySelector('input[name="page"]');
        if (firstPageRadio) firstPageRadio.checked = true; // пагинация (постраничная навигация)
        requestAnimationFrame(() => onAction()); // оптимизация и вызов функции, отвечающец за загр и отобр данных
      });
    }

    // функция для обновления содержимого таблицы, чтобы она показывала самую актуальную инфу
    const render = (data) => { // data — это массив, содержащий данные для каждой строки таблицы 
    // @todo: #1.1 — преобразовать данные в массив строк на основе шаблона rowTemplate
    const nextRows = data.map((item) => { // создание нового массива - nextRows
      // импортированная функция, которая клонирует шаблон строки и создает новый Дом эл
      const row = cloneTemplate(rowTemplate); // эта строка клонирует шаблон, создавая новый, пустой экземпляр строки таблицы.
      Object.keys(item).forEach((key) => { // проходим по каждому ключу в текущем объекте данных item 
        /* if (key in row.elements) { // объект содержащий ссылки на важные элементы шаблона
          /* const element = row.elements[key];
          // проверка на тип dom элемента, если это input/select, значение будет устанавливаться через value
            if (element.tagName === 'INPUT' || element.tagName === 'SELECT') {
              // value применяется к элементам формы
              element.value = item[key];
            } else {
              // textContent управляет видимым текстовым содержимым элемента, которое отображается на странице
              element.textContent = item[key];
            }
        }
      }); */
        if (key in row.elements) {
          row.elements[key].textContent = item[key];
        }
      });
      return row.container; 
    });
    root.elements.rows.replaceChildren(...nextRows); // контейнер в котороый будут вставляться строки табл
    // replaceChildren удаляет все существующие строки в этом контейнере и вставляет вместо них все новые строки, которые мы только что подготовили в массиве nextRows.
    };

  return { ...root, render }; 
}