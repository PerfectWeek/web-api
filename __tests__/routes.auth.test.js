//
// Created by benar-g on 2018/05/12
//

const {exec} = require('child_process');

process.env = {
    ...process.env,
    'DB_HOST': '127.0.0.1',
    'DB_PORT': '5432',
    'DB_PASSWD': 'lol',
    'JWT_ENCODE_KEY': 'lel'
};

const app = require('../build/main');
let server;


describe('Testing auth', () => {

    beforeAll(async (done) => {
        exec('npm run postgres-run', (err, stdout, stderr) => {
            if (stdout) console.log(stdout);
            if (stderr) console.error(stderr);
            if (err)
                done(err);
            else {
                exec('npm run migration-up', (err, stdout, stderr) => {
                    if (stdout) console.log(stdout);
                    if (stderr) console.error(stderr);
                    if (err)
                        done(err);
                    else {
                        server = app.listen(9090, () => {
                            console.log('listening !');
                            done();
                        });
                    }
                });
            }
        })
    }, 600000);

    afterAll(async (done) => {
        exec('npm run postgres-down', (err, stdout, stderr) => {
            if (stdout) console.log(stdout);
            if (stderr) console.error(stderr);
            server.close();
            done(err);
        })
    }, 60000);

    describe('Testing login', () => {

        test('dummy', () => {
            expect(1).toEqual(1);
        })

    });

});
