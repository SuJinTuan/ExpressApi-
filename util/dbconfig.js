const mysql = require('mysql')
module.exports = {
  // 数据库配置
  config: {
    host: "localhost",
    port: "3306",
    user: "ApiData",
    password: "123",
    database: "apidata"
  },
  // 连接数据库,使用mesql连接池方式
  // 连接池对象
  sqlConnection(sql, sqlArr, callBack) {


    let pool = mysql.createPool(this.config);

    pool.getConnection((err, conn) => {
      console.log("连接成功");
      if (err) {
        console.log("连接失败");
        return
      }
      // 事件驱动回调
      conn.query(sql, sqlArr, callBack);
      // 释放释放连接
      conn.release();
    })
  },

  // promise回调
  SySqlConnent(sySql, sqlArr) {
    return new Promise((resolve, reject) => {
      var pool = mysql.createPool(this.config)
      pool.getConnection((err, conn) => {
        if (err) {
          console.log('连接失败');
          reject(err)
        } else {
          // 条件驱动问题
          conn.query(sySql, sqlArr, (err, data) => {
            if (err) {
              console.log('返回数据失败');
              return reject(err)
            } else {
              return resolve(data)
            }
          });
          console.log('连接成功' + '--53');
          // 释放连接
          conn.release();

        }
      })
    }).catch((err) => {
      console.log(err);
    })
  }
}
