let profileResponse = require('../response/Oam_profile.response');

const profileModel = new (require("../models/Oam_profile_model"))();

module.exports = class Oam_profile_service {
    constructor() {

    }
    get_user_details(_data) {
        return profileModel
            .get_user_details({ columns: _data })
            .then(result => {
                console.log
                ("66666666",result)
                if (result.length > 0) {
                    return profileResponse.success("oam_user_found", result);

                } else {
                    return profileResponse.failed("oam_user_not_found");

                }
            })
            .catch(err => profileResponse.catch_error(err));
    }


    get_password(_data) {
        return profileModel
            .get_password({ columns: _data })
            .then(result => {
                console.log("jggggg",result)
                if (_data.old_password !== result[0].password) {
                    return profileResponse.failed("current_password_does_not_match", result);
                }
                else {
                    let password = (_data.new_password)
                    let id = _data.id;
                    return profileModel.update_password(_data)
                        .then(result => {
                            if (result.length > 0 || result == 1) {
                                return profileResponse.success("password_updated", result);

                            }
                            else {
                                return profileResponse.success("password_not_updated", result);

                            }
                        })
                }
            })
            .catch(err =>
                profileResponse.catch_error(err)
            );
    }


    update_data(_data) {
        return profileModel.validatePhoneNumber({ columns: _data })
            .then(result => {
                if (result.length > 0 || result == 1) {

                    return profileResponse.failed("phone_number_already_exist");
                } else {
                    return profileModel.update_data({ columns: _data })
                        .then(result => {

                            if (result.length > 0 || result == 1)
                                return profileResponse.success("data_updated", result);
                            else return profileResponse.failed("data_not_updated");
                        })
                }
            })
            .catch(err => profileResponse.catch_error(err));
    }

    addMyMedia(_data) {
        let data = {};
        let upload = new Upload_files();

        return new Promise(resolve => {
            upload.uploadFile(_data['image_path'], "uploads/my_media/" + + _data['id'], _data.image_path['name'], function (err, path) {
                resolve(err, path)
            })
        }).then((err, path) => {
            if (err) {
            }
            data = {
                id: _data['id'],
                image_path: '/uploads/my_media/' + _data['id'] + '/' + _data.image_path['name'],
            }
            return profileModel.addMyMedia(data)
                .then(result => {
                    console.log("result", result)
                    if (result.length > 0 || result == 1) {
                        return profileResponse.success("media_inserted", { image_path: '/uploads/my_media/' + _data['id'] + '/' + _data.image_path['name'] })
                    }
                    else {
                        return profileResponse.failed("media_not_inserted");
                    }
                }).catch(err => profileResponse.catch_error("err", err));
        })
    }
}