import { renderColumns } from "./columns.js";
import { loadData, saveData } from "./store.js";

// Обработчики для перетаскивания
let draggedTask = null;

export function handleDragStart(e) {
    draggedTask = this;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
}

export function handleDragEnd() {
    this.classList.remove('dragging');
    draggedTask = null;
}

export function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
}

export async function handleDrop(e) {
    e.preventDefault();
    if (draggedTask) {
        const taskId = parseInt(draggedTask.dataset.taskId);
        const newStatus = this.closest('.kanban__column').dataset.status;
        
        // Обновляем статус задачи в данных
        const data = await loadData();
        const taskIndex = data.findIndex(task => task.id === taskId);
        
        if (taskIndex !== -1) {
            data[taskIndex].status = newStatus;
            saveData(data);
            renderColumns();
        }
    }
}