const redis = require('redis');
const mysql = require('mysql'); 
const uuid = require('uuid');

var redisHost = process.env.REDIS_HOST;
var redisPort = process.env.REDIS_PORT;
var redisPass = process.env.REDIS_PASS;

var sqlHost = process.env.SQL_HOST;
var sqlUser = process.env.SQL_USER;
var sqlPass = process.env.SQL_PASS;
var sqlDb = process.env.SQL_DB;

var thisMany = 1000;

var redisClient = redis.createClient({host: redisHost, port: redisPort, password: redisPass});

var sqlClient = mysql.createConnection({
    host: sqlHost,
    user: sqlUser,
    password: sqlPass, 
    database: sqlDb 
});

sqlClient.connect();


exports.loadData = (req, res) => {
    for (let i = 0; i <= thisMany; i++) {
        console.log(`\tCreating hash ${i}`);

        let deviceId = uuid.v4();
        let branchId = uuid.v4();

        redisClient.hset(uuid.v1(), {
            'in_out': 'in',
            'deviceId': deviceId,
            'branchId': branchId,
            'timestamp_in': (new Date()).getTime()
        });

        redisClient.hset(uuid.v1(), {
            'in_out': 'out',
            'timestamp_out': (new Date()).getTime() + Math.round(Math.random() * 900000) //some random time under 15 minutes later
        });
    }

    res.status(200).send("Successfully created " + thisMany);
}

exports.consumeData = (req, res) => {
    
}

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