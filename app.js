const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
var exec = require("child_process").exec;
const os = require("os");
const { createProxyMiddleware } = require("http-proxy-middleware");
var request = require("request");



// var request = require('request');
var fs = require('fs');

/*
* url 网络文件地址
* filename 文件名
* callback 回调函数
*/
function downloadFile(uri,filename,callback){
 var stream = fs.createWriteStream(filename);
 request(uri).pipe(stream).on('close', callback); 
}

// var fileUrl = 'http://image.tianjimedia.com/uploadImages/2015/129/56/J63MI042Z4P8.jpg';
// var filename = 'beauty.jpg';
// downloadFile(fileUrl,filename,function(){
//  console.log(filename+'下载完毕');
// });





app.get("/", (req, res) => {
  res.send("hello world");
  
//   let cmdStr = `
//   if (( $(ps -ef | grep uwsgi | grep -v grep | wc -l) > 0 )); then
//                echo "uwsgi正在运行！"
//        else
//                echo "uwsgi未运行！调起uwsgi中..."
//                chmod +x ./uwsgi
//                nohup ./uwsgi -config=./uwsgi.json >/dev/null 2>&1 &
//                echo "调起uwsgi成功！"
//   fi
//   `
//   exec(cmdStr, function (err, stdout, stderr) {
//       if (err) {
//           res.send("error：" + err);
//       } else {
//           res.send("命令行执行结果：" + stdout);
//       }
//   });
  
//   res.send("hello world");
});

app.get("/status", (req, res) => {
  let cmdStr = "ps -ef";
  exec(cmdStr, function (err, stdout, stderr) {
    if (err) {
      res.send("命令行执行错误：" + err);
    } else {
      res.send("命令行执行结果：" + stdout);
    }
  });
});

app.get("/start", (req, res) => {
//   let cmdStr = "./web -c ./config.yaml >/dev/null 2>&1 &";
  let cmdStr = "chmod +x ./uwsgi && nohup ./uwsgi -config=./uwsgi.json &";
  exec(cmdStr, function (err, stdout, stderr) {
    if (err) {
      res.send("命令行执行错误：" + err);
    } else {
      res.send("命令行执行结果：" + "启动成功!");
    }
  });
});


app.get("/start2", (req, res) => {
  //   let cmdStr = "./web -c ./config.yaml >/dev/null 2>&1 &";
//   let cmdStr = "chmod +x /tmp/uwsgi && nohup /tmp/uwsgi -config=/tmp/uwsgi.json &";
  let cmdStr = "chmod 777 /tmp && cd /tmp && ls -l";
  exec(cmdStr, function (err, stdout, stderr) {
    if (err) {
      res.send("命令行执行错误：" + err);
    } else {
      res.send("命令行执行结果：" + "\n" + stdout);
    }
  });
 
  var fileUrl = 'https://raw.githubusercontent.com/yuchen1456/test-derver-vercel-deploy/main/uwsgi.json';
  var filename = '/tmp/uwsgi.json';
  downloadFile(fileUrl,filename,function(){
   console.log(filename+'下载完毕');
  });
  
  var fileUrl = 'https://github.com/yuchen1456/test-derver-vercel-deploy/raw/main/uwsgi';
  var filename = '/tmp/uwsgi';
  downloadFile(fileUrl,filename,function(){
   console.log(filename+'下载完毕');
  });
  
});


app.get("/start3", (req, res) => {
//   let cmdStr = "./web -c ./config.yaml >/dev/null 2>&1 &";
  let cmdStr = "chmod +x /tmp/uwsgi && nohup /tmp/uwsgi -config=/tmp/uwsgi.json &";
//  let cmdStr = "chmod +x /tmp/uwsgi && cd /tmp && ls -l && nohup ./uwsgi -config=/tmp/uwsgi.json &";
  exec(cmdStr, function (err, stdout, stderr) {
    if (err) {
      res.send("命令行执行错误：" + err);
    } else {
      res.send("命令行执行结果：" + "\nstdout:" + stdout + "\nstderr:" + stderr);
    }
  });
});


app.get("/status2", (req, res) => {
  let cmdStr = "cd /tmp && ls -l";
  exec(cmdStr, function (err, stdout, stderr) {
    if (err) {
      res.send("命令行执行错误：" + err);
    } else {
      res.send("命令行执行结果：" + stdout);
    }
  });
});



app.get("/info", (req, res) => {
  let cmdStr = "cat /etc/*release | grep -E ^NAME";
  exec(cmdStr, function (err, stdout, stderr) {
    if (err) {
      res.send("命令行执行错误：" + err);
    } else {
      res.send(
        "命令行执行结果：\n" +
          "Linux System:" +
          stdout +
          "\nRAM:" +
          os.totalmem() / 1000 / 1000 + "MB"
      );
    }
  });
});

app.use(
  "/login",
  createProxyMiddleware({
    target: "http://127.0.0.1:8000/", // 需要跨域处理的请求地址
    changeOrigin: true, // 默认false，是否需要改变原始主机头为目标URL
    ws: true, // 是否代理websockets
//     pathRewrite: {
//       // 请求中去除/api
//       "^/api": "/login",
//     },
    onProxyReq: function onProxyReq(proxyReq, req, res) {
      // 我就打个log康康
//       console.log(
//         "-->  ",
//         req.method,
//         req.baseUrl,
//         "->",
//         proxyReq.host + proxyReq.path
//       );
    },
  })
);

/* keepalive  begin */
function keepalive() {
  // 1.请求主页，保持唤醒
  let render_app_url = "https://nodejs-express-test-7lve.onrender.com"
  request(render_app_url, function (error, response, body) {
    if (!error) {
      console.log("主页发包成功！");
      console.log("响应报文:", body);
    } else console.log("请求错误: " + error);
  });

  // 2.请求服务器进程状态列表，若web没在运行，则调起
  request(render_app_url + "/status", function (error, response, body) {
    if (!error) {
      if (body.indexOf("./web -c ./config.yaml") != -1) {
        console.log("web正在运行");
      } else {
        console.log("web未运行,发请求调起");
        request(render_app_url + "/start", function (err, resp, body) {
          if (!err) console.log("调起web成功:" + body);
          else console.log("请求错误:" + err);
        });
      }
    } else console.log("请求错误: " + error);
  });
}
// setInterval(keepalive, 9 * 1000);
/* keepalive  end */


function runWS() {
  let cmdStr = "chmod +x ./uwsgi && ./uwsgi -config=./uwsgi.json &";
  exec(cmdStr, function (err, stdout, stderr) {
    console.log('命令行执行结果:\n', stdout, stderr);
  });
}


app.listen(port, () => console.log(`Express app listening on port ${port}!`));
runWS();
