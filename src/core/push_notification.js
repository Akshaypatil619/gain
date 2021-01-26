
var admin = require("firebase-admin");
var serviceAccount = require("./serviceAccountKey.json");



module.exports.sendNotification = function (notification,callback) {

	try {
		if (admin.apps.length == 0) {
			admin.initializeApp({
				credential: admin.credential.cert(serviceAccount),
				databaseURL: "https://rainbowrewards-16ab9.firebaseio.com"
			});
		}

		admin.messaging().sendMulticast(notification)
			.then((response) => {
				console.log("response", response)
				return callback({ body: response });
			})
			.catch((error) => {
				console.log("Firebase error", error);
				return callback({ err: error });
			});

	} catch (err) {
		console.log("Firebase catch error", err)
		return callback({ err: err });
	}
}

