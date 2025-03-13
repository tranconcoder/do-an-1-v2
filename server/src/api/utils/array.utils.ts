type ElementType<T> = T extends Array<infer U> ? U : never;
type AsyncFilterCallback<T> = (
	item: ElementType<T>,
	index: number
) => Promise<boolean>;

export async function asyncFilter<T extends any[]>(
	source: T,
	cb: AsyncFilterCallback<T>
): Promise<ElementType<T>[]> {
	// Handle all promises
	const promises = await Promise.all(source.map(cb));

	// Filter
	return source.filter((_, index) => promises[index]);
}
