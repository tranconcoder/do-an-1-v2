/**
 * Function for throttling function calls to improve performance
 * @param func The function to throttle
 * @param limit The time limit in milliseconds
 * @returns A throttled version of the input function
 */
export function throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
): (...args: Parameters<T>) => void {
    let lastRan = 0;
    let lastFunc: ReturnType<typeof setTimeout> | null = null;

    return function (this: any, ...args: Parameters<T>): void {
        const now = Date.now();

        // If first time or enough time has elapsed, execute immediately
        if (now - lastRan >= limit) {
            if (lastFunc) {
                clearTimeout(lastFunc);
                lastFunc = null;
            }
            func.apply(this, args);
            lastRan = now;
            return;
        }

        // Otherwise, schedule to run at the end of the throttle period
        if (lastFunc) clearTimeout(lastFunc);

        lastFunc = setTimeout(() => {
            lastRan = Date.now();
            func.apply(this, args);
            lastFunc = null;
        }, limit - (now - lastRan));
    };
}
