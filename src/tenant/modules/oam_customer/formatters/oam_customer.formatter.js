module.exports = class MemberTypeFormatter {
    
        /**
         * Add member type
         *
         * @param req
         * @returns {Array}
         */
        add_oam(req) {
            return {
                id: req.body.id,
                company_name: req.body.company_name,
                // last_name: req.body.last_name,
                email: req.body.email,
                phone: req.body.phone,
                // dob: req.body.dob,
                // gender:req.body.gender,
                status:req.body.status,
                oam_commission: req.body.oam_commission,
                owner_commission: req.body.owner_commission,
                gain_commission: req.body.gain_commission,
                manager: req.body.manager,
                country_id: req.body.country_id,
                language_code: req.query.language_code
            };
        }
    
    
        /**
         * oam list formatter
         *
         * @param {*} req
         * @returns
         */
        get_oam(req) {
            return {
                id: req.params.id,
                language_code: req.query.language_code
            };
        }

        list_oam(req) {
            console.log("oooo",req.query)
            return {
                tenant_id: req['tenant_id'],
                company_name: req.query.company_name,
                email: req.query.email,
                phone: req.query.phone,
                customer_unique_id: req.query.customer_unique_id,
                limit: parseInt(req.query.limit),
                offset: parseInt(req.query.offset),
                from_date: req.query.start_date,
                to_date: req.query.end_date,
                language_code: req.query.language_code
            };
        }

        get_all_countries(req) {
            return {};
        }
    
         /**
         * Edit oam customer Formatter
         *
         * @param req
         */
        edit_oam(req) {
            return {
                id: req.body.id,
                company_name: req.body.company_name,
                // last_name: req.body.last_name,
                email: req.body.email,
                phone: req.body.phone,
                // dob:req.body.dob,
                // gender:req.body.gender,
                oam_commission: req.body.oam_commission,
                owner_commission: req.body.owner_commission,
                gain_commission: req.body.gain_commission,
                manager: req.body.manager,
                country_id: req.body.country_id,
                status:req.body.status,
                language_code: req.query.language_code
            };
        }
          /**
        * get oam customer by id Formatter
        *
        * @param req
        * @return data
        */
       get_oam_customer_by_id(req) {
        let data = [];
        data['oam_customer'] = {};
        try {
            data['oam_customer']['id'] = req.params.id;
        } catch (e) {
    
            console.log(e);
        }
        return data;
        }
    
        /**
         * Edit Oam Customer Formatter
         *
         * @param req
         */
        oam_customer_status(req) {
            let data = {};
            data.oam_customer = {};
            data['oam_customer']['id'] = req.params.id;
            try {
                data['oam_customer']['status'] = req.body.status;   
            } catch (e) {
                console.log(e);
            }
            return data;
        }
    }
