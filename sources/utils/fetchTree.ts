//
// Created by benard_g on 2018/06/02
//

import * as fs from 'fs';
import * as path from 'path';

export function fetchTree(directory_name: string): string[] {
    return fs.readdirSync(directory_name).reduce((files: string[], file: string) => {
        const name = path.join(directory_name, file);
        const is_directory = fs.statSync(name).isDirectory();
        return is_directory ? [...files, ...fetchTree(name)] : [...files, name];
    }, []);
}
