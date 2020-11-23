var express = require('express');
var router = express.Router();
const followc = require('../controllers/FollowConstrol')
router.post('/follow', followc.follow);
module.exports = router;