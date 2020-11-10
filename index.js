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

exports.createTable = (req, res) => {

    sqlClient.query("CREATE TABLE ENGAGED( DeviceID varchar(255), BranchId varchar(255), in_out varchar(255), timestamp varchar(255) )");

    res.status(200).send("Table Created");
}

exports.loadData = (req, res) => {
    for (let i = 0; i < thisMany; i++) {
        console.log(`\tCreating hash ${i}`);

        let deviceId = uuid.v4();
        let branchId = uuid.v4();

        redisClient.hmset(`engagements:${uuid.v1()}`, {
            'in_out': 'in',
            'deviceId': deviceId,
            'branchId': branchId,
            'timestamp': (new Date()).getTime()
        });

        redisClient.hmset(`engagements:${uuid.v1()}`, {
            'in_out': 'out',
            'deviceId': deviceId,
            'branchId': branchId,
            'timestamp': (new Date()).getTime() + Math.round(Math.random() * 900000) //some random time under 15 minutes later
        });
    }

    res.status(200).send("Successfully created " + thisMany);
}

exports.consumeData = (req, res) => {
    redisClient.keys('*', function(err, keys) {
        if (err) {
            console.error(err);
            res.status(500).send(err);
        } else {
            keys.forEach(function (key) {
                redisClient.hgetall(key, function(err, engagement) {
                    console.log(engagement);
                    let queryStr = `INSERT INTO ENGAGED (DeviceId, BranchId, in_out, timestamp) VALUES (\'${engagement.deviceId}\', \'${engagement.branchId}\', \'${engagement.in_out}\', \'${engagement.timestamp}\')`;
                    sqlClient.query(queryStr, function(err, result) {
                        if (err) {
                            console.error(err);
                            res.status(500).send(err);
                        } else {
                            console.log(`RESULT: ${result}`);
                        }
                    });
                });
            });
        }
    });
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