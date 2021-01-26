module.exports = class Oam_profile_Validator {


    get_user_details() {
        return {
            log_in_userID: "required",
        }
    }
    get_password() {
        return {
            old_password: "required",
            new_password: "required",
            id: "required",
           
        }
    }
    update_data() {
        return {

        }
    }
    addMyMedia() {
        return {
            id: 'required',

        }
    }

}