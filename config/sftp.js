let Client = require('ssh2-sftp-client');
let sftp = new Client();
let config = require("./config.js");
let connectionObj = {
    host: config.sftp_host,
    port: config.sftp_port,
    username: config.sftp_username,
    password: config.sftp_password
};

module.exports.connect = function() {
    return sftp.connect(connectionObj);
}

module.exports.list = function (path) {
    return sftp.list(getSftpPath(path));
};

module.exports.get = function (remotePath, localPath) {
    return sftp.fastGet(getSftpPath(remotePath), localPath);
};

module.exports.put = function(localPath, remotePath) {
    return sftp.fastPut(localPath, getSftpPath(remotePath));
}

module.exports.exists = function(remotePath) {
    return sftp.exists(getSftpPath(remotePath));
}

module.exports.mkdir = function(remotePath) {
    return sftp.mkdir(getSftpPath(remotePath), true);
}

module.exports.delete = function(remotePath) {
    return sftp.delete(getSftpPath(remotePath))
}

module.exports.exit = function() {
    return sftp.end();
}

function getSftpPath(path) {
    return '/' +
    (process.env.NODE_ENV == 'prodAdmin' ? 'gemsprod' : '') +
        '/' + (path == undefined ? '' : path);
};