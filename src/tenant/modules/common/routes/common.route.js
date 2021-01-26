'use strict';
let router = require('express').Router();
let commonController = new (require('../controllers/common.controller'))();

router.get('/get_emirate_list',commonController.getEmirateList);
router.get('/get_curriculum_list',commonController.getCurriculumlist);

module.exports = router;