"use strict";

module.exports = class OwnerFormatter {

    check_login(req) {
        return {
            email: req.body.email,
            password: (req.body.password=="" || req.body.password==undefined || req.body.password==null) ? null : req.body.password,
            user_agent: req.header("USER_AGENT"),
            language_code: req.query.language_code
        }
    };

    oam_login(req) {
        return {
            email: req.body.email,
            language_code: req.query.language_code
        }
    };
    formatOwnerOTP(req) {
        return {
            email: req.body.email,
            otp: req.body.otp,
            language_code: req.query.language_code
        }
    };
    formatOwnerResendOTP(req) {
        return {
            email: req.body.email,
            language_code: req.query.language_code
        }
    }

    formatSavePassword(req) {
        return {
            email: req.body.email,
            password: req.body.password,
            language_code: req.query.language_code
        }
    }

    formatResetPassword(req) {
        return {
            email: req.body.email,
            password: req.body.password,
            language_code: req.query.language_code
        }
    }
    generateOTPForgotPassword(req) {
        return {
            email: req.body.email,
            language_code: req.query.language_code
        }
    }
   

}
