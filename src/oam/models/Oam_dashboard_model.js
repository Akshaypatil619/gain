'use strict';
let knex = require('../../../config/knex.js');

module.exports = class Oam_dashboard_model {
  constructor() { }



  async dashboard(data) {
    let result = {
      total_commission: 0,
      current_commission: 0,
      total_buildings: 0,
      total_owners: 0,
      total_active_owners: 0,
      total_active_tenants: 0,
      total_pre_registred_tenants:0,
    };

    const commission_cols = {
      total_commission: knex.raw('sum(reward)'),
      current_commission: knex.raw(`sum(case when cast(current_date as date) >= DATE_SUB(LAST_DAY(NOW()),INTERVAL DAY(LAST_DAY(NOW()))-
        1 DAY) then reward else 0 end )`)
    }

    let commissionQuery = knex('reward_history').select(commission_cols)
      .where({ customer_id: data.oam_id, user_type: 'oam' });

      if(data['date']){
        commissionQuery.whereRaw("MONTH(reward_history.created_at)="+data['date'].split('-')[1])
        commissionQuery.andWhereRaw("YEAR(reward_history.created_at)="+data['date'].split('-')[0])
      } else {
        commissionQuery.whereRaw("MONTH(reward_history.created_at)=MONTH(CURRENT_DATE())")
        commissionQuery.andWhereRaw("YEAR(reward_history.created_at)=YEAR(CURRENT_DATE())")
      }  

      const commissions = await commissionQuery;

    if (commissions.length > 0) {
      result.total_commission = commissions[0].total_commission ? commissions[0].total_commission: 0;
      result.current_commission = commissions[0].current_commission ? commissions[0].current_commission : 0;
    }

    const cust_cols = {
      total_buildings: knex.raw('count(distinct mb.id)'),
      total_owners: knex.raw('count(distinct owners.id)'),
      total_active_owners: knex.raw('count(distinct case when owners.is_logged_in = 1 then owners.id else null end)'),
      total_active_tenants: knex.raw('count(distinct case when mu.tenant_customer_id is not null then mu.tenant_customer_id else null end)')
    }

    let customerQuery = knex('master_property as mp').select(cust_cols)
      .join('master_building as mb', 'mb.property_id', 'mp.id')
      .join('master_unit as mu', 'mu.building_id', 'mb.id')
      .join('customers as owners', 'owners.id', 'mu.customer_id')
      .where({ 'mp.oam_id': data.oam_id });
      if(data['date']){
        customerQuery.whereRaw("MONTH(owners.created_at)="+data['date'].split('-')[1])
        customerQuery.andWhereRaw("YEAR(owners.created_at)="+data['date'].split('-')[0])
      } else {
        customerQuery.whereRaw("MONTH(owners.created_at)=MONTH(CURRENT_DATE())")
        customerQuery.andWhereRaw("YEAR(owners.created_at)=YEAR(CURRENT_DATE())")
      }
      const customers = await customerQuery;
 
      let cols={"pre_registred_tenant":knex.raw('count(distinct customers.id)')} 
      let pre_registred_tenant =await knex('master_user_type').select(cols)
      .join('customers', 'customers.user_type_id', 'master_user_type.id')
      .where('master_user_type.code','tenant')
      .andWhere('customers.is_logged_in',0);

    if (customers.length > 0) {
      result.total_buildings = customers[0].total_buildings;
      result.total_owners = customers[0].total_owners;
      result.total_active_owners = customers[0].total_active_owners;
      result.total_active_tenants = customers[0].total_active_tenants;
      result.total_pre_registred_tenants=pre_registred_tenant[0].pre_registred_tenant;
    }

    return result;
  }




}