export let currentSearchTerm = '';
export let currentFilter = 'all';
import { renderColumns } from "./columns.js";
const searchInput = document.querySelector('.kanban__search__add input')
searchInput.addEventListener("input", (e) => {
    let value = e.target.value
    currentSearchTerm = value;
    renderColumns();
})

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


// Функция для выделения текста поиска
export function highlightText(text, searchTerm) {
    if (!searchTerm) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '<span class="search-highlight">$1</span>');
}

// Функция для поиска задач
export function searchTasks(tasks, searchTerm) {
    if (!searchTerm) return tasks;
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    return tasks.filter(task => 
        task.title.toLowerCase().includes(lowerSearchTerm) || 
        (task.description && task.description.toLowerCase().includes(lowerSearchTerm))
    );
}
// Функция для фильтрации задач
export function filterTasks(tasks, filterType) {
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