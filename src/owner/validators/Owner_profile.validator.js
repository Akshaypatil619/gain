module.exports = class Owner_profile_Validator {


    addMyMedia() {
        return {
            id: 'required',

        }
    }

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
            // email: "required"
        }
    }
    update_data() {
        return {

        }
    }

}