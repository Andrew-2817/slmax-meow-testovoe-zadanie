export function parseMarkdown(text) {
    if (!text) return '';
    
    // Разрешенные теги и их атрибуты
    const allowedTags = {
        'strong': [],
        'em': [],
        'code': []
    };
    
    // Функция для очистки HTML
    const sanitizeHtml = (dirty) => {
        const temp = document.createElement('div');
        temp.innerHTML = dirty;
        
        // Удаляем все неразрешенные теги, оставляя только текст
        const nodes = temp.querySelectorAll('*');
        for (let node of nodes) {
            if (!allowedTags[node.tagName.toLowerCase()]) {
                node.parentNode.replaceChild(document.createTextNode(node.textContent), node);
            }
        }
        
        return temp.innerHTML;
    };
    
    // Экранирование HTML
    const escapeHtml = (unsafe) => {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    };
    
    let safeText = escapeHtml(text);
    
    // Применяем разметку только к экранированному тексту
    safeText = safeText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    safeText = safeText.replace(/_(.*?)_/g, '<em>$1</em>');
    safeText = safeText.replace(/`(.*?)`/g, '<code>$1</code>');
    
    // Дополнительная очистка на случай, если что-то пропустили
    return sanitizeHtml(safeText);
}