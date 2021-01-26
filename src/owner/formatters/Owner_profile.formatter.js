
module.exports = class Owner_profile_formatter {

    constructor() {

    }
    addMyMedia(req) {
        return {
            id: req.body.id,
            image_path: req.files.imageUpload,
        }
    }
    get_user_details(req) {
        let data = {};
        data["log_in_userID"] = req.body['log_in_userID']

        return data;

    }

    get_password(req) {
        let data = {};
        data["old_password"] = req.body.oldPswd;
        data["new_password"] = req.body.newPswd;
        data["id"] = req.body.log_in_userID;
        // data["email"] = req.body.email;

        return data;

    }
    update_data(req) {
        let data = {};

            data["id"] = req.body.id,
            data["first_name"] = req.body.name,
            data['last_name'] = req.body.last_name;
            data["phone"] = req.body.phone,
            data["address_line1"] = req.body.address,
            data["address_line2"] = req.body.address_line2;
            data["gain_commission"] = req.body.gain_commission,
            data["owner_commission"] = req.body.owner_commission,
            data["oam_commission"] = req.body.oam_commission;

        return data;
    }

}