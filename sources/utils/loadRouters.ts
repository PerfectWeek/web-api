//
// Created by benard_g on 2018/06/02
//

import * as Express from 'express';

import { fetchTree } from "./fetchTree";


function filesToRoutes(api_directory: string, files: string[]) {
    return files.map((file: string) => {
        // Replace all "\" with "/" on Windows
        const formatted_file = file.replace(/\\/g, "/");

        let route = formatted_file.substring(api_directory.length, formatted_file.lastIndexOf('/'));
        if (route.length === 0)
            route = '/';
        return { file: file, route: route}
    });
}


export function loadRouters(app: Express.Express, api_directory: string) {

    // Get routes and order them
    const routes = fetchTree(api_directory);
    const mapped_routes = filesToRoutes(api_directory, routes);
    mapped_routes.sort((route1, route2) => {
        if (route1.route < route2.route) return -1;
        if (route1.route > route2.route) return 1;
        return 0;
    });

    // Load the routes
    mapped_routes.forEach(({file, route}) => {
        const router: Express.Router = require("../../" + file).default;
        app.use(route, router);
        console.debug("Loaded: " + route);
    });
    console.debug('');
}
