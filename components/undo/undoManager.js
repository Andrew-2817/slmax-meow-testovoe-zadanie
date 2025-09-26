export class UndoManager {
    constructor(maxHistorySize = 50) {
        this.maxHistorySize = maxHistorySize;
        this.isUndoing = false;
        this.storageKey = 'kanban-undo-history';
        this.loadState();
    }

    static ActionTypes = {
        CREATE: 'create',
        UPDATE: 'update',
        MOVE: 'move',
        DELETE: 'delete'
    };

    // Загрузка состояния из localStorage
    loadState() {
        try {
            const savedState = localStorage.getItem(this.storageKey);
            if (savedState) {
                const state = JSON.parse(savedState);
                this.history = state.history || [];
                this.currentIndex = state.currentIndex !== undefined ? state.currentIndex : -1;
                
                // Валидация данных
                if (!Array.isArray(this.history)) {
                    this.history = [];
                    this.currentIndex = -1;
                }
                
                console.log('Undo history loaded:', this.history.length, 'actions');
            } else {
                this.history = [];
                this.currentIndex = -1;
            }
        } catch (error) {
            console.error('Error loading undo history:', error);
            this.history = [];
            this.currentIndex = -1;
        }
        
        this.updateUI();
    }

    // Сохранение состояния в localStorage
    saveState() {
        try {
            const state = {
                history: this.history,
                currentIndex: this.currentIndex,
                timestamp: Date.now(),
                version: '1.0'
            };
            
            localStorage.setItem(this.storageKey, JSON.stringify(state));
        } catch (error) {
            console.error('Error saving undo history:', error);
        }
    }

    // Очистка истории (например, при загрузке новых данных)
    clear() {
        this.history = [];
        this.currentIndex = -1;
        this.saveState();
        this.updateUI();
        console.log('Undo history cleared');
    }

    // Очистка истории при значительных изменениях данных
    clearOnMajorChange() {
        // Сохраняем только последние 5 действий при серьезных изменениях
        if (this.history.length > 5) {
            this.history = this.history.slice(-5);
            this.currentIndex = Math.min(this.currentIndex, 4);
        }
        this.saveState();
        this.updateUI();
    }

    addAction(type, data, reverseData) {
        if (this.isUndoing) return;

        // Удаляем действия после текущего индекса
        if (this.currentIndex < this.history.length - 1) {
            this.history = this.history.slice(0, this.currentIndex + 1);
        }

        const action = {
            type,
            data: this.sanitizeData(data),
            reverseData: this.sanitizeData(reverseData),
            timestamp: Date.now(),
            id: this.generateId()
        };

        this.history.push(action);
        this.currentIndex = this.history.length - 1;

        // Ограничиваем размер истории
        if (this.history.length > this.maxHistorySize) {
            this.history.shift();
            this.currentIndex--;
        }

        this.saveState(); // Сохраняем после каждого действия
        this.updateUI();
        
        console.log('Action added:', type, this.history.length, 'actions in history');
    }

    // Санитизация данных для хранения
    sanitizeData(data) {
        if (!data) return null;
        
        // Удаляем циклические ссылки и лишние данные
        return JSON.parse(JSON.stringify(data, (key, value) => {
            // Исключаем DOM элементы и функции
            if (value instanceof HTMLElement || typeof value === 'function') {
                return undefined;
            }
            return value;
        }));
    }

    // Генерация уникального ID для действия
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    undo() {
        if (this.currentIndex < 0) {
            console.log('Nothing to undo');
            return false;
        }

        this.isUndoing = true;

        const action = this.history[this.currentIndex];
        
        try {
            console.log('Undoing action:', action.type, action.data.title);
            
            switch (action.type) {
                case UndoManager.ActionTypes.CREATE:
                    this.reverseCreate(action);
                    break;
                case UndoManager.ActionTypes.UPDATE:
                    this.reverseUpdate(action);
                    break;
                case UndoManager.ActionTypes.MOVE:
                    this.reverseMove(action);
                    break;
                case UndoManager.ActionTypes.DELETE:
                    this.reverseDelete(action);
                    break;
            }

            this.currentIndex--;
            this.saveState(); // Сохраняем после undo
            this.updateUI();
            
            console.log('Undo successful, current index:', this.currentIndex);
            return true;
        } catch (error) {
            console.error('Undo failed:', error, action);
            return false;
        } finally {
            this.isUndoing = false;
        }
    }

    redo() {
        if (this.currentIndex >= this.history.length - 1) {
            console.log('Nothing to redo');
            return false;
        }

        this.currentIndex++;
        const action = this.history[this.currentIndex];

        this.isUndoing = true;

        try {
            console.log('Redoing action:', action.type, action.data.title);
            
            switch (action.type) {
                case UndoManager.ActionTypes.CREATE:
                    this.applyCreate(action);
                    break;
                case UndoManager.ActionTypes.UPDATE:
                    this.applyUpdate(action);
                    break;
                case UndoManager.ActionTypes.MOVE:
                    this.applyMove(action);
                    break;
                case UndoManager.ActionTypes.DELETE:
                    this.applyDelete(action);
                    break;
            }

            this.saveState(); // Сохраняем после redo
            this.updateUI();
            
            console.log('Redo successful, current index:', this.currentIndex);
            return true;
        } catch (error) {
            console.error('Redo failed:', error, action);
            this.currentIndex--; // Откатываем индекс при ошибке
            return false;
        } finally {
            this.isUndoing = false;
        }
    }

    // Методы для отмены действий (остаются без изменений)
    reverseCreate(action) {
        const data = this.loadData();
        const updatedData = data.filter(task => task.id !== action.data.id);
        this.saveData(updatedData);
    }

    reverseUpdate(action) {
        const data = this.loadData();
        const taskIndex = data.findIndex(task => task.id === action.reverseData.id);
        if (taskIndex !== -1) {
            data[taskIndex] = { ...action.reverseData };
            this.saveData(data);
        }
    }

    reverseMove(action) {
        const data = this.loadData();
        const taskIndex = data.findIndex(task => task.id === action.data.id);
        if (taskIndex !== -1) {
            data[taskIndex].status = action.reverseData.previousStatus;
            this.saveData(data);
        }
    }

    reverseDelete(action) {
        const data = this.loadData();
        data.push(action.reverseData);
        this.saveData(data);
    }

    // Методы для повтора действий (остаются без изменений)
    applyCreate(action) {
        const data = this.loadData();
        data.push(action.data);
        this.saveData(data);
    }

    applyUpdate(action) {
        const data = this.loadData();
        const taskIndex = data.findIndex(task => task.id === action.data.id);
        if (taskIndex !== -1) {
            data[taskIndex] = { ...action.data };
            this.saveData(data);
        }
    }

    applyMove(action) {
        const data = this.loadData();
        const taskIndex = data.findIndex(task => task.id === action.data.id);
        if (taskIndex !== -1) {
            data[taskIndex].status = action.data.newStatus;
            this.saveData(data);
        }
    }

    applyDelete(action) {
        const data = this.loadData();
        const updatedData = data.filter(task => task.id !== action.data.id);
        this.saveData(updatedData);
    }

    // Вспомогательные методы
    loadData() {
        const storedData = localStorage.getItem('kanban-board-data');
        return storedData ? JSON.parse(storedData) : [];
    }

    saveData(data) {
        localStorage.setItem('kanban-board-data', JSON.stringify(data));
    }

    updateUI() {
        const undoBtn = document.getElementById('undoBtn');
        const redoBtn = document.getElementById('redoBtn');

        if (undoBtn) {
            undoBtn.disabled = this.currentIndex < 0;
            const action = this.currentIndex >= 0 ? this.history[this.currentIndex] : null;
            undoBtn.title = action ? 
                `Отменить: ${this.getActionDescription(action)}` : 
                'Нечего отменять';
        }

        if (redoBtn) {
            redoBtn.disabled = this.currentIndex >= this.history.length - 1;
            const action = this.currentIndex < this.history.length - 1 ? 
                this.history[this.currentIndex + 1] : null;
            redoBtn.title = action ? 
                `Повторить: ${this.getActionDescription(action)}` : 
                'Нечего повторять';
        }
    }

    getActionDescription(action) {
        const descriptions = {
            [UndoManager.ActionTypes.CREATE]: `Создание "${action.data.title}"`,
            [UndoManager.ActionTypes.UPDATE]: `Редактирование "${action.data.title}"`,
            [UndoManager.ActionTypes.MOVE]: `Перемещение "${action.data.title}"`,
            [UndoManager.ActionTypes.DELETE]: `Удаление "${action.data.title}"`
        };
        return descriptions[action.type] || 'Действие';
    }

    // Методы для отладки и мониторинга
    getStats() {
        return {
            totalActions: this.history.length,
            currentIndex: this.currentIndex,
            canUndo: this.canUndo(),
            canRedo: this.canRedo(),
            lastAction: this.currentIndex >= 0 ? this.history[this.currentIndex] : null
        };
    }

    // Экспорт/импорт истории (для резервного копирования)
    exportHistory() {
        return JSON.stringify({
            history: this.history,
            currentIndex: this.currentIndex,
            exportDate: new Date().toISOString()
        }, null, 2);
    }

    importHistory(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            if (data.history && Array.isArray(data.history)) {
                this.history = data.history;
                this.currentIndex = data.currentIndex || -1;
                this.saveState();
                this.updateUI();
                return true;
            }
        } catch (error) {
            console.error('Error importing undo history:', error);
        }
        return false;
    }
}

export const undoManager = new UndoManager();