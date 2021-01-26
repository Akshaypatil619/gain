let apiConfig = require("../config.js");
let path = require('path');
let express = require('express');
let cors = require('cors');
let fileUpload = require('express-fileupload');
let bodyParser = require('body-parser');
let request = require('request');
let app = express();

module.exports = function() {
    app.use(cors());
    app.use(fileUpload());
    app.use(bodyParser.json({
        limit: '50mb'
    }));
    app.use(bodyParser.urlencoded({
        extended: false,
        limit: '50mb',
        parameterLimit: 1000000
    }));

    app.use('/reports', express.static(path.join(global.appRoot, 'reports')));
    app.use('/uploads', function(req, res) {
        let url = apiConfig.s3path + req.path
        request(url).pipe(res);
    });
    app.all('/api/*', function(req, res) {
        let options = {
            "headers": { 
                "content-type": "application/json",
                "USER_AGENT" : "website" ,
                "USER_TOKEN" : req.header("USER_TOKEN"),
                "API_TOKEN" : req.header("API_TOKEN")
            },
            "url": 'http://localhost:' + apiConfig.port + req.originalUrl,
            "json": true
            };
    
         if(req.method == 'POST') {
            options['method'] = 'POST',
            options['json'] = req.body 
        } else if(req.method == 'PUT') {
            options['method'] = 'PUT',
            options['json'] = req.body 
        } else if(req.method == 'DELETE') {
            options['method'] = 'DELETE',
            options['json'] = req.body 
        };
        
        if(req.files && Object.keys(req.files).length > 0) {
            let formData = req.body;
            Object.keys(req.files).forEach((val) => {
                formData[val] = {
                    value : req.files[val]['data'],
                    options : {
                        filename : req.files[val]['name']
                    }
                };
            });
            options['json'] = true;
            options['formData'] = formData;
        };
    
        request(options, function(error, response, body) {
                if(response.statusCode == 200) {
                    res.json(body);
                };
            });
    });

    app.use(express.static(path.join(__dirname, '../owner')));
    app.get('/*', function(req, res) {
        res.sendFile(path.join(__dirname, '../owner/index.html'));
    });

    app.listen(apiConfig.ownerPort, function() {
        console.log('owner panel started at port', apiConfig.ownerPort)
    })
}