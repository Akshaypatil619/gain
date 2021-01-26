process.on('uncaughtException', function (err) {
    console.error(err);
    console.log("Node NOT Exiting...");
});

require('dotenv').config();

let path = require("path");
global.appRoot = path.resolve(__dirname + "/");
let express = require('express');
let app = express();
var logger = require('morgan');
app.use(logger('dev'));
let express_validator = require("express-validator");
let bodyParser = require('body-parser');
let environment = require("./config/environment.js");
const os = require('os');

/**************** Set global cron jobs array ****************/
global.cron_jobs = [];

let config = require("./config/config.js");

console.log('Application environment', config.app_env)

/* if (config.app_env != 'development' && config.app_env != 'prodApi' && config.app_env != 'uatApi') {
    require('./config/frontend_servers/adminServer')();
    require('./config/frontend_servers/oamServer')();
    require('./config/frontend_servers/ownerServer')();
} */

let cors = require('cors');
let knex = require("./config/knex");
let knexLogger = require('knex-logger');
app.use(knexLogger(knex));
global.db_driver = config.db_driver == undefined ? "mysql" : config.db_driver;
const fileUpload = require('express-fileupload');
let Common_functions = require("./src/core/common_functions.js");
let common_functions = new Common_functions();
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: false, limit: '50mb', parameterLimit: 1000000 }));

app.use(cors());
app.use(fileUpload());

if (config.app_env == 'prod') {
    app.use("/uploads", function (req, res) {
        var request = require('request');
        let url = config.s3path + req.path
        request(url).pipe(res);
    });
} else {
    app.use('/reports', express.static(path.join(__dirname, 'reports')));
    app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
}

const validator_options = {};
// app.use(validator);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(express_validator(validator_options));
let messages = require("./config/messages.js");
let tenant_api_validator = require("./src/api_validators/tenant_api_validator.js");
let oam_api_validator = require("./src/api_validators/oam_api_validator.js");
let owner_api_validator = require("./src/api_validators/owner_api_validator.js");
let cc_api_validator = require("./src/api_validators/cc_api_validator.js");
let status_codes = require("./config/response_status_codes.js");
const routes = require("./src/core/routes.js");

let master_api_tokens = [];
knex("master_api_tokens")
    .then((result) => {
        for (let i = 0; i < result.length; i++) {
            master_api_tokens[result[i]['api_calling_for']] = result[i]['api_token'];
        }
        global.API_TOKEN = master_api_tokens;
        console.log('API tokens loaded.')
    });

let tokenMiddlewareFn = async function (req, res, next) {
    if (req.query.cron_job_running_id === undefined) {
        if (req.url.split("/")[2]) {
            switch (req.url.split("/")[2]) {
                case "tenant":
                    if (req.url.split("/")[2] === 'tenant') {
                        tenant_api_validator.check_api_validation(req, res, next);
                    } else {
                        res.json({
                            "status": false,
                            status_code: status_codes.api_invalid,
                            message: messages.api_invalid
                        });
                    }
                    break;
                case "oam":
                    if (req.url.split("/")[2] === 'oam') {
                       let data= oam_api_validator.check_api_validation(req, res, next);
                    } else {
                        res.json({
                            "status": false,
                            status_code: status_codes.api_invalid,
                            message: messages.api_invalid
                        });
                    }
                    break;
                case "owner":
                    if (req.url.split("/")[2] === 'owner') {
                        let data= owner_api_validator.check_api_validation(req, res, next);
                    } else {
                        res.json({
                            "status": false,
                            status_code: status_codes.api_invalid,
                            message: messages.api_invalid
                        });
                    }
                    break;        
                default:
                    res.json({
                        "status": false,
                        status_code: status_codes.api_invalid,
                        message: messages.api_invalid
                    });
            }
        }
        else {
            res.json({
                "status": false,
                status_code: status_codes.api_invalid,
                message: messages.api_invalid
            });
        }
        req['route'] = '';
    } else {
        await (() => new Promise((resolve, reject) => {
            knex("cron_jobs")
                .where({
                    uuid: req.query.cron_job_running_id
                })
                .then((result) => {
                    if (result.length > 0) {
                        if (req.url.split("/")[2] === 'admin' && result[0].user_type == 'admin') {
                            req['admin_id'] = result[0].user_id;
                        } else if ((req.url.split("/")[2] == 'tenant' || req.url.split("/")[2] == 'cc') && result[0].user_type == 'tenant') {
                            req['tenant_id'] = result[0].user_id;
                        }
                        next();
                    } else {
                        res.json({
                            "status": false,
                            status_code: status_codes.api_invalid_token,
                            message: messages.api_invalid_token
                        });
                    }
                });
        }))();
    }
};

let get_activity_details = function (req, res, next) {
    knex("master_api_permission_modules")
        .select(["id", "name", "is_sms_activity", "is_email_activity", "api_user", "instant_email_sms", "is_inapp_notification_activity", "is_notification_activity","name"])
        .where("master_api_permission_modules.path", req.originalUrl.split("?")[0].slice(1))
        .where("master_api_permission_modules.method", req.method).then((result) => {
            if (result.length > 0) {
                req['activity_detail'] = result;
            }
            next();
        }).catch((err) => {
            console.log(err);
            res.json(common_functions.catch_error(err));
        });
};

app.use(async function (req, res, next) {
    if (req.url.split("/")[2] === 'cc' && req.query.cron_job_running_id == undefined) {
        if (req.query.language_code == undefined && req.body.language_code == undefined) {
            req.query.language_code = "EN";
        } else if (req.body.language_code) {
            req.query.language_code = req.body.language_code;
        }
        cc_api_validator.check_api_validation(req, res, next);
    } else {
        if (req.query.language_code == undefined && req.body.language_code == undefined) {
            req.query.language_code = "EN";
        } else if (req.body.language_code) {
            req.query.language_code = req.body.language_code;
        }
        tokenMiddlewareFn(req, res, next);
    }
});

app.use(get_activity_details);

app.use("/api/", routes.get());

app.use(function (req, res) {
    res.header(404);
    res.json({ "status": false, status_code: 404, message: messages.api_invalid });
});
app.listen(config.port, function () {
    
    console.log('App Started at port ' + config.port);
   
});

const cron = require('node-cron');
const rewards = new (require('./src/core/rewards/rewards'))();

// cron for every 15 minutes for processing the transactions
cron.schedule('*/15 * * * *', () => rewards.distribute_rewards());

cron.schedule('00 00 15/15 1 *', () => rewards.settle_owner_rewards());

// Need to discuss with Gaurav and Kshitij

const custController = new (require('./src/cc/controller/customer.controller'))();

cron.schedule('*/5 * * * *', async () => await custController.updateTenantCron())