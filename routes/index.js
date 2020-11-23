const cateC = require('../controllers/cateController')
const userCode = require('../controllers/UserController')
var express = require('express');

var router = express.Router();


router.get('/', cateC.getCate);
router.post('/post', cateC.getPostCate);
router.post('/sendCode', userCode.sendCode);
router.post('/codePhoneLogin', userCode.codePhoneLogin)
router.post('/sendCoreCode', userCode.sendCoreCode);
router.post('/login', userCode.login);
router.post('/EditUserInfo', userCode.EditUserInfo);
module.exports = router;


