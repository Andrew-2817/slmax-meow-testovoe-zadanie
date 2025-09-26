import { renderColumns } from "../view/columns.js";
import { loadData, saveData } from "../store.js";
import { UndoManager, undoManager } from "../undo/undoManager.js";

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
        
        const data = await loadData();
        const taskIndex = data.findIndex(task => task.id === taskId);
        
        if (taskIndex !== -1) {
            const oldStatus = data[taskIndex].status;
            
            // Сохраняем в историю ДО перемещения
            undoManager.addAction(
                UndoManager.ActionTypes.MOVE,
                {
                    id: taskId,
                    title: data[taskIndex].title,
                    newStatus: newStatus
                },
                {
                    id: taskId,
                    previousStatus: oldStatus
                }
            );
            
            data[taskIndex].status = newStatus;
            saveData(data);
            renderColumns();
        }
    }
}