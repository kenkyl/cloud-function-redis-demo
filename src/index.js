/**
 * Responds to any HTTP request.
 *
 * @param {!express:Request} req HTTP request context.
 * @param {!express:Response} res HTTP response context.
 */

const redis = require('redis');
const mysql = require('mysql'); 

var redisHost = process.env.REDIS_HOST;
var redisPort = process.env.REDIS_PORT;
var redisPass = process.env.REDIS_PASS;

var sqlHost = process.env.SQL_HOST;
var sqlUser = process.env.SQL_USER;
var sqlPass = process.env.SQL_PASS;
var sqlDb = process.env.SQL_DB;

var redisClient = redis.createClient({host: redisHost, port: redisPort, password: redisPass});

var sqlClient = mysql.createConnection({
    host: sqlHost,
    user: sqlUser,
    password: sqlPass, 
    database: sqlDb 
});

sqlClient.connect();

exports.helloWorld = (req, res) => {
    var value = null
  
    redisClient.ping(function(err, reply) {
        if (err) throw err;
        value = reply;
    });

    sqlClient.query('SELECT 1 + 1 AS solution', function (error, results, fields) {
        if (error) throw error;
        console.log('The solution is: ', results[0].solution);
    });

    res.status(200).send(value);
};