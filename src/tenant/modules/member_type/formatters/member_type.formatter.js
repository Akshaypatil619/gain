module.exports = class MemberTypeFormatter {
    
        /**
         * Add member type
         *
         * @param req
         * @returns {Array}
         */
        add_member_type(req) {
            let data = [];
            data['member_type'] = {}
            try {
                data['member_type']['tenant_id'] = req.tenant_id;
                data['member_type']['name'] = req.body.member_type;
                data['member_type']['status'] = req.body.status;
                data['member_type']['prefix_id'] = req.body.member_code;
            } catch (e) {
                //
                console.log(e);
            }
            return data;
        }
    
    
        /**
         * category list formatter
         *
         * @param {*} req
         * @returns
         */
        get_member_type(req) {
            let data = {
                tenant_id: req['tenant_id'],
                name: req.query.name,
                from_date: req.query.from_date,
                to_date: req.query.to_date,
                //name: req.query.name,
            };
            return data;
        }
    
         /**
         * Edit Member Type Formatter
         *
         * @param req
         */
        edit_member_type(req) {
            let data = {};
            data.member_type = {};
            data['member_type']['id'] = req.params.id;
            try {
                //Member Type
                // data['member_type']['tenant_id'] = req.tenant_id;
                data['member_type']['name'] = req.body.member_type;
                // data['member_type']['description'] = req.body.description;
                data['member_type']['status'] = req.body.status;
                data['member_type']['prefix_id'] = req.body.member_code;
    
            } catch (e) {
                console.log(e);
            }
            return data;
        }
          /**
        * get member type by id Formatter
        *
        * @param req
        * @return data
        */
       get_member_type_by_id(req) {
        let data = [];
        data['member_type'] = {};
        try {
            //member type Info
    
            data['member_type']['id'] = req.params.id;
    
        } catch (e) {
    
            console.log(e);
        }
        return data;
        }
    
        /**
         * Edit Member Type Formatter
         *
         * @param req
         */
        member_type_status(req) {
            let data = {};
            data.member_type = {};
            data['member_type']['id'] = req.params.id;
            try {
                data['member_type']['status'] = req.body.status;   
            } catch (e) {
                console.log(e);
            }
            return data;
        }
    }
