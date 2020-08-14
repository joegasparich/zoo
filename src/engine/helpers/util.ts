export function removeItem<T>(array: T[], item: T): void {
    const index = array.indexOf(item);
    if (index > -1) {
        array = array.splice(index, 1);
    }
}

export function registerPixiInspector(): void {
    (window as any).__PIXI_INSPECTOR_GLOBAL_HOOK__ &&  (window as any).__PIXI_INSPECTOR_GLOBAL_HOOK__.register({ PIXI: PIXI });
}
