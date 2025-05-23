// Augment the global Set interface with new Node.js 22 methods
declare global {
    interface Set<T> {
        // Returns a new Set with elements present in both this Set and the other Set
        intersection(other: Set<T>): Set<T>;

        // Returns a new Set with elements from this Set and the other Set
        union(other: Set<T>): Set<T>;

        // Returns a new Set with elements in this Set that are not in the other Set
        difference(other: Set<T>): Set<T>;

        // Returns a new Set with elements in either this Set or the other Set, but not both
        symmetricDifference(other: Set<T>): Set<T>;

        // Returns true if all elements of this Set are in the other Set
        isSubsetOf(other: Set<T>): boolean;

        // Returns true if this Set contains all elements of the other Set
        isSupersetOf(other: Set<T>): boolean;

        // Returns true if this Set has no elements in common with the other Set
        isDisjointFrom(other: Set<T>): boolean;

        // Existing methods (included for completeness, no change needed)
        add(value: T): this;
        has(value: T): boolean;
        delete(value: T): boolean;
        forEach(
            callbackfn: (value: T, key: T, set: Set<T>) => void,
            thisArg?: any
        ): void;
        [Symbol.iterator](): IterableIterator<T>;
        entries(): IterableIterator<[T, T]>;
        keys(): IterableIterator<T>;
        values(): IterableIterator<T>;
    }

    // No need to override the constructor unless you want custom behavior
    interface SetConstructor {
        new <T = any>(values?: readonly T[] | null): Set<T>;
        readonly prototype: Set<any>;
    }

    const Set: SetConstructor;
}

// Export an empty object to make this a module if needed
export {};
