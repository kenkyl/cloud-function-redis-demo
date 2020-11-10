/**
 * Responds to any HTTP request.
 *
 * @param {!express:Request} req HTTP request context.
 * @param {!express:Response} res HTTP response context.
 */

var redis = require('redis');

var redisHost = process.env.REDIS_HOST;
var redisPort = process.env.REDIS_PORT;
var redisPass = process.env.REDIS_PASS;

var redisClient = redis.createClient({host: redisHost, port: redisPort, password: redisPass});

const STREAMS_KEY = "cloudsql-stream";

exports.helloWorld = (req, res) => {
    var value = null
  
    redisClient.ping(function(err, reply) {
        if (err) throw err;
        value = reply;
    });

    res.status(200).send(value);
};