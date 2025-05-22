require("dotenv").config({path: "./config.env"});
const http = require("http");
const app = require("./app")
const connectDB = require("./config/db");
const cron = require('node-cron');
const winston = require('winston');
const logger = winston.createLogger({ transports: [new winston.transports.Console()] });


logger.info('Application started!');


cron.schedule('0 0 * * *', () => {
    console.log('Task runs every midnight');
});



const server = http.createServer(app);


connectDB();


const PORT = process.env.PORT || 9000;
server.listen(PORT, () => {
});

