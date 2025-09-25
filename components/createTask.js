import { highlightText } from "./search.js";
import { saveData, loadData } from "./store.js";
import { renderColumns } from "./columns.js";
import { parseMarkdown } from "./utils.js";
import { currentSearchTerm } from "./search.js";
import { closeTaskModal } from "./modal.js";
import { handleDragEnd, handleDragStart } from "./dragDrop.js";
import { openTaskModalUpdate } from "./modal.js";

export async function createNewTask(title, description) {
    const data = await loadData();

    // Генерируем новый ID
    const newId = data.length > 0 ? Math.max(...data.map(task => task.id)) + 1 : 1;
    
    // Создаем новую задачу
    const newTask = {
        id: newId,
        title: title,
        description: description,
        status: 'todo'
    };
    
    // Добавляем задачу в данные
    data.push(newTask);
    saveData(data);
    
    // Перерисовываем колонки
    renderColumns();
}

// Функция для создания карточки задачи
export function createTaskCard(task) {
    const card = document.createElement('div');
    card.className = 'task-card';
    card.draggable = false;
    card.dataset.taskId = task.id;
    card.tabIndex = 0; // Делаем карточку фокусируемой
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `Задача: ${task.title}. ${task.description || 'Нет описания'}. Статус: ${getStatusText(task.status)}`);
    
    const title = document.createElement('div');
    title.className = 'task-title';

    // Добавляем подсветку поиска в заголовок
    if (currentSearchTerm) {
        title.insertAdjacentHTML('beforeend', highlightText(task.title, currentSearchTerm))
    } else {
        title.textContent = task.title;
    }
    
    const description = document.createElement('div');
    description.className = 'task-description';
    
    // Добавляем подсветку поиска в описание
    if (task.description) {
        if (currentSearchTerm) {
            description.insertAdjacentHTML('beforeend', highlightText(parseMarkdown(task.description), currentSearchTerm));
        } else {
            description.insertAdjacentHTML('beforeend', parseMarkdown(task.description));
        }
    }
    
    const actions = document.createElement('div')
    actions.className  ='tack__actions'
    actions.insertAdjacentHTML('beforeend', `<img class="tack__action__delete" src="/img/icons8-мусор.svg" alt="">
    <img class="tack__action__edit" src="/img/edit-alt.svg" alt="">
    <img class="tack__action__translate" src="/img/move-outline.svg" alt="">
    `)
    card.appendChild(title);
    card.appendChild(description);
    card.appendChild(actions)

    // обработчик для кнопки изменения
    const editTask = actions.querySelector('.tack__action__edit')
    editTask.addEventListener('click', async () => {
    openTaskModalUpdate()
    
    // Заполняем форму
    document.querySelector('.form-group input').value = task.title
    document.querySelector('.form-group textarea').value = task.description
    
    // Временный обработчик для редактирования
    const handleEditSubmit = async (e) => {
        e.preventDefault()
        
        const title = document.querySelector('.form-group input').value.trim()
        console.log(title);
        
        const description = document.querySelector('.form-group textarea').value.trim()
        
        // Проверяем, что заголовок не пустой
        if (!title) {
            alert('Пожалуйста, введите заголовок задачи')
            return
        }
        
        const data = await loadData()
        const taskIndex = data.findIndex(el => el.id === task.id)
        
        if (taskIndex !== -1) {
            data[taskIndex] = { 
                ...data[taskIndex], 
                title: title, 
                description: description // description может быть пустым
            }
            saveData(data)
            renderColumns()
            closeTaskModal()
            
            // Удаляем временный обработчик
            document.getElementById('taskForm').removeEventListener('submit', handleEditSubmit)
        }
    }
    
    // Удаляем старый и добавляем новый обработчик
    document.getElementById('taskForm').removeEventListener('submit', handleEditSubmit)
    document.getElementById('taskForm').addEventListener('submit', handleEditSubmit)
    })
    
    // Обработчик для кнопки удаления
    const deleteTask = actions.querySelector('.tack__action__delete')
    deleteTask.addEventListener('click', async () => {
        const data = await loadData();
        const filteredData = data.filter((el) => el.id !== task.id)
        console.log(filteredData);
        saveData(filteredData)
        renderColumns()
    })
    
    // Обработчик для кнопки перетаскивания
    const translateBtn = actions.querySelector('.tack__action__translate');
    translateBtn.addEventListener('click', function() {
        card.draggable = !card.draggable;
        if (card.draggable) {
            card.style.cursor = 'move';
            card.style.boxShadow = '0 0 0 2px #3498db';
            translateBtn.style.opacity = '1';
        } else {
            card.style.cursor = 'default';
            card.style.boxShadow = '';
            translateBtn.style.opacity = '0.6';
        }
    });

    card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            // Активируем режим перетаскивания при нажатии Enter/Space
            translateBtn.click();
        }
    });
    
    // Добавляем обработчики для перетаскивания
    card.addEventListener('dragstart', handleDragStart);
    card.addEventListener('dragend', handleDragEnd);
    
    return card;
}

function getStatusText(status) {
    const statusMap = {
        'todo': 'К выполнению',
        'in-progress': 'В процессе',
        'done': 'Выполнено'
    };
    return statusMap[status] || status;
}