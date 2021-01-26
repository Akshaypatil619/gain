module.exports = class OAMValidator {

    check_login() {
        return {
            email: "required|max:70",
        };
    }
    oam_login() {
        return {
            email: "required|max:70",
        };
    }
    validateAOMOTP() {
        return {
            email: "required|max:70",
        };
    };
    validateOAMResendOTP() {
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

    generateOTPForgotPassword() {
        return  {
            email: "required",
        };
    }
   
}
