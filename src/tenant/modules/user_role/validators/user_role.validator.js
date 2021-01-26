let root_folder = "../../../../../";
module.exports = class UserRoleValidator {
    addTenantUserRole(type) {
        let validations = {};
        switch (type) {
            case '':
            default:
                validations = {
                    name: "required",
                    description: "required",
                    status: "required",
                    created_by: "required"
                };
                break;
        }
        return validations;
    }
    editTenantUserRole(type) {
        let validations = {};
        switch (type) {
            case '':
            default:
                validations = {
                    role_id: "required",
                    name: "required",
                    description: "required",
                    status: "required",
                };
                break;
        }
        return validations;
    }
    getTenantUserRolesList(type) {
        let validations = {};
        switch (type) {
            case '':
            default:
                validations = {};
                break;
        }
        return validations;
    }
    getTenantUserRoleById(type) {
        let validations = {};
        switch (type) {
            case '':
            default:
                validations = {
                    role_id:"required"
                };
                break;
        }
        return validations;
    }
    updateStatus(type) {
        let validations = {};
        switch (type) {
            case '':
            default:
                validations = {
                    role_id: "required",
                    status: "required",
                };
                break;
        }
        return validations;
    }
}