type AsyncFilterCallback<T> = (
    item: commonTypes.utils.AutoType<T>,
    index: number
) => Promise<boolean>;

export async function asyncFilter<T extends any[]>(
    source: T,
    cb: AsyncFilterCallback<T[number]>
): Promise<commonTypes.utils.AutoType<T>[]> {
    // Handle all promises
    const promises = await Promise.all(source.map(cb));

    // Filter
    return source.filter((_, index) => promises[index]);
}
