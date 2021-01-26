module.exports = require('knex')({
    client: 'mysql',
    connection: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        timezone: 'GST'
    },
    useNullAsDefault: true,
    acquireConnectionTimeout: 300000
});

// const dbObject = {
//     user:process.env.DB_USER,
//     password:process.env.DB_PASSWORD,
//     host:process.env.DB_HOST,
//     port:process.env.DB_PORT,
//     name:process.env.DB_NAME,
// };

// const MongoClient = require('mongodb');
// const mongodbConnection = MongoDBConnectionString();
// const dbName = dbObject.name
// const ObjectId = require('mongodb').ObjectId;

// const RECONNECT_INTERVAL = 1000;
// const RECONNECT_TRIES = 100;
// const CONNECT_OPTIONS = {
//     // reconnectTries: RECONNECT_TRIES,
//     // reconnectInterval: RECONNECT_INTERVAL,
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//     poolSize: 8
// };
// var mongoConnectionTryinng = 0;

// function MongoDBConnectionString(){
//     let connectionURI = "mongodb://";
//     if(dbObject.user || dbObject.password){
//         connectionURI+=dbObject.user+":"+dbObject.password+"@";
//     }
//     connectionURI += dbObject.host+":"+dbObject.port+"/"+dbObject.name;
//     return connectionURI
// }

// const onClose = () => {
//     console.log('MongoDB connection was closed');
// };

// const onReconnect = () => {
//     for (let i = 0; i < reconnectTriesTimeoutArry.length; i++) {
//         clearTimeout(reconnectTriesTimeoutArry[i]);
//     }
//     reconnectTriesTimeoutArry = [];
//     global.eventEmitter.emit("dbConnected");
//     console.log('MongoDB reconnected');
// };
// var _db;
// var _client;
// var reconnectTriesTimeoutArry = [];
// const connectWithRetry = (callback) => {
//     MongoClient.connect(
//         mongodbConnection,
//         CONNECT_OPTIONS,
//         (err, client) => {
//             if (err) {
//                 reconnectTriesTimeoutArry.push(setTimeout(() => connectWithRetry(callback), RECONNECT_INTERVAL * RECONNECT_TRIES));
//             } else {
//                 _client = client;
//                 _db = client.db(dbName);
//                 _db.on('close', onClose);
//                 _db.on('reconnect', onReconnect);
//                 console.log('MongoDB connected successfully');
//                 callback();
//             }
//         }
//     );
// };

// module.exports = {
//     connectWithRetry,
//     getDB: function () {
//         return _db;
//     },
//     getClient: function () {
//         return _client;
//     },
//     connectDB: async function() {
//         console.log("Mongodb trying to connect:", mongoConnectionTryinng);
//         if (mongoConnectionTryinng == 0) {
//             mongoConnectionTryinng++;
//             var result = await new Promise((resolve, reject) => {
//                 connectWithRetry(async function (err) {
//                     mongoConnectionTryinng = 0;
//                     resolve(true);
//                 });
//             });
//             return result;
//         }
//     },
//     ObjectId:ObjectId
// }