const { log } = require('debug');
const dbConfig = require('../util/dbconfig')
// 获取分类：
getCate = (req, res) => {

  let sql = "select id,category  from cate";
  let sqlArr = [];
  let callBack = (err, conndata) => {
    if (err) {
      console.log("连接出错");
    } else {
      // 接口数据返回
      res.send({
        'list': conndata
      })
    }
  }
  dbConfig.sqlConnection(sql, sqlArr, callBack);
};

getPostCate = (req, res) => {
  let id = req.query;
  let sql = 'select * from post where cate_id=?';
  let sqlArr = [id];
  let callBack = (err, data) => {
    if (err) {
      console.log(err);
    } else {
      res.send({
        'list-post': data
      })
    }
  }
  dbConfig.sqlConnection(sql, sqlArr, callBack)
}


module.exports = {
  getCate,
  getPostCate
}

