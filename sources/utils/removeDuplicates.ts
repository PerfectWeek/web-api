/**
 * @brief Remove duplicate entries in a list
 *
 * @param list The list to filter
 */
export function removeDuplicates<T>(list: T[]) : T[] {
    let seenKeys = new Set<T>();

    return list.filter(value => {
        if (seenKeys.has(value)) {
            return false;
        }

        seenKeys.add(value);
        return true;
    });
}

export function removeDuplicatesWithGetter<TKey, TObject>(
    list: TObject[],
    keyGetter: (o: TObject) => TKey
): TObject[] {
    let seenKeys = new Map<TKey, TObject>();

    return list.filter(o => {
        const key = keyGetter(o);
        if (seenKeys.has(key)) {
            return false;
        }

        seenKeys.set(key, o);
        return true;
    });
}
