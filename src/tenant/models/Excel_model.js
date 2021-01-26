/************** Load Libraries ****************/
// let dateFormat = require('dateformat');
// let Validator = require('validatorjs');
const child_process = require('child_process');
var fx = require('mkdir-recursive');
// var json2xls = require('json2xls');
let fs = require('fs');
const path = require('path');
// let uuid = require('uuid');

/************** Load Files ****************/
// let messages = require("../../../config/messages.js");
// let status_codes = require("../../../config/response_status_codes.js");
// let knex = require("../../../config/knex");
// let Common_functions = require(path.join(global.appRoot, "src/core/common_functions.js"));
// let rule_engine = require(path.join(global.appRoot, "src/core/rule_engine.js"));
Response_adapter = require("../../core/response_adapter");
let Queries = require("../queries/mysql/excel");

/************** Generate Objects ****************/
// let response = new Response_adapter();
let queries = new Queries();

module.exports = class excel_model {
	dynamicReportExport(query_data) {
		let cc_download = {};
		let file_path = path.join('reports/' + query_data['report_name']) + new Date().getTime();
		cc_download['file_path'] = file_path;



		cc_download['status'] = 'inprogress';
		cc_download['report_name'] = query_data['report_name'];
		cc_download['tenant_role_id'] = query_data['tenant_role_id'];
		let ruleFor_cc_download = {
			file_path: "required",
			status: "required",
			report_name: "required",
			tenant_role_id: "required",
		};
		queries.dynamicReportExport("insert", {
			cc_download: cc_download,
			ruleFor_cc_download: ruleFor_cc_download,
		})
			.then(function (result) {
				var process = new child_process.fork(path.join(global.appRoot, "src/tenant/child_process/excel_child_process.js"), ['normal']);
				var params = {
					'Parant': 'dynamic',
					'query_data': query_data,
					'result': result,
					'cc_download': cc_download,
					'format': query_data['format']
				};
				process.send([params, global.appRoot]);
				// kill child process after work done
				process.on('message', function (message) {
					console.log("message", message)
					if (message == 'SIGTERM') {
						console.log("process before kill")
						console.log("process.kill('SIGTERM')", process.kill('SIGTERM'))
						process.kill('SIGTERM');
						console.log("process after kill");
						return file_path;
					} else if (message == 'err') {
						console.log('process kill due to  error ');
						console.log("process before kill")
						console.log("process.kill('SIGTERM')", process.kill('SIGTERM'))
						process.kill('SIGTERM');
						console.log("process after kill")
					}
				});

				process.on('exit', function (code) {
					console.log('Excel Child process is exiting with exit.');
				});

				process.on('error', (err) => {
					console.log('Excel Failed to start child process...');
				});
			}).catch((err) => {
				console.log('errerrerrerr::::::::::', err);
			});
	}

	checkFolderPresenceVar() {
		if (fs.existsSync('reports/xls')) {
			// console.log('folder found');
			return true;
		} else {
			// console.log('folder not found');
			fx.mkdir('uploads/xls', function (err) {
				if (err) {
					console.log(err);
					return false
				} else {
					// console.log('*****************************done');
					return true;
				}
			});
		}
	}
}