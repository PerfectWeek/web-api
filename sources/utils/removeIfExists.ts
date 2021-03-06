//
// Created by benard-g on 2018/10/08
//

//
// Remove an element form a list if it exists
// Leave the list unchanged if it wasn't
//
export function removeIfExists<T>(list: T[], toRemove: T): T[] {
    const idx = list.indexOf(toRemove);

    if (idx > -1) {
        list.splice(idx, 1);
    }

    return list;
}

export function removeIfExistsWithGetter<TKey, TObject>(
    list: TObject[],
    toRemove: TKey,
    keyGetter: (o: TObject) => TKey
): TObject[] {
    const idx = list
        .map(keyGetter)
        .indexOf(toRemove);

    if (idx > -1) {
        list.splice(idx, 1);
    }

    return list;
}
