import {Connection, createConnection} from "typeorm";


const hostname : string = process.env.DB_HOST;
const password : string = process.env.DB_PASSWD;
const database : string = process.env.DB_NAME || "perfectweek";
const username : string = process.env.DB_USER || "perfectweek";
const port = parseInt(process.env.DB_PORT) || 5432;


export class DbConnection {

    private static dbConnection : Connection;

    private static connectionOptions : any = {
        type: 'postgres',
        host: hostname,
        port: port,
        username: username,
        password: password,
        database: database,
        synchronize: false,
        logging: false,
        entities: [
            __dirname.replace(/\\/g, "/") + "/../model/entity/*.js"
        ]
    };

    //
    // Look for an existing DbConnection and returns it
    // If not found, it creates one
    //
    public static async getConnection() : Promise<Connection> {
        if (!this.dbConnection) {
            this.dbConnection = await createConnection(this.connectionOptions);
        }

        return Promise.resolve(this.dbConnection);
    }
}
