export interface TimeslotPreferences {
    [key: string]: number[][],
};

/**
 * Weekly TimeslotPreferences (weeks start at sunday)
 */
export const baseTimeslotPreferences: TimeslotPreferences = {
    "party":
        [
            [10, 7, 5, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 3, 3, 3, 3],
            [3, 3, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 4, 8, 10, 10, 10, 10],
            [10, 10, 8, 7, 5, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 10, 10, 10, 10, 10, 10],
        ],
    "work": [
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 5, 10, 10, 10, 10, 10, 10, 10, 10, 10, 8, 3, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 5, 10, 10, 10, 10, 10, 10, 10, 10, 10, 8, 3, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 5, 10, 10, 10, 10, 10, 10, 10, 10, 10, 8, 3, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 5, 10, 10, 10, 10, 10, 10, 10, 10, 10, 8, 3, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 5, 10, 10, 10, 10, 10, 10, 10, 10, 10, 8, 3, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ],
    "hobby": [
            [1, 1, 1, 1, 1, 1, 1, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 3, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 5, 5, 5, 3, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 5, 5, 5, 3, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 5, 5, 5, 3, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 5, 5, 5, 3, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 5, 5, 5, 3, 1],
            [1, 1, 1, 1, 1, 1, 1, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 3, 1],
    ],
    "workout": [
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 3, 3, 1, 1, 1, 1, 5, 5, 5, 1, 1, 1, 10, 10, 8, 5, 1, 1],
            [1, 1, 1, 1, 1, 1, 3, 3, 1, 1, 1, 1, 5, 5, 5, 1, 1, 1, 10, 10, 8, 5, 1, 1],
            [1, 1, 1, 1, 1, 1, 3, 3, 1, 1, 1, 1, 5, 5, 5, 1, 1, 1, 10, 10, 8, 5, 1, 1],
            [1, 1, 1, 1, 1, 1, 3, 3, 1, 1, 1, 1, 5, 5, 5, 1, 1, 1, 10, 10, 8, 5, 1, 1],
            [1, 1, 1, 1, 1, 1, 3, 3, 1, 1, 1, 1, 5, 5, 5, 1, 1, 1, 10, 10, 8, 5, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 1, 1, 1, 1],
    ]
}
