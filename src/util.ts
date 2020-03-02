export function removeItem<T>(array: T[], item: T): void {
    array = array.filter(i => i !== item);
}