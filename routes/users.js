
let multer = require('multer')
// let dbConfig = require('../util/dbconfig')
var express = require('express');
var router = express.Router();
let user = require('../controllers/UserController');
// const dbconfig = require('../util/dbconfig');


let upload = multer({
  dest: './public/uploads/'
}).single('file');
let moreUpLoad = multer({
  dest: './public/uploads/'
}).array('file', 5);
/* GET users listing. */
// router.get('/sendCode', user.sendCode);
router.post('/sendCode', user.sendCode);
router.post('/codePhoneLogin', user.codePhoneLogin)
router.post('/sendCoreCode', user.sendCoreCode)
router.post('/login', user.login);
router.post('/EditUserInfo', user.EditUserInfo);
router.post('/setPassword', user.setPassword);
router.post('/bindEmail', user.bindEmail);
router.post('/logout', user.logout);
router.post('/EditUserImg', upload, user.EditUserImg);
router.post('/uploadMoreImg', moreUpLoad, user.uploadMoreImg);
router.post('/pubish', user.pubish);
module.exports = router;
