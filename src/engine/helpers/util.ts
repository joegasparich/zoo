export function removeItem<T>(array: T[], item: T): void {
    array = array.filter(i => i !== item);
}

export function registerPixiInspector() {
    (window as any).__PIXI_INSPECTOR_GLOBAL_HOOK__ &&  (window as any).__PIXI_INSPECTOR_GLOBAL_HOOK__.register({ PIXI: PIXI });
}