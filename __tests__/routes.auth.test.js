const {exec} = require('child_process');
const newman = require('newman');

process.env = {
    ...process.env,
    'DB_HOST': '127.0.0.1',
    'DB_PORT': 2345,
    'DB_PASSWD': 'lol',
    'JWT_ENCODE_KEY': 'lel'
};

const MINUTE = 60000;
const TEST_API_PORT = 9090;

const app_loader = require('../build/sources/main');
let app;
let server;


describe('Testing auth', () => {

    beforeAll(async (done) => {
        console.log("Starting test Postgres");
        exec('npm run test-postgres-run', {env: process.env}, (err, stdout, stderr) => {
            if (stdout) console.log(stdout);
            if (stderr) console.error(stderr);
            if (err)
                done(err);
            else {
                console.log("Starting Migrations");
                exec('npm run migration-up', {env: process.env}, (err, stdout, stderr) => {
                    if (stdout) console.log(stdout);
                    if (stderr) console.error(stderr);
                    if (err)
                        done(err);
                    else {
                        console.log("Starting API");
                        app = app_loader();
                        server = app.listen(TEST_API_PORT, () => {
                            done();
                        });
                    }
                });
            }
        })
    }, 10 * MINUTE);

    afterAll(async (done) => {
        exec('npm run test-postgres-down', {env: process.env}, (err, stdout, stderr) => {
            if (stdout) console.log(stdout);
            if (stderr) console.error(stderr);
            server.close();
            done(err);
        })
    }, MINUTE);

    describe('Testing routes', () => {

        test('Run Newman Collection', (done) => {
            newman.run({
                collection: require('./routes.postman_collection'),
                environment: "./__tests__/routes.postman_environment.json",
                reporters: 'cli'
            }, function (err, summary) {
                if (err) { return done(err); }
                if (summary.run.failures.length) {
                    if (process.env.FAIL_LOG) {
                        const fs = require('fs');
                        fs.writeFileSync(process.env.FAIL_LOG, JSON.stringify(summary.run.failures, null, 4));
                    }
                    return done(new Error('Tests failed'));
                }
                done();
            });
        }, 10 * MINUTE)

    });

});
