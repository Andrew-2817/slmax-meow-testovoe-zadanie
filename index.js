const STORAGE_KEY = 'kanban-board-data';

// Переменные для поиска и фильтрации
let currentSearchTerm = '';
let currentFilter = 'all';
let seedData = []; // Будет заполнена из JSON

// Функция для загрузки seed данных из JSON файла
async function loadSeedData() {
    try {
        const response = await fetch('seed.json');
        if (!response.ok) {
            throw new Error('Не удалось загрузить seed.json');
        }
        return await response.json();
    } catch (error) {
        console.error('Ошибка загрузки seed данных:', error);
        // Возвращаем данные по умолчанию если файл не найден
        return [
            { id: 1, title: "Пример задачи", description: "Это пример задачи", status: "todo" }
        ];
    }
}

// Функция для загрузки данных
async function loadData() {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (storedData) {
        return JSON.parse(storedData);
    } else {
        // Если данных в localStorage нет, загружаем из seed.json
        const seedData = await loadSeedData();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(seedData));
        return seedData;
    }
}

const searchInput = document.querySelector('.kanban__search__add input')
searchInput.addEventListener("input", (e) => {
    let value = e.target.value
    currentSearchTerm = value;
    renderColumns();
})

// Функция для сохранения данных
function saveData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// Функция для парсинга разметки
function parseMarkdown(text) {
    if (!text) return '';
    
    // Заменяем **текст** на <strong>текст</strong>
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Заменяем _текст_ на <em>текст</em>
    text = text.replace(/_(.*?)_/g, '<em>$1</em>');
    
    // Заменяем `текст` на <code>текст</code>
    text = text.replace(/`(.*?)`/g, '<code>$1</code>');
    
    return text;
}

// Функция для выделения текста поиска
function highlightText(text, searchTerm) {
    if (!searchTerm) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '<span class="search-highlight">$1</span>');
}

// Функция для фильтрации задач
function filterTasks(tasks, filterType) {
    console.log(filterType);
    
    switch(filterType) {
        case 'no-description':
            return tasks.filter(task => !task.description || task.description.trim() === '');
        case 'large':
            return tasks.filter(task => task.description && task.description.length > 50);
        case 'all':
        default:
            return tasks;
    }
}

// Функция для поиска задач
function searchTasks(tasks, searchTerm) {
    if (!searchTerm) return tasks;
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    return tasks.filter(task => 
        task.title.toLowerCase().includes(lowerSearchTerm) || 
        (task.description && task.description.toLowerCase().includes(lowerSearchTerm))
    );
}

// Функция для создания карточки задачи
function createTaskCard(task) {
    const card = document.createElement('div');
    card.className = 'task-card';
    card.draggable = false;
    card.dataset.taskId = task.id;
    console.log(task);
    
    const title = document.createElement('div');
    title.className = 'task-title';

    // Добавляем подсветку поиска в заголовок
    if (currentSearchTerm) {
        title.innerHTML = highlightText(task.title, currentSearchTerm);
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
    
    // Добавляем обработчики для перетаскивания
    card.addEventListener('dragstart', handleDragStart);
    card.addEventListener('dragend', handleDragEnd);
    
    return card;
}

// Функция для отрисовки колонок
async function renderColumns() {
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

// Обработчики для перетаскивания
let draggedTask = null;

function handleDragStart(e) {
    draggedTask = this;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
}

function handleDragEnd() {
    this.classList.remove('dragging');
    draggedTask = null;
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
}

async function handleDrop(e) {
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

// Функция для открытия модального окна
function openTaskModalCreate() {
    const modal = document.getElementById('taskModal');
    modal.querySelector('.save-btn').style.display = 'block'
    modal.querySelector('.update-btn').style.display = 'none'
    modal.style.display = 'flex';
    document.getElementById('taskTitle').focus();
}

function openTaskModalUpdate(){
    const modal = document.getElementById('taskModal');
    modal.style.display = 'flex';
    modal.querySelector('.update-btn').style.display = 'block'
    modal.querySelector('.save-btn').style.display = 'none'
    document.getElementById('taskTitle').focus();
}

// Функция для закрытия модального окна
function closeTaskModal() {
    const modal = document.getElementById('taskModal');
    modal.style.display = 'none';
    document.getElementById('taskForm').reset();
}

// Функция для создания новой задачи
async function createNewTask(title, description) {
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

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', async function() {
    // Загружаем и отображаем данные
    await renderColumns();
    
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
    
    // Обработчики для фильтров
    document.querySelectorAll('.kanban__tab').forEach(tab => {
        tab.addEventListener('click', function() {
            // Убираем активный класс у всех вкладок
            document.querySelectorAll('.kanban__tab').forEach(t => t.classList.remove('active'));
            
            // Добавляем активный класс к текущей вкладке
            this.classList.add('active');
            
            // Устанавливаем текущий фильтр
            currentFilter = this.dataset.filter;
            renderColumns();
        });
    });
});