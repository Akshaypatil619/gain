let root_folder = "../../../../../";
module.exports = class UserRoleFormatter {
    addTenantUserRole(req) {
        let data = {
            tenant_id: req['tenant_id'],
            data: {
                name: req.body.name,
                tenant_id: req['tenant_id'],
                description: req.body.description,
                status: req.body.status,
                created_by: req['tenant_user_id']
            }
        };
        return data;
    }

    editTenantUserRole(req) {
        let data = {
            tenant_id: req['tenant_id'],
            data: {
                role_id: req.params.id,
                name: req.body.name,
                description: req.body.description,
                status: req.body.status,
            }
        };
        return data;
    }

    getTenantUserRolesList(req) {
        let data = {
            tenant_id: req['tenant_id'],
            merchant_id: req.params.merchant_id,
            limit: parseInt(req.query.limit),
            offset: parseInt(req.query.offset),
            search: req.query.search,
            from_date: req.query.from_date,
            to_date: req.query.to_date
        };
        return data;
    }

    getTenantUserRoleById(req) {
        let data = {
            tenant_id: req['tenant_id'],
            role_id: req.params.id
        };
        return data;
    }

    updateStatus(req) {
        let data = {
            tenant_id: req['tenant_id'],
            data: {
                role_id: req.body.role_id,
                status: req.body.status,
            }
        };
        return data;
    }

}