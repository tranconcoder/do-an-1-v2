export const sleep = async (ms: number) =>
    new Promise((resolve) => {
        setTimeout(resolve, ms);
    });

export const assertFulfilled = <T>(
    item: PromiseSettledResult<T>
): item is PromiseFulfilledResult<T> => {
    return item.status === 'fulfilled';
};

export const assertRejected = <T>(item: PromiseSettledResult<T>): item is PromiseRejectedResult => {
    return item.status === 'rejected';
};
