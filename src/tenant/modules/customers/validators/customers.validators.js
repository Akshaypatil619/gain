
module.exports = class CustomersValidators {

    /**
     * Prepare validation rules for adding customer
     *
     * @param type
     */
    addCustomer(type) {
        // return variable
        let returnData = {};

        // switch (type) {
        //     case "customer":
                return {
                    first_name: "required",
                    email: "required",
                    country_id: "required",
                    // contact: "required",
                    dob: "required|date",
                    gender: "required",
                    // tier_id: "required",
                    // member_code:"required",
                    // channel:"required",
                    // school_id: "required",
                    // source_id: "required",
                    // gems_id: "required"
                };
        //         break;
        // }
        // return returnData;
    }

    /**
     * Prepare validation rules for editing customer
     *
     * @param type
     */
    editCustomer(type) {
        // return variable
        let returnData = {};

        switch (type) {
            case "customer":
                returnData = {
                    customer_id: "required",
                    email: "required",
                    phone: "required",
                };
                break;
        }
        return returnData;
    }

    /**
     * Rules for get customer by id
     *
     * @param type
     */
    getCustomerByID() {
        return {
            customer_id: "required",
        };
    }

    /**
     * Rules for get customers list
     *
     * @param type
     */
    getCustomersList(type) {
        // return variable
        let returnData = {};

        switch (type) {
            case "customer":
            default:
                returnData = {
                };
                break;
        }
        return returnData;
    }

    /**
     * Rules for get tenant customers list
     *
     * @param type
     */
    getTenantCustomersList(type) {
        // return variable
        let returnData = {};

        switch (type) {
            case "customer":
            default:
                returnData = {
                };
                break;
        }
        return returnData;
    }

    /**
     * Rules for processing customer cards
     *
     * @param type
     */
    processCustomerCards(type) {

        // return variable
        let returnData = {};

        switch (type) {
            case "cardData":
                returnData = {
                    'card_data': "required|array"
                };
                break;
            case "cardValidation":
                returnData = {
                    bank_id: "required",
                    card_network_id: "required",
                    issuer_identification_number: "required",
                    card_number: "required",
                    last_four_digits: "required",
                    month: "required",
                    year: "required",
                };
                break;
            default:
                returnData = {
                };
                break;
        }
        return returnData;
    }

    /**
     * @description Prepare validation rules for remove customer card
     * @author Brijehs Kumar Khatri
     * @param {*} type
     * @returns
     */
    removeCustomerCard(type) {
        let returnData = {}
        switch (type) {
            default: returnData = {
                customer_card_id: "required",
                customer_id: "required"
            };
                break;
        }
        return returnData;
    }

    /**
     * @description Prepare validation rules for get customer card type
     * @author Brijehs Kumar Khatri
     * @param {*} type
     * @returns
     */
    getCustomerCardType(type) {
        let returnData = {}
        switch (type) {
            default: returnData = {
                card_number: "required|digits:16"
            };
                break;
        }
        return returnData;
    }

    /**
     * @description Prepare validation rules for comment 
     * @author Brijehs Kumar Khatri
     * @param {*} type
     * @returns
     */
    comment(type) {
        let returnData = {}
        switch (type) {
            case "tagData":
                returnData = {
                    tagData: "required|array"
                }
                break;
            case 'comment':
            default:
                returnData = {
                    customer_id: "required",
                    comment: "required",
                };
                break;
        }
        return returnData;
    }

    /**
     * @description Prepare validation rules for comment list
     * @author Brijehs Kumar Khatri
     * @param {*} type
     * @returns
     */
    commentList(type) {
        let returnData = {}
        switch (type) {
            default:
                returnData = {
                    customer_id: "required",
                };
                break;
        }
        return returnData;
    }

    /**
     * @description Prepare validation rules for get customer assign tags
     * @author Brijehs Kumar Khatri
     * @param {*} type
     * @returns
     */
    getCustomerAssignTags(type) {
        let returnData = {}
        switch (type) {
            default:
                returnData = {
                    customer_id: "required",
                };
                break;
        }
        return returnData;
    }

    /**
     * @description Prepare validation rules for comment list by tag
     * @author Brijehs Kumar Khatri
     * @param {*} type
     * @returns
     */
    commentListByTag(type) {
        let returnData = {}
        switch (type) {
            default:
                returnData = {
                    customer_id: "required",
                };
                break;
        }
        return returnData;
    }

    /**
     * @description Prepare validation rules for update commebt starred
     * @author Brijehs Kumar Khatri
     * @param {*} type
     * @returns
     */
    updateCommentStarred(type) {
        let returnData = {}
        switch (type) {
            default:
                returnData = {
                    comment_id: "required",
                    starred: "required"
                };
                break;
        }
        return returnData;
    }

    /**
     * @description Prepare validation rules for check user validation
     * @author Brijehs Kumar Khatri
     * @param {*} type
     * @returns
     */
    checkUserValidation(type) {
        let returnData = {}
        switch (type) {
            default:
                returnData = {
                    customer_id: "required",
                    email: "required"
                };
                break;
        }
        return returnData;
    }

    /**
     * @description Prepare validation rules for customer profile status change
     * @author Brijehs Kumar Khatri
     * @param {*} type
     * @returns
     */
    customerProfileStatusChange(type) {
        let returnData = {}
        switch (type) {
            default:
                returnData = {
                    customer_id: "required",
                    status: "required"
                };
                break;
        }
        return returnData;
    }

    /**
     * @description Prepare validation rules for fetch bulk upload files
     * @author Brijehs Kumar Khatri
     * @param {*} type
     * @returns
     */
    fetchBulkUploadFiles(type) {
        let returnData = {}
        switch (type) {
            default:
                break;
        }
        return returnData;
    }

    /**
     * @description Prepare validation rules for getch bulk upload file data
     * @author Brijehs Kumar Khatri
     * @param {*} type
     * @returns
     */
    fetchBulkUploadFileData(type) {
        let returnData = {}
        switch (type) {
            default:
                returnData = {
                    process_id: "required"
                }
                break;
        }
        return returnData;
    }

    /**
     * @description Prepare validation rules for customer tier upgrade
     * @author Brijehs Kumar Khatri
     * @param {*} type
     * @returns
     */
    customerTierUpgrade(type) {
        let returnData = {}
        switch (type) {
            default:
                returnData = {
                    tenant_id: "required",
                    customer_id: "required",
                    time_period: "required",
                    tier_id: "required",
                    tier_name: "required",
                    lapse_policy: "required",
                    transaction_type: "required"
                }
                break;
        }
        return returnData;
    }

    /**
     * @description Prepare validation rules for get customer activity
     * @author Brijehs Kumar Khatri
     * @param {*} type
     * @returns
     */
    getCustomerActivity(type) {
        let returnData = {}
        switch (type) {
            default:
                returnData = {
                    customer_id: "required",
                }
                break;
        }
        return returnData;
    }

    /**
     * @description Prepare validation rules for get history list
     * @author Brijehs Kumar Khatri
     * @param {*} type
     * @returns
     */
    getHistoryList(type) {
        let returnData = {}
        switch (type) {
            default:
                returnData = {
                    customer_id: "required",
                }
                break;
        }
        return returnData;
    }

    /**
     * @description Prepare validation rules for get customer graph value
     * @author Brijehs Kumar Khatri
     * @param {*} type
     * @returns
     */
    getCustomerGraphValue(type) {
        let returnData = {}
        switch (type) {
            default:
                returnData = {
                    customer_id: "required",
                }
                break;
        }
        return returnData;
    }

    /**
     * @description Prepare validation rules for get customer table columns
     * @author Brijehs Kumar Khatri
     * @param {*} type
     * @returns
     */
    getCustomerTableColumns(type) {
        let returnData = {}
        switch (type) {
            default:
                returnData = {
                    tenant_id: "required",
                }
                break;
        }
        return returnData;
    }

    /**
     * @description Prepare validation rules for get customer assign consent
     * @author Brijehs Kumar Khatri
     * @param {*} type
     * @returns
     */
    getCustomerAssignConsent(type) {
        let returnData = {}
        switch (type) {
            default:
                returnData = {
                    customer_id: "required",
                }
                break;
        }
        return returnData;
    }

    /**
     * @description Prepare validation rules for customer downgrade tier
     * @author Brijehs Kumar Khatri
     * @param {*} type
     * @returns
     */
    customerDowngradeTier(type) {
        let returnData = {}
        switch (type) {
            default:
                returnData = {
                    customer_id: "required",
                    time_period: "required",
                    tier_id: "required",
                    tier_name: "required",
                    lapse_policy: "required",
                    tier_price: "required"
                }
                break;
        }
        return returnData;
    }

    /**
     * @description Prepare validation rules for create dynamic field
     * @author Brijehs Kumar Khatri
     * @param {*} type
     * @returns
     */
    createDynamicField(type) {
        let returnData = {}
        switch (type) {
            default:
                returnData = {
                    field_name: "required",
                    length: "required",
                }
                break;
        }
        return returnData;
    }

    /**
     * @description Prepare validation rules for get sales office list
     * @author Brijehs Kumar Khatri
     * @param {*} type
     * @returns
     */
    getSalesOfficeList(type) {
        let returnData = {}
        switch (type) {
            default:
                returnData = {
                }
                break;
        }
        return returnData;
    }

    /**
     * @description Prepare validation rules for get customer point transfer list
     * @author Brijehs Kumar Khatri
     * @param {*} type
     * @returns
     */
    getCustomerPointTransferList(type) {
        let returnData = {}
        switch (type) {
            default:
                returnData = {
                    tenant_id: "required",
                    transfer_to: "required",
                    transfer_from: "required",
                }
                break;
        }
        return returnData;
    }

    /**
     * @description Prepare validation rules for add tag in comment
     * @author Brijehs Kumar Khatri
     * @param {*} type
     * @returns
     */
    addTagInComment(type) {
        let returnData = {}
        switch (type) {
            default:
                returnData = {
                    tagId: "required|array",
                    commentId: "required",
                }
                break;
        }
        return returnData;
    }

    /**
     * @description Prepare validation rules for remove tag from comment
     * @author Brijehs Kumar Khatri
     * @param {*} type
     * @returns
     */
    removeTagFromComment(type) {
        let returnData = {}
        switch (type) {
            default:
                returnData = {
                    tagId: "required",
                    commentId: "required",
                }
                break;
        }
        return returnData;
    }

    /**
     * @description Prepare validation rules for add tag in source
     * @author Brijehs Kumar Khatri
     * @param {*} type
     * @returns
     */
    addTagInSource(type) {
        let returnData = {}
        switch (type) {
            default:
                returnData = {
                    customer_id: "required",
                    tag_name: "required",
                }
                break;
        }
        return returnData;
    }

    /**
     * @description Prepare validation rules for remoev customer source
     * @author Brijehs Kumar Khatri
     * @param {*} type
     * @returns
     */
    removeCustomerSource(type) {
        let returnData = {}
        switch (type) {
            default:
                returnData = {
                    customer_id: "required",
                    tag_id: "required",
                }
                break;
        }
        return returnData;
    }
}
