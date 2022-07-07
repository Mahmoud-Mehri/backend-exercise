const cluster = require('cluster');
const os = require('os');

const config = require('./config.json');

const app = require('./app.js');

const cpuCount = os.cpus().length;
const clustering = config.clustering;
const port = config.port || 3001;

function init() {
    try {
        app.listen(port, () => {
            console.log(
                `App Listening on Port ${port} | PID: ${process.pid}`
            );
        });
    } catch (error) {
        console.error(`An error occurred: ${JSON.stringify(error)}`);
        process.exit(1);
    }
}

if (clustering) {
    if (cluster.isPrimary) {
        for (let i = 0; i < cpuCount; i++) {
            cluster.fork()

            cluster.on('exit', (worker) => {
                console.log(`Worker process (${worker.process.pid}) died!`);
                cluster.fork();
            })
        }
    } else {
        init();
    }
} else {
    init();
}

module.exports = { app }