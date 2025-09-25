class KanbanRouter {
    constructor() {
        this.routes = {
            '/board': this.showBoard.bind(this),
            '/task/:id': this.showTask.bind(this)
        };
        
        this.currentRoute = null;
        this.init();
    }
    
    init() {
        // Устанавливаем начальный путь если нет hash
        if (!window.location.hash) {
            window.location.hash = '#/board';
        }
        
        // Обработчик изменения URL
        window.addEventListener('hashchange', () => {
            this.handleRouteChange();
        });
        
        // Обработчик кнопки "Назад"
        window.addEventListener('popstate', () => {
            this.handleRouteChange();
        });
        
        // Первоначальная загрузка маршрута
        this.handleRouteChange();
    }
    
    handleRouteChange() {
        const hash = window.location.hash.substring(1) || '/board';
        this.navigate(hash, false);
    }
    
    navigate(path, addToHistory = true) {
        // Нормализуем путь
        if (!path.startsWith('/')) {
            path = '/' + path;
        }
        
        // Проверяем совпадение с маршрутами
        for (const route in this.routes) {
            const pattern = new RegExp('^' + route.replace(/:\w+/g, '([^/]+)') + '$');
            const match = path.match(pattern);
            
            if (match) {
                const params = match.slice(1);
                
                if (addToHistory && path !== this.currentRoute?.path) {
                    window.history.pushState({}, '', `#${path}`);
                }
                
                this.routes[route](...params);
                this.currentRoute = { path, params };
                return;
            }
        }
        
        // Если маршрут не найден - редирект на board
        this.navigate('/board', addToHistory);
    }
    
    showBoard() {
        this.closeTaskModal();
        this.removeCardHighlights();
        this.updateUIForBoard();
    }
    
    showTask(taskId) {
        const data = this.loadData();
        const task = data.find(t => t.id === parseInt(taskId));
        
        if (!task) {
            this.navigate('/board');
            return;
        }
        
        this.openTaskModal(task);
        this.highlightCard(taskId);
        this.updateUIForTaskView();
    }
    
    openTaskModal(task) {
        const modal = document.getElementById('taskModal');
        modal.removeAttribute('aria-hidden');
        modal.inert = false; // Разрешаем взаимодействие
        
        modal.style.display = 'flex';
        modal.hidden = false;
        // Определяем режим (просмотр или редактирование)
        const isEditMode = this.currentRoute.path.includes('/task') || 
        document.querySelector('.update-btn').style.display !== 'none';
        
        if (isEditMode) {
            // Режим редактирования
            modal.querySelector('.update-btn').style.display = 'block';
            modal.querySelector('.save-btn').style.display = 'none';
            modal.querySelector('.close-btn').style.display = 'block';
            document.getElementById('modal-title').textContent = 'Редактировать задачу';
        } else {
            // Режим просмотра
            modal.querySelector('.save-btn').style.display = 'none';
            modal.querySelector('.update-btn').style.display = 'none';
            modal.querySelector('.close-btn').style.display = 'block';
            document.getElementById('modal-title').textContent = 'Просмотр задачи';
        }
        
        // Заполняем форму данными задачи
        document.getElementById('taskId').value = task.id;
        document.getElementById('taskTitle').value = task.title;
        document.getElementById('taskDescription').value = task.description || '';
        
        modal.hidden = false;
        modal.style.display = 'flex';
        modal.setAttribute('aria-hidden', 'false');
        
        // setModalOpen(true);
        this.lastFocusedElement = document.activeElement;
        
        // Фокус на первом элементе
        const firstFocusable = modal.querySelector('input, textarea, button');
        if (firstFocusable) firstFocusable.focus();
        
        modal.addEventListener('keydown', this.trapFocus.bind(this));
    }
    
    closeTaskModal() {
        const modal = document.getElementById('taskModal');
        modal.inert = true; // Блокируем взаимодействие
        modal.style.display = 'none';
        modal.hidden = true;
        
        modal.removeEventListener('keydown', this.trapFocus.bind(this));
        
        if (this.lastFocusedElement) {
            this.lastFocusedElement.focus();
        }
    }
    
    // Метод для открытия редактирования (использует тот же маршрут /task/:id)
    openTaskEdit(task) {
        // Переходим на тот же маршрут, но активируем режим редактирования
        this.navigate(`/task/${task.id}`);
        
        // Устанавливаем режим редактирования в UI
        const modal = document.getElementById('taskModal');
        modal.querySelector('.update-btn').style.display = 'block';
        modal.querySelector('.save-btn').style.display = 'none';
        modal.querySelector('.close-btn').style.display = 'block';
        document.getElementById('modal-title').textContent = 'Редактировать задачу';
    }
    
    highlightCard(taskId) {
        this.removeCardHighlights();
        
        const card = document.querySelector(`[data-task-id="${taskId}"]`);
        if (card) {
            card.classList.add('task-card-highlighted');
            card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }
    
    removeCardHighlights() {
        document.querySelectorAll('.task-card-highlighted').forEach(card => {
            card.classList.remove('task-card-highlighted');
        });
    }
    
    updateUIForBoard() {
        document.querySelector('.add_task_button').style.display = 'block';
    }
    
    updateUIForTaskView() {
        document.querySelector('.add_task_button').style.display = 'none';
    }
    
    trapFocus(event) {
        const modal = document.getElementById('taskModal');
        const focusableElements = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length === 0) return;
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        if (event.key === 'Tab') {
            if (event.shiftKey) {
                if (document.activeElement === firstElement) {
                    event.preventDefault();
                    lastElement.focus();
                }
            } else {
                if (document.activeElement === lastElement) {
                    event.preventDefault();
                    firstElement.focus();
                }
            }
        }
        
        if (event.key === 'Escape') {
            this.navigate('/board');
        }
    }
    
    loadData() {
        // Ваша функция loadData
        const storedData = localStorage.getItem('kanban-board-data');
        if (storedData) {
            return JSON.parse(storedData);
        }
        return [];
    }
}

// Инициализация роутера
export const router = new KanbanRouter();