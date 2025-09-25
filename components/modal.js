export let modalOpen

export function handleFormKeydown(event) {
    console.log('666666666666');
    
    // Enter сохраняет форму, но только если не в textarea
    if (event.key === 'Enter') {
        event.preventDefault();
        console.log('down');
        
        // Определяем, какая кнопка активна (сохранить или обновить)
        const saveBtn = document.querySelector('.save-btn');
        const updateBtn = document.querySelector('.update-btn');
        
        if (saveBtn.style.display !== 'none') {
            // Режим создания новой задачи
            document.getElementById('taskForm').dispatchEvent(new Event('submit'));
        } else if (updateBtn.style.display !== 'none') {
            // Режим редактирования - находим текущий обработчик и запускаем его
            const form = document.getElementById('taskForm');
            const submitEvent = new Event('submit', { cancelable: true });
            form.dispatchEvent(submitEvent);
        }
    }
    
    // Escape закрывает модалку
    if (event.key === 'Escape') {
        closeTaskModal();
    }
}

export function closeTaskModal() {
    const modal = document.getElementById('taskModal');
    modal.style.display = 'none';
    modal.hidden = true;
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
    modalOpen = false;
    
    // Убираем обработчики фокус-ловушки
    const form = document.getElementById('taskForm');
    form.removeEventListener('keydown', handleFormKeydown);
    
    modal.removeEventListener('keydown', trapFocus);
    
    // Возвращаем фокус на предыдущий элемент
    if (lastFocusedElement) {
        lastFocusedElement.focus();
    }

}
let lastFocusedElement = null;
// Функция для открытия модального окна
export function openTaskModalCreate() {
    const modal = document.getElementById('taskModal');
    modal.hidden = false;
    modal.querySelector('.save-btn').style.display = 'block'
    modal.querySelector('.update-btn').style.display = 'none'
    modal.style.display = 'flex';
    modal.setAttribute('aria-hidden', 'false');
                
    // Сохраняем элемент, который был в фокусе
    lastFocusedElement = document.activeElement;
    modalOpen = true;
    
    // Устанавливаем фокус на первый интерактивный элемент модалки
    const firstFocusableElement = modal.querySelector('input, textarea, button');
    if (firstFocusableElement) {
        firstFocusableElement.focus();
    }
    // Добавляем обработчик для Enter на форме
    const form = document.getElementById('taskForm');
    form.addEventListener('keydown', handleFormKeydown);
    // Добавляем обработчики для фокус-ловушки
    modal.addEventListener('keydown', trapFocus);
}

export function openTaskModalUpdate(){
    const modal = document.getElementById('taskModal');
    modal.style.display = 'flex';
    modal.querySelector('.update-btn').style.display = 'block'
    modal.querySelector('.save-btn').style.display = 'none'
    modal.setAttribute('aria-hidden', 'false');
    modal.hidden = false;
    lastFocusedElement = document.activeElement;
    modalOpen = true;
    
    document.getElementById('taskTitle').focus();
    
    // Добавляем обработчик для Enter на форме
    const form = document.getElementById('taskForm');
    form.addEventListener('keydown', handleFormKeydown);
    
}


// Функция-ловушка для фокуса в модальном окне
export function trapFocus(event) {
    const modal = document.getElementById('taskModal');
    const focusableElements = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    // Если нажат Tab
    if (event.key === 'Tab') {
        // Shift + Tab
        if (event.shiftKey) {
            if (document.activeElement === firstElement) {
                event.preventDefault();
                lastElement.focus();
            }
        } 
        // Tab
        else {
            if (document.activeElement === lastElement) {
                event.preventDefault();
                firstElement.focus();
            }
        }
    }
    
    // Escape для закрытия модалки
    if (event.key === 'Escape') {
        closeTaskModal();
    }
}