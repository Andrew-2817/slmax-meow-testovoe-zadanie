import { loadData } from "./store.js";
import { createTaskCard } from "./createTask.js";
import { handleDrop, handleDragOver } from "./dragDrop.js";
import { filterTasks, currentFilter, searchTasks, currentSearchTerm } from "./search.js";
export async function renderColumns() {
    let data = await loadData();
    data = filterTasks(data, currentFilter);
    data = searchTasks(data, currentSearchTerm);
    const columns = document.querySelectorAll('.kanban__column');
    console.log(data);
    
    columns.forEach(column => {
        const status = column.dataset.status;
        const columnLine = column.querySelector('.kanban__column_tasks');
        console.log(status);
        
        // Очищаем колонку
        columnLine.textContent = '';
        
        // Фильтруем задачи по статусу
        const tasks = data.filter(task => task.status === status);
        
        if (tasks.length === 0) {
            const emptyMsg = document.createElement('div');
            emptyMsg.className = 'empty-column';
            emptyMsg.textContent = 'Нет задач';
            columnLine.appendChild(emptyMsg);
        } else {
            // Создаем карточки для каждой задачи
            tasks.forEach(task => {
                const card = createTaskCard(task);
                columnLine.appendChild(card);
            });
        }
        
        // Добавляем обработчики для перетаскивания
        columnLine.addEventListener('dragover', handleDragOver);
        columnLine.addEventListener('drop', handleDrop);
    });
}