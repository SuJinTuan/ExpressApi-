const dbConfig = require('../util/dbconfig');

// 检查用户是否关注的方法
let checkFollow = async (user_id, follow_id) => {
  let sql = 'select * from follow where user_id=? and follow_id=?';
  let sqlArr = [user_id, follow_id];
  let result = await dbConfig.SySqlConnent(sql, sqlArr);
  if (result.length) {
    return true;
  } else {
    return false;
  }

}

// 关注跟随
follow = async (req, res) => {
  let { user_id, follow_id } = req.body;
  // 检查用户是否已经关注
  if (!await checkFollow(user_id, follow_id)) {
    if (user_id == follow_id) {
      res.send({
        'code': 400,
        'msg': '亲，我们不能关注自己的喔！'
      })
    } else {
      let sql = "insert into follow(follow_id,user_id,create_time) values(?,?,?)";
      let sqlArr = [follow_id, user_id, (new Date()).valueOf()];
      let result = await dbConfig.SySqlConnent(sql, sqlArr);
      console.log(result);
      if (result.affectedRows == 1) {
        res.send({
          'code': 200,
          'msg': '亲，关注成功！'
        })
      } else {
        res.send({
          'code': 400,
          'msg': '亲，关注失败！'
        })
      }

    }
  } else {
    res.send({
      'code': 400,
      'msg': '亲，不能重复关注喔！'
    })
  }
}

module.exports = {
  follow
}