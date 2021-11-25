import Platform from "./platform";
/**
 * 主体判断
*/
export default class ActivityBase extends Platform {

  isSystemInfoOk = false;
  isPHPOk = false;
  isUserNameOk = false;

  run() {
    var t = this;
    t.showLoading();
    t.initGameVars();
    t.initDefault();
    t.askPHPGameVars();
    t.initSystemInfo();
    t.getUserName();
  }
  initGameVars() {
    // window.js_copyright = "适龄提示：本网络游戏适合年满16周岁以上用户使用\n抵制不良游戏，拒绝盗版游戏。注意自我保护，谨防受骗上当。适度游戏益脑，沉迷游戏伤身。合理安排时间，享受健康生活\n著作权人：上海戴思软件技术有限公司 文网游备字(2011)W-SLG047号 出版单位名称：杭州群游科技有限公司\n审批文号：科技与数字[2011]246号   游戏版号：ISBN 978-7-89989-178-0";
    window.js_gameVars = {
      configUrl: "cfgdata/",
      resUrl: "loadRes/",
      cdnServer: "https://cdn1-bxcqh5.aimiplay.com/",
      APIlocation: "https://htapi-bxcqh5.aimiplay.com/",
      clientServer: "https://client-bxcqh5.aimiplay.com/",

      cdnVersion: "?v=1.0.3",
      qufu_version: "1.0.5",
      
      bgloading: "img/bg_loading.jpg",
      bgImg:"img/bg.jpg",
  
      platform: 64,
      qudao: "64",
      channel: "64",
      isMobile: 1,
      qufuname: "热血",
      qufuType: 3,
      forwardWs: 1,
  
      debug: false,//是否开启gmPop
      publish:true,//是否为发布版，会去下载resourceVersion版本管理
      qufuTest:false,//正式开区时改成false  这样就可以直接用域名
      ssl: true,
      appid: "wx44c295b9b510a813",
      gameid: 515,
      iswx: true,
      isPreLoadZip: true,
      payType:2,
      // username: "zy1",
      platform_test: 99,
      qudao_test: "99",
      channel_test: "99",
      envVerControl:true, 
      client: 1,
      isZhHt:true,
      marginRight:30,
    };
  }
  initDefault() {
    window.platFromLoadNext = function(curItem, callback, thisObject) {
      if (curItem.indexOf("main.min.js") != -1) {
        if (window.js_gameVars.isSubpackageOk) {
          if (callback != null) {
            callback.call(thisObject, 1);
          }
        } else {
          wx.loadSubpackage({
            fail: ()=>{
                if (callback != null) {
                  callback.call(thisObject, -1);
                }
            },
            name: 'main',
            success: ()=>{
              window.js_gameVars.isSubpackageOk = false;
              console.log("下载subpackage完成");
              if (callback != null) {
                callback.call(thisObject, 1);
              }
            },
          });
        }
          return true;
      }
      return false;
    }
  }

  askPHPGameVars() {
    var t = this;
    var url = js_gameVars.clientServer+js_gameVars.platform+"/login_wxgame.php";
    wx.request({
      url: url,
      success: (res)=>{
        for (var key in res.data) {
            window.js_gameVars[key] = res.data[key];
        }
        var banshu = false;
        var needClose = false;
        const accountInfo = wx.getAccountInfoSync();
        const env = accountInfo.miniProgram.envVersion;
        if (env == "develop") { //开发者工具
            banshu = true;
        }
        else if (env == "trial") { //开发版、体验版以及审核版
            banshu = true;
        }
        else { // release:正式版
            banshu = false;
        }
        if(banshu && !js_gameVars.envVerControl) {//开发版、体验版以及审核版
            js_gameVars.platform = js_gameVars.platform_test;
            js_gameVars.qudao = js_gameVars.qudao_test;
            js_gameVars.channel = js_gameVars.channel_test;
        }
        var e = wx.getSystemInfoSync();
        var system = "ios" == e.platform ? "ios" : "android" == e.platform ? "android" : "-1" == e.system.indexOf("iOS") && "-1" == e.system.indexOf("IOS") && "-1" == e.system.indexOf("Ios") ? "android" : "ios";
        //js_gameVars.iosClose : 0 默认不关， 1 ios 关， 2 全关
        needClose = js_gameVars.iosClose == 1 ? (system == "ios" ?  true : false) : js_gameVars.iosClose == 2 ? true : false;
        console.log("版本类型：" + env);
        js_gameVars.banshu = banshu && needClose;
        t.isPHPOk = true;
        t.enterGame();
      }
    });
  }
  initSystemInfo() {
    var t = this;
    wx.getSystemInfo({
      success: (result) => {
        window.js_gameVars.wxSystemInfo = result;
        t.isSystemInfoOk = true;
        t.enterGame();
      },
    });
  }
  getUserName() {
    this.isUserNameOk = true;
    this.enterGame();
  }

  enterGame() {
    var t = this;
    if (!t.isSystemInfoOk || !t.isUserNameOk || !t.isPHPOk) {
      return;
    }
    t.hideLoading();
    egret.runEgret({
      //以下为自动修改，请勿修改
      //The following is automatically modified, please do not modify
          entryClassName: "qufu.QuFuMain",
          orientation: "landscape",
          frameRate: 60,
          scaleMode: "noScale",
          contentWidth: 1136,
          contentHeight: 640,
          // showFPS: true,
          // fpsStyles: "x:650,y:30,size:14,textColor:0xffffff,bgAlpha:0.6",
          // showLog: true,
          maxTouches: 2,
      renderMode: 'webgl',
      audioType: 0,
      calculateCanvasScaleFactor: function (context) {
          var backingStore = context.backingStorePixelRatio ||
              context.webkitBackingStorePixelRatio ||
              context.mozBackingStorePixelRatio ||
              context.msBackingStorePixelRatio ||
              context.oBackingStorePixelRatio ||
              context.backingStorePixelRatio || 1;
          return (window.devicePixelRatio || 1) / backingStore;
      }
  });
  }

  showLoading() {
    wx.showLoading({
      title: '加载中。。。',
    });
  }
  hideLoading() {
    wx.hideLoading();
  }

}