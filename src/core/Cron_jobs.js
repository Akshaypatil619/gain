/* ------------------------ Load Libraries ------------------------ */
let cmd = require('node-cmd');

/* ------------------------ Load Files ------------------------ */
let config = require("../../config/config.js");
let knex = require("../../config/knex.js");

module.exports = class Cron_jobs {

	async start_db_crons() {
		try {
			let columns = {
				id: "cron_jobs.id",
				url: "cron_jobs.url",
				cron_range: "cron_jobs.cron_range",
				uuid: "cron_jobs.uuid",
				status: "cron_jobs.status",
				started: "cron_jobs.started"
			}

			let cron_jobs_result = await
				knex("cron_jobs")
					.select(columns)
					.where("cron_jobs.started", 1)
					.where("cron_jobs.status", 1);

			if (cron_jobs_result.length == 0) {
				console.log("No cron jobs found.");
				cmd.get("crontab -r", (err, data, stderr) => { });
			}
			else {
				let cron_string = "";
				cmd.get("crontab -r", (err, data, stderr) => {
					for (let i = 0; i < cron_jobs_result.length; i++) {
						// let cron = cron_jobs_result[i];
						if (cron_jobs_result[i].status == 1 && cron_jobs_result[i].status == 1) {
							cron_string != "" ? cron_string += "\n" : "";
							if (cron_jobs_result[i]['url'].includes('vms')) {
								cron_string += cron_jobs_result[i]['cron_range'] + " " + cron_jobs_result[i]['url'];
							} else {
								cron_string += cron_jobs_result[i]['cron_range'] + " curl --request GET " + config['base_url'] + cron_jobs_result[i]['url'] + "?cron_job_running_id=" + cron_jobs_result[i]['uuid'];
							}
						}
					}
					if (cron_string != "") {
						cmd.get("(crontab -l 2>/dev/null; echo \"" + cron_string + "\") | crontab -", (err, data, stderr) => {
							// console.log("Initilized Job",cron_jobs_result[i].url);
							// if (i == (cron_jobs_result.length - 1)) {
							console.log("Cron jobs initialized");
							// }
						});
					}
				});
			}
		}
		catch (err) {
			console.log("cron err === ", err);
		}
	}

}