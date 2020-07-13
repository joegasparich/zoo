export function removeItem<T>(array: T[], item: T): T[] {
    const index = array.indexOf(item);
    if (index > -1) {
        array.splice(index, 1);
    }
    return array;
}

export function registerPixiInspector(): void {
    (window as any).__PIXI_INSPECTOR_GLOBAL_HOOK__ &&  (window as any).__PIXI_INSPECTOR_GLOBAL_HOOK__.register({ PIXI: PIXI });
}
