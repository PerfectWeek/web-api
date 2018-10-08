const {exec} = require('child_process');
const newman = require('newman');

process.env = {
    ...process.env,
    'DB_HOST': '127.0.0.1',
    'DB_PORT': '5432',
    'DB_PASSWD': 'lol',
    'JWT_ENCODE_KEY': 'lel'
};

const MINUTE = 60000;
const TEST_API_PORT = 9090;

const app = require('../build/main');
let server;


describe('Testing auth', () => {

    beforeAll(async (done) => {
        exec('npm run test-postgres-run', (err, stdout, stderr) => {
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
                        server = app.listen(TEST_API_PORT, () => {
                            done();
                        });
                    }
                });
            }
        })
    }, 10 * MINUTE);

    afterAll(async (done) => {
        exec('npm run test-postgres-down', (err, stdout, stderr) => {
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
                    console.warn(JSON.stringify(summary.run.failures, null, 4));
                    return done(new Error('Tests failed'));
                }
                done();
            });
        })

    });

});
