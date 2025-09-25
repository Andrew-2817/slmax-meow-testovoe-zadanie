import { renderColumns } from "./components/columns.js";
import { createNewTask } from "./components/createTask.js";
import { closeTaskModal, modalOpen } from "./components/modal.js";
import { openTaskModalCreate } from "./components/modal.js";





// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', async function() {
    // Загружаем и отображаем данные
    await renderColumns();

    document.addEventListener('keydown', (e) => {
        // Escape закрывает модалку если она открыта
        if (e.key === 'Escape' && modalOpen) {
            closeTaskModal();
        }
    });

        // Устанавливаем основные ARIA атрибуты
    document.getElementById('taskModal').setAttribute('aria-labelledby', 'modal-title');
    
    // Обработчик для кнопки добавления задачи
    document.querySelector('.add_task_button').addEventListener('click', openTaskModalCreate);
    
    // Обработчик для кнопки отмены
    document.getElementById('cancelBtn').addEventListener('click', closeTaskModal);
    
    // Обработчик для кнопки добавления задачи
    document.querySelector('.add_task_button').addEventListener('click', openTaskModalCreate);
    
    // Обработчик для кнопки отмены
    document.getElementById('cancelBtn').addEventListener('click', closeTaskModal);
    
    // Обработчик для формы создания задачи
    document.getElementById('taskForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
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