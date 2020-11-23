// 调用阿里大鱼
const Core = require('@alicloud/pop-core');
const { fstat } = require('fs');


const config = require('../util/aliconfig');

const dbConfig = require('../util/dbconfig');

let client = new Core(config.alicloud);
let requestOption = {
  methods: 'POST'
}
function rand(min, max) {
  return Math.floor(Math.random() * (max - min)) + min
}
// 检验手机号和验证码
var ValidatePhoneCode = [];//因为这个变量--------------------------

var findCodeAndPhone = (phone, code) => {
  // console.log(phone + '-' + code + '-' + '18');
  for (let item of ValidatePhoneCode) {
    if (phone == item.phone && code == item.code) {
      // console.log('login');
      return 'login'
    } else {
      // console.log(item + '28');
      return 'error'
    }
  }
}


// 检验验证码登录是否是第一次登录
let phoneLoginBind = async (phone) => {

  let sql = 'select * from user where username=? or phone=?';
  let sqlArr = [phone, phone];
  let res = await dbConfig.SySqlConnent(sql, sqlArr);
  if (res.length) {
    res[0].userinfo = await getUserInfo(res[0].id);   // 获取用户详情
    return res;

  } else {
    // 用户第一次注册、绑定表,  // 用户注册
    let res = await regUser(phone);

    // 获取用户详情
    res[0].userinfo = await getUserInfo(res[0].id);
    return res;
  }
}


// 用户注册的方法
let regUser = async (phone) => {
  // 检查用户是不是第一次注册
  let userpic = "http://m.imeitou.com/uploads/allimg/2019022710/20jc1uk3zlx.jpg";
  let sql = `insert into user(username,userpic,phone,create_time) values(?,?,?,?)`;
  let date = new Date();
  let sqlArr = [phone, userpic, phone, date.valueOf()];
  console.log(sqlArr + '--57');
  let res = await dbConfig.SySqlConnent(sql, sqlArr);

  if (res.affectedRows == 1) {
    // 执行成功获取用户信息
    // 获取用信息的方法
    let user = await getUser(phone);
    console.log(user + '--66');
    // 绑定用户的副表
    let userinfo = await createUserInfo(user[0].id);
    console.log(userinfo);
    if (userinfo.affectedRows == 1) {
      return user;
    } else {
      return false
    }
  } else {
    return false
  }

}

// 获取用户的信息????
let getUser = (username) => {
  let sql = `select * from user where id=? or phone=? or username=?`;
  console.log(username + '--87');
  let sqlArr = [username, username, username];
  return dbConfig.SySqlConnent(sql, sqlArr)
}

// 创建副表
let createUserInfo = (user_id) => {
  console.log(user_id + '--94');
  let sql = `insert into userinfo(user_id,age,sex,job) values(?,?,?,?)`;
  let sqlArr = [user_id, 18, 1, '未设置'];
  return dbConfig.SySqlConnent(sql, sqlArr);
}

// 获取用户注册的用户详情
let getUserInfo = (user_id) => {
  let sql = `select * from userinfo where user_id=?`;
  let sqlArr = [user_id];
  return dbConfig.SySqlConnent(sql, sqlArr);
}


// 模拟验证码接口 
sendCoreCode = (req, res) => {
  let phone = req.body.phone;
  console.log(phone + '--103');
  let code = rand(1000, 9999);
  // // 配置
  var params = {
    "RegionId": "cn-hangzhou",
    "PhoneNumbers": "15217554483",
    "SignName": "expressAPI接口",
    "TemplateCode": "SMS_205457394",
    "TemplateParam": JSON.stringify({ "code": code })
  };
  client.request('SendSms', params, requestOption).then((result) => {
    console.log(JSON.stringify(result));
    if (result.Code == "OK") {
      res.send({
        "code": 200,
        "msg": "发送成功"
      })
      ValidatePhoneCode.push({
        "phone": phone,
        "code": code,
      })
      console.log(code);
    } else {
      res.send({
        "code": 400,
        "msg": "发送失败"
      });
    }
  })
}

// 模拟验证码接口 
sendCode = (req, res) => {
  let phone = req.body.phone;
  if (sendCodeP(phone)) {
    res.send({
      'code': 400,
      'msg': '已经发送过验证码, 稍后再发',
    })
  }
  let code = rand(1000, 9999);
  ValidatePhoneCode.push({
    'phone': phone,
    'code': code
  })
  console.log(ValidatePhoneCode + '--47');
  res.send({
    'code': 200,
    'msg': '发送成功！',
  })
  console.log(code);
}

let sendCodeP = (phone) => {
  for (let item of ValidatePhoneCode) {
    console.log(item.phone + '-10');
    if (phone == item.phone) {
      return true
    }
  }
  return false
}

// 验证码登录接口
codePhoneLogin = async (req, res) => {
  let { phone, code } = req.body;

  // let phone = req.query.phone;
  // let code = req.query.code;
  // 该手机号是否发送过验证码
  if (sendCodeP(phone)) {
    // 验证码和手机是否匹配
    let status = findCodeAndPhone(phone, code);

    if (status == 'login') {
      // 登录成功
      // 成功之后的操作
      let user = await phoneLoginBind(phone);
      console.log(user[0] + '--192');
      res.send({
        "code": 200,
        "msg": '登录成功!',
        "data": user[0]
      })
      // ValidatePhoneCode.push({
      //   'phone': phone,
      //   'code': code,
      //   "data": user[0]
      // })
    } else if (status == "error") {
      res.send({
        'code': 200,
        'msg': '登录失败！'
      })
    }
  } else {
    res.send({
      'code': 400,
      'msg': '未发送验证码!'
    })
  }
}

// ---------------------------------------------------2020-11-6
// 查看用户详情
let findUserInfo = async (user_id) => {
  let sql = 'select * from userinfo where user_id=?';
  let sqlArr = [user_id];
  let res = await dbConfig.SySqlConnent(sql, sqlArr);
  if (res.length) {
    return true
  } else {
    return false
  }
}
// 修改用户信息的方法‘
let setUserInfo = async (user_id, age, sex, job, path, birthday) => {
  if (await findUserInfo(user_id)) {
    // 如果存在，则更新它
    let sql = 'update userinfo set age=?,sex=?,job=?,path=?,birthday=? where user_id=?';
    let sqlArr = [age, sex, job, path, birthday, user_id];
    let res = await dbConfig.SySqlConnent(sql, sqlArr);
    console.log(res + '--233');
    if (res.affectedRows == 1) {

      let user = await getUser(user_id);
      let userinfo = await getUserInfo(user_id);

      user[0].userinfo = userinfo[0];
      return user
    } else {
      return false;
    }
  } else {    // 没有则,安排上用：insert into
    let sql = `insert into userinfo(user_id, age, sex, job, path, birthday) values(?,?,?,?,?,?)`;
    let sqlArr = [user_id, age, sex, job, path, birthday];
    let res = await dbConfig.SySqlConnent(sql, sqlArr);
    console.log(res + '--248');
    if (res.affectedRows == 1) {
      let user = await getUser(user_id);
      let userinfo = await getUserInfo(user_id);
      user[0].userinfo = userinfo[0];
      return user
    } else {
      return false;
    }
  }
}
// 修改名称的用户名方法
let setUserName = async (user_id, username) => {
  let sql = 'update user set username=? where id=?';
  let sqlArr = [username, user_id];
  let res_ = await dbConfig.SySqlConnent(sql, sqlArr)
  console.log(res_ + '--261');
  if (res_.affectedRows == 1) {
    return true;
  } else {
    return false;
  }

}

// 用户名，手机号登陆
login = (req, res) => {
  let username = req.body.username,
    password = req.body.password;
  let phone = /^1[3456789]\d{9}$/;
  let email = /^ ([a - zA - Z] | [0 - 9])(\w | -) +@[a - zA - Z0 - 9]+.([a - zA - Z]{ 2, 4})$/;
  if (phone.test(username)) {
    // 密码是否设置MD5+加密？？？
    let sql = 'select * from user where phone=? and password=? or username and password=?'
    let sqlArr = [username, password, username, password];

    let callBack = async (err, data) => {
      if (err) {
        console.log(err);
        res.send({
          'code': 400,
          'msg': '出错了-phone！'
        })
      } else if (data == "") {
        console.log(data);
        res.send({
          'code': 400,
          'msg': '用户名手机或者密码出错了！',
          'data': []
        })
      } else {
        let user_id = data[0].id;
        let result = await getUserInfo(user_id);
        data[0].userinfo = result[0];
        res.send({
          'code': 200,
          'msg': '登录成功',
          'data': data[0]
        })
      }
    }
    dbConfig.sqlConnection(sql, sqlArr, callBack);
  } else if (email.test(username)) {
    let sql = "select * from user where email=? and password=?";
    let sqlArr = [username, password];

    let callBack = async (err, data) => {
      if (err) {
        console.log(err);
        res.send({
          'code': 400,
          'msg': '出错了-email！'
        })
      } else if (data == " ") {
        console.log(data);
        res.send({
          'code': 400,
          'msg': '邮箱或者密码出错了！',
          'data': []
        })
      } else {
        let user_id = data[0].id;
        let result = await getUserInfo(user_id);
        data[0].userinfo = result[0];
        res.send({
          'code': 200,
          'msg': '登录成功',
          'data': data[0]
        })
      }
    }
    dbconfig.sqlConnection(sql, sqlArr, callBack);
  } else {
    let sql = "select * from user where username=? and password=?";
    let sqlArr = [username, password];

    let callBack = async (err, data) => {
      if (err) {
        console.log(err);
        res.send({
          'code': 400,
          'msg': '出错了-username！'
        })
      } else if (data == "") {
        console.log(data);
        res.send({
          'code': 400,
          'msg': '用户或者手机号密码出错了！',
          'data': []
        })
      } else {
        let user_id = data[0].id;
        let result = await getUserInfo(user_id);
        data[0].userinfo = result[0];
        res.send({
          'code': 200,
          'msg': '登录成功',
          'data': data[0]
        })
      }
    }
    dbConfig.sqlConnection(sql, sqlArr, callBack);
  }
}

// 修改用户资料
EditUserInfo = async (req, res) => {
  let { user_id, username, age, job, sex, path, birthday } = req.body;

  let result = await setUserName(user_id, username);

  if (result) {
    let _res = await setUserInfo(user_id, age, sex, job, path, birthday);
    if (_res.length) {
      // console.log(1);
      res.send({
        'code': 200,
        'data': '修改成功！',
        'data': _res[0],
      })
    } else {
      // console.log(2);
      res.send({
        'code': 400,
        'data': '修改失败！',
      })
    }
  } else {
    console.log(3);
    res.send({
      'code': 400,
      'data': '修改失败-编辑！',
    })
  }

}

// ---------------------------------------------------2020-11-6
// 检查用户密码的方法：
let checkuserpwd = async (user_id) => {
  let sql = `select password from user where  id=?`;
  let sqlArr = [user_id];
  let res = await dbConfig.SySqlConnent(sql, sqlArr);
  // console.log(res);
  if (res.length) {
    return res[0].password;
  } else {
    return -1
  }
}
// 修改用户密码
setPassword = async (req, res) => {
  let { user_id, oldpassword, newpassword } = req.body;
  // 检查用户密码的方法 
  let userPwd = await checkuserpwd(user_id);
  // console.log(userPwd);
  if (userPwd) {
    if (oldpassword == userPwd) {
      let sql = 'update user set password=? where id=?';
      let sqlArr = [newpassword, user_id];
      let result = await dbConfig.SySqlConnent(sql, sqlArr);
      // console.log(result);
      if (result.affectedRows == 1) {
        res.send({
          'code': 200,
          'msg': '修改密码成功！',
        })
      } else {
        res.send({
          'code': 200,
          'msg': '修改密码失败！',
        })
      }
    } else {
      res.send({
        'code': 200,
        'msg': '密码输入不一致！',
      })
    }
  } else {
    let sql = 'update user set passsword=? where id=?';
    let sqlArr = [password, user_id];
    let result = await dbConfig.SySqlConnent(sql, sqlArr);
    if (result.affectedRows == 1) {
      res.send({
        'code': 200,
        'msg': '修改密码成功！',
      })
    } else {
      res.send({
        'code': 200,
        'msg': '修改密码失败！',
      })
    }
  }
}


// 绑定用户邮箱
bindEmail = async (req, res) => {
  let { user_id, email } = req.body;
  email == (/^([a-zA-Z]|[0-9])(\w|-)+@[a-zA-Z0-9]+.([a-zA-Z]{2,4})$/) ? emial : '邮件格式不正确！';
  let sql = 'update user set email=? where id=?';
  let sqlArr = [email, user_id];
  let result = await dbConfig.SySqlConnent(sql, sqlArr);
  console.log(result);
  if (result.affectedRows == 1) {
    res.send({
      'code': 200,
      'msg': '绑定邮箱成功!'
    })
  } else {
    res.send({
      'code': 200,
      'msg': '绑定邮箱失败!'
    })
  }
}

// 退出登录
logout = (req, res) => {
  res.send({
    'code': 200,
    'msg': '退出登录!'
  })
}
// =---------------------------------------------
// 更换头像：
const fs = require('fs')
EditUserImg = (req, res) => {
  if (req.file.length === 0) {
    res.render("error", {
      'msg': '上传文件不能为空!'
    });
    return;
  } else {
    let file = req.file;
    console.log(file);
    fs.renameSync('./public/uploads/' + file.filename, './public/uploads/' + file.originalname);
    res.set({
      'content-type': 'application/json;charset=utf-8'
    });
    let { user_id } = req.query;
    let imgUrl = 'http://localhost:3000/uploads/' + file.originalname;
    let sql = 'update user set userpic=? where id=?';
    let sqlArr = [imgUrl, user_id];
    dbConfig.sqlConnection(sql, sqlArr, (err, data) => {
      if (err) {
        console.log(errr);
        throw '存在错误';
      } else {
        if (data.affectedRows == 1) {
          res.send({
            'code': 200,
            'msg': '头像修改成功',
            'url': imgUrl
          })
        } else {
          res.send({
            'code': 200,
            'msg': '头像修改失败',
            'url': imgUrl
          })
        }
      }
    })

  }
}

// 多图片上传
uploadMoreImg = (req, res) => {
  let files = req.files;
  if (req.files.length === 0) {
    res.render("error", {
      message: '上传文件不能为空!'
    });
    return;
  } else {
    for (let i in files) {
      res.set({
        'content-type': 'application/json;charset=utf-8'
      });
      let file = files[i];
      fs.renameSync('./public/uploads/' + file.filename, './public/uploads/' + file.originalname);
      let { user_id } = req.query;
      let url = 'http://localhost:3000/uploads/' + file.originalname;
      let sql = 'insert into image(url,create_time,user_id) values(?,?,?)';
      let sqlArr = [url, (new Date()).valueOf(), user_id];
      /**
       * 批量上传
       */
      // url,时间，id,
      // sqlArr = [[url, (new Date()).valueOf(), user_id], [url, (new Date()).valueOf(), user_id], [url, (new Date()).valueOf(), user_id], [url, (new Date()).valueOf(), user_id]];

      dbConfig.sqlConnection(sql, sqlArr, (err, data) => {
        if (err) {
          console.log(err);
        } else {
          if (data.affectedRows == 1) {
            res.send({
              'code': 200,
              'msg': '多图上传成功',
              // 'url': imgUrl
            })
          } else {
            res.send({
              'code': 400,
              'msg': '多图上传失败',
              // 'url': imgUrl
            })
          }
        }
      });
    }
  }
}
// --------------------------------------------------
// 发布视频的接口
pubish = async (req, res) => {
  let { user_id, title, url, path, isopen, postimg } = req.body;
  let sql = "insert into post_(user_id,title,url,path,isopen, postimg,create_time) values(?,?,?,?,?,?,?)";
  let sqlArr = [user_id, title, url, path, isopen, postimg, (new Date()).valueOf()];
  // 添加视频列表的ID
  let post_id = await dbConfig.SySqlConnent(sql, sqlArr).then(res => {
    console.log(res + '--593-');
    return res.insertId;
  }).catch(err => {
    return false;
  })
  if (post_id) {
    res.send({
      'code': 200,
      'msg': '发布成功'
    })
  } else {
    res.send({
      'code': 200,
      'msg': '发布失败'
    })
  }

}


module.exports = {
  sendCode,
  codePhoneLogin,
  sendCoreCode,
  login,
  EditUserInfo,
  setPassword,
  bindEmail,
  logout,
  EditUserImg,
  uploadMoreImg,
  pubish
}