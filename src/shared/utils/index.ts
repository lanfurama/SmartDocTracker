export const generateDocId = (departmentId: string, categoryId: string): string => {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = String(now.getFullYear()).slice(-2);
    const seq = String(Math.floor(Math.random() * 999) + 1).padStart(3, '0');
    return `${departmentId}-${categoryId}-${month}${year}-${seq}`;
};

export const formatTimestamp = (date: string | Date): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

export const formatTimeOnly = (date: string | Date): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit'
    });
};

export const hoursAgo = (date: string | Date): number => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60));
};
