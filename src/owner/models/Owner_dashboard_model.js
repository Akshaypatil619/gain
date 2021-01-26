'use strict';
let knex = require('../../../config/knex.js');

module.exports = class Oam_dashboard_model {
  constructor() { }



  async dashboard(data) {
    let result = {
      total_commission: 0,
      current_commission: 0,
      total_buildings: 0,
      total_units: 0,
      total_owners: 0,
      total_tenants: 0,
      total_active_owners: 0,
      total_active_tenants: 0
    };

    let totalUnitQuery = knex('master_unit').count('* AS unitCount').where("master_unit.customer_id",data['owner_id']);
    if(data['date']){
			totalUnitQuery.whereRaw("MONTH(master_unit.created_at)="+data['date'].split('-')[1])
			totalUnitQuery.andWhereRaw("YEAR(master_unit.created_at)="+data['date'].split('-')[0])
		} else {
			totalUnitQuery.whereRaw("MONTH(master_unit.created_at)=MONTH(CURRENT_DATE())")
			totalUnitQuery.andWhereRaw("YEAR(master_unit.created_at)=YEAR(CURRENT_DATE())")
		}
    let totalUnit = await totalUnitQuery;

    let totalTenantQuery = knex('master_unit').count('customers.id AS tenantCount')
                      .join('customers', 'customers.id', 'master_unit.tenant_customer_id')
                      .where("master_unit.customer_id",data['owner_id']); 

    if(data['date']){
      totalTenantQuery.whereRaw("MONTH(customers.created_at)="+data['date'].split('-')[1])
      totalTenantQuery.andWhereRaw("YEAR(customers.created_at)="+data['date'].split('-')[0])
    } else {
      totalTenantQuery.whereRaw("MONTH(customers.created_at)=MONTH(CURRENT_DATE())")
      totalTenantQuery.andWhereRaw("YEAR(customers.created_at)=YEAR(CURRENT_DATE())")
    }
    
    let totalTenant = await totalTenantQuery;
    
    const commission_cols = {
      total_commission: knex.raw('sum(reward)'),
      current_commission: knex.raw(`sum(case when cast(current_date as date) >= DATE_SUB(LAST_DAY(NOW()),INTERVAL DAY(LAST_DAY(NOW()))-
        1 DAY) then reward else 0 end )`)
    }

    let commissionQuery = knex('reward_history').select(commission_cols)
      .where({ customer_id: data.owner_id, user_type: 'owner' });
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

    let totalCutomerQuery = knex('master_unit as mu').select(cust_cols)
      .join('master_building as mb', 'mb.id', 'mu.building_id')
      .join('customers as owners', 'owners.id', 'mu.customer_id')
      .where({ 'mu.customer_id': data.owner_id });
      if(data['date']){
        totalCutomerQuery.whereRaw("MONTH(owners.created_at)="+data['date'].split('-')[1])
        totalCutomerQuery.andWhereRaw("YEAR(owners.created_at)="+data['date'].split('-')[0])
      } else {
        totalCutomerQuery.whereRaw("MONTH(owners.created_at)=MONTH(CURRENT_DATE())")
        totalCutomerQuery.andWhereRaw("YEAR(owners.created_at)=YEAR(CURRENT_DATE())")
      }

      const customers = await totalCutomerQuery;  
    if (customers.length > 0) {
      result.total_buildings = customers[0].total_buildings;
      result.total_owners = customers[0].total_owners;
      result.total_units = totalUnit[0].unitCount;
      result.total_tenants = totalTenant[0].tenantCount;
      result.total_active_owners = customers[0].total_active_owners;
      result.total_active_tenants = customers[0].total_active_tenants;
    }

    return result;
  }




}