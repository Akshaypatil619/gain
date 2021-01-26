module.exports = class OwnerValidator {

    check_login() {
        return {
            email: "required|max:70",
        };
    }
    owner_login() {
        return {
            email: "required|max:70",
        };
    }
    validateOwnerOTP() {
        return {
            email: "required|max:70",
        };
    };
    validateOwnerResendOTP() {
        return  {
            email: "required",
        };
    }
    validateSavePassword() {
        return  {
            email: "required",
            password: "required"
        };
    }

    validateResetPassword() {
        return  {
            email: "required",
            password: "required"
        };
    }
     
    user_details() {
        return {
            log_in_userID:"required",
        }
    }
    generateOTPForgotPassword() {
        return  {
            email: "required",
        };
    }
    
   
}
