let seedData = []; // Будет заполнена из JSON
const STORAGE_KEY = 'kanban-board-data';
// Функция для загрузки seed данных из JSON файла
export async function loadSeedData() {
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
export async function loadData() {
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
export function saveData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}