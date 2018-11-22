/**
 * @brief Remove duplicate entries in a list
 *
 * @param list The list to filter
 */
export function removeDuplicates(list: string[]) : string[] {
    let seenKeys = new Set<string>();

    return list.filter(value => {
        if (seenKeys.has(value)) {
            return false;
        }

        seenKeys.add(value);
        return true;
    });
}
