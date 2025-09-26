import { renderColumns } from "./components/view/columns.js";
import { createNewTask } from "./components/view/createTask.js";
import { closeTaskModal, modalOpen } from "./components/ui/modal.js";
import { openTaskModalCreate } from "./components/ui/modal.js";
import { router } from "./components/router.js";
import { UndoManager, undoManager } from "./components/undo/undoManager.js";




// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', async function() {
    // Загружаем и отображаем данные
    await renderColumns();


    document.getElementById('undoBtn').addEventListener('click', () => {
        if (undoManager.undo()) {
            renderColumns();
        }
    });
    
    document.getElementById('redoBtn').addEventListener('click', () => {
        if (undoManager.redo()) {
            renderColumns();
        }
    });
    
    // Горячие клавиши Ctrl+Z и Ctrl+Y
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === 'z') {
            e.preventDefault();
            if (undoManager.undo()) {
                renderColumns();
            }
        }
        
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z') {
            e.preventDefault();
            if (undoManager.redo()) {
                renderColumns();
            }
        }
        
        if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
            e.preventDefault();
            if (undoManager.redo()) {
                renderColumns();
            }
        }
    });

    document.addEventListener('keydown', (e) => {
        // Escape закрывает модалку если она открыта
        if (e.key === 'Escape' && modalOpen) {
            closeTaskModal();
        }
    });

    document.getElementById('cancelBtn').addEventListener('click', () => {
        router.navigate('/board');
    });

    document.getElementById('closeModalBtn').addEventListener('click', () => {
        console.log('3333');
        
    router.navigate('/board');
    });

        // Устанавливаем основные ARIA атрибуты
    document.getElementById('taskModal').setAttribute('aria-labelledby', 'modal-title');
    
    // Обработчик для кнопки добавления задачи
    document.querySelector('.add_task_button').addEventListener('click', openTaskModalCreate);
    
    // Обработчик для кнопки отмены
    document.getElementById('cancelBtn').addEventListener('click', closeTaskModal);
    
    // Обработчик для кнопки отмены
    document.getElementById('cancelBtn').addEventListener('click', closeTaskModal);
    
    // Обработчик для формы создания задачи
    document.getElementById('taskForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        router.navigate('/board');
        if(document.querySelector('.save-btn').style.display === 'none'){
            return;
        }
        
        const title = document.getElementById('taskTitle').value.trim();
        const description = document.getElementById('taskDescription').value.trim();
        
        if (title) {
            await createNewTask(title, description);
            closeTaskModal();
        } else {
            alert('Пожалуйста, введите заголовок задачи');
        }
    });
    
    // Закрытие модального окна при клике вне его
    document.getElementById('taskModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeTaskModal();
        }
    });
    

});