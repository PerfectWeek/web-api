//
// Created by benard-g on 2018/10/08
//

//
// Remove duplicates entries in a list, keeping only the first occurrence
//
export function removeDuplicates(list: string[]) : string[] {
    let seenKeys: any = {};

    return list.filter(value => {
        if (seenKeys.hasOwnProperty(value)) {
            return false;
        }

        seenKeys[value] = true;
        return true;
    });
}
