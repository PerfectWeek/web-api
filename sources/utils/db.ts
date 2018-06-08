//
// Created by benard_g on 2018/06/03
//

import * as Knex from 'knex';

export let Db = Knex({
    client: 'pg',
    connection: {
        host: process.env.DB_HOST,
        user: 'postgres',
        password: process.env.DB_PASSWD,
        database: 'perfect_week'
    }
});

export class DbObject<T>
{
    public id: number;

    public created_at: Date;
    public updated_at: Date;

    public object: T;

    public constructor(id: number, object: T, created_at: Date, updated_at: Date) {
        this.id = id;
        this.object = object;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }
}
