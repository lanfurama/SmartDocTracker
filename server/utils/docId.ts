/**
 * Generate unique document ID: {department}-{category}-{MM}{YY}-{seq}
 */
export function generateDocId(departmentId: string, categoryId: string): string {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = String(now.getFullYear()).slice(-2);
    const seq = String(Math.floor(Math.random() * 999) + 1).padStart(3, '0');
    return `${departmentId}-${categoryId}-${month}${year}-${seq}`;
}
