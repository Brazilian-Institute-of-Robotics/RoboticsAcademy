const STORAGE_KEY = "CONTAINER_MANAGER_PORTS"


export function saveContainerManagerPorts(data) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
        console.error('Fail to save on localStorage:', err);
    }
}

export function getContainerManagerPorts() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch (err) {
        console.error('Fail to read localStorage:', err);
        return null;
    }
}

export function deleteContainerManagerPorts() {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
        console.error('Fail do delete localStorage:', err);
    }
}
