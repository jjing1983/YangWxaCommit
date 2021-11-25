let confArr = ['./zwsdk-conf', 'APP_ID', 'https://gameluotuo.cn/index.php?g=Jing&m=JingMini&a=login', 'https://gameluotuo.cn/index.php?g=Jing&m=JingMini&a=xyx_roles', 'APP_VERSION', 'https://gameluotuo.cn/index.php?g=Jing&m=JingMini&a=get_pay', 'GAME_CHANNEL', 'https://gameluotuo.cn/index.php?g=Jing&m=JingMini&a=setTunnelClick', 'https://gameluotuo.cn/index.php?g=Jing&m=JingMini&a=game_share', 'https://gameluotuo.cn/index.php?g=Wap&m=Wxaapi&a=game_share', 'https://docater1.cn1/index.php?g=Wap&m=MiniGame&a=reportClick', 'https://gameluotuo.cn/index.php/hongbao_set/?', 'https://gameluotuo.cn/index.php?g=Jing&m=JingMini&a=payback', 'https://gameluotuo.cn/index.php?g=Jing&m=JingMini&a=get_box_list&test=11', 'https://gameluotuo.cn/index.php?g=Jing&m=JingMini&a=get_open_number&test=11'];

const ZW_CONF = require(confArr[0]);

const Zwgame = {
  // 初始化
  appid: '',
  app_version: '',
  openid: '',
  session_3rd: '',
  uid: 0,
  platform: '',
  game_id: ZW_CONF['GAME_ID'],
  share_data: {},
  app_token: ZW_CONF['APP_TOKEN'],
  token: ZW_CONF['APP_TOKEN'],
  res: {},
  storne: {},
  click: {},
  open_number:0,
  open:0,
  c_id: ZW_CONF['C_ID'],
  go_appid:'wx064feacce1dfcc57',
  go_path:'',
  init: (data) => {
    Zwgame.appid = ZW_CONF[confArr[1]];
    Zwgame.app_version = ZW_CONF[confArr[4]];
    Zwgame.query = data.query;
    Zwgame.channel = ZW_CONF[confArr[6]];
    Zwgame.scene = data.scene;
    let queryData = {
      query: data.query,
      token: Zwgame.app_token,
      scene: Zwgame.scene,
    };
    Zwgame.storne.key = 'tunnel_id',
      Zwgame.GetStorage(Zwgame.storne).then((res) => {
        console.log('click', res)
        // +1 click
        if (!res) {
          queryData.ben_tunnel = 0;
        } else {
          queryData.ben_tunnel = res;
        }
        queryData.token = 'cycjyx1604556993';
        wx.request({
          url: confArr[7],
          data: queryData,
          method: "POST",
          success: (res) => {
            console.log('setres', res);
            if (res.data.set > 0) {
              Zwgame.storne.value = res.data.set,
                Zwgame.SetStorage(Zwgame.storne).then((res) => {
                  console.log('setres', res);
                })
            }
          }
        });
      })

    //get share conf
    Zwgame.getShareData();
    wx.getSystemInfo({
      success(res) {
        console.log('system', res)
        Zwgame.platform = res.platform;
      }
    })
    wx.onShow((result) => {
      console.log("onshow");
    })
    wx.onHide((result) => {
      Zwgame.open = 1;
      Zwgame.zwOpenNumber(data);
      console.log("onHide",Zwgame.open_number);
    })
    wx.showShareMenu();
    wx.onShareAppMessage(() => {
      console.log("更多分享数据", Zwgame.share_data);
      var shareData = Zwgame.share_data;


      var data = {
        title: shareData.title,
        //imageUrlId: shareData.imageUrlId,
        imageUrlId: 'mpBAp/fOSmOdV4ukk4H+Bw==',
        imageUrl: shareData.imgUrl,
        query: "uid=" + Zwgame.uid,
      }
      console.log("分享:", Zwgame.uid);
      return data;
    })
  },
  zwopen: () => new Promise(function (resolve, reject) {
    console.log("onshow:");
    Zwgame.open = 0;
   // console.log('Zwgame.open_number',Zwgame.open_number)
var interval = setInterval(function () {
      if(Zwgame.open == 0){
        Zwgame.open_number++
       // console.log('Zwgame.open_number',Zwgame.open_number)
      }else{
        clearInterval(interval);
      }

    },1000)
  }),
  // 游戏登录
  zwLogin: () => new Promise(function (resolve, reject) {
    // 发起登陆请求
    wx.login({
      success(res) {
        if (res.code) {
          // 到服务器去换取openId和用户信息
          let url = confArr[2];
          wx.request({
            url: url + "&token=" + Zwgame.app_token + "&id=" + Zwgame.c_id,
            data: {
              code: res.code,
              appid: Zwgame.appid,
              version: Zwgame.app_version,
              query: Zwgame.query,
              scene: Zwgame.scene,
              channel_id: Zwgame.channel,
              platform: Zwgame.platform
            },
            success(ret) {
              console.log('用户ret：', ret.data.data);
              resolve(ret.data.data);
              Zwgame.openid = ret.data.data.wecha_id;
              Zwgame.uid = ret.data.data.uid;
              Zwgame.session_3rd = ret.data.data.session_3rd;
              Zwgame.go_path = "view/pages/news/index?uid="+ret.data.data.uid;
            }
          })
        } else {
          return false;
        }
      },
      fail: function () {
        console.log('fail');
      }
    })
  }),
  // 创角，进入游戏，用户升级等接口
  zwReportRoleInfo: (data) => new Promise(function (resolve, reject) {
    if (typeof data === 'object') {
      let url = confArr[3];
      data.session_3rd = Zwgame.session_3rd;
      data.channel_id = Zwgame.channel;
      wx.request({
        url: url,
        data: data,
        method: "POST",
        success: (res) => {
          resolve(res.data);
        },
      })
    } else {
      return '参数格式不正确';
    }
  }),
  GetStorage: (data) => new Promise(function (resolve, reject) {
    wx.getStorage({
      key: data.key,
      success(res) {

        resolve(res.data);
      },
      fail: function () {
        resolve(0);
      }
    })
  }),
  SetStorage: (data) => new Promise(function (resolve, reject) {
    wx.setStorage({
      key: data.key,
      data: data.value,
    })
    resolve(data);
  }),
  // 下单发起支付
  zwPay: (data) => new Promise(function (resolve, reject) {
    let url = confArr[5];
    if (typeof data == 'object') {
      data.session_3rd = Zwgame.session_3rd;
      data.token = Zwgame.app_token;
      data.channel_id = Zwgame.channel;
      data.client = Zwgame.platform;
      //data.client = 'android';
      data.uid = Zwgame.uid;
      wx.request({
        url: url,
        method: 'POST',
        data: data,
        success: function (res) {
          // 后台配置支付参数
          switch (res.data.data.pay_type) {

            case "midashi":
              wx.requestMidasPayment({
                mode: res.data.data.mode,
                env: res.data.data.env,
                offerId: res.data.data.offerId,
                currencyType: res.data.data.currencyType,
                buyQuantity: res.data.data.buyQuantity,
                platform: 'android',
                success(res) {
                  let url_payback = confArr[12];
                  let data_payback = {};
                  data_payback.channel_id = Zwgame.channel;
                  data_payback.orderid = data.orderid;
                  data_payback.uid = Zwgame.uid;
                  data_payback.session_3rd = Zwgame.session_3rd;
                  data_payback.token = Zwgame.token;
                  data_payback.price = data.price;
                  data_payback.time = (new Date()).getTime();
                  console.log('url_payback', url_payback);
                  console.log('data_payback', data_payback);
                  wx.request({
                    url: url_payback,
                    method: 'POST',
                    data: data_payback,
                    success: function (res) {
                      console.log('pay_back_res', res);
                    }
                  })
                  console.log(res);
                  //支付成功后请调用后端接口
                },
                fail(res) {
                  console.log(res);
                  //TODO
                },
                complete(res) {
                  console.log(res);
                  //TODO
                }
              })
              break;
            case "kf":

              wx.showModal({
                title: '充值教程',
                content: "即将跳转官方【客服会话】充值， \n" + res.data.data.message,
                confirmText: '客服充值',
                showCancel: false,
                success: (ret) => {
                  if (ret.confirm) {
                    wx.openCustomerServiceConversation({
                      sessionFrom: res.data.data.session_from,
                      showMessageCard: true,
                      sendMessageImg: res.data.data.sendMessageImg,
                      success: () => {
                        console.log('success');
                      },
                      fail: function (res) {
                        console.log(res);
                      }
                    })
                  } else {
                    console.log('kfpay');
                  }
                }
              });
              break;
            case "xcx":
              wx.navigateToMiniProgram({
                appId: res.data.data.appid,
                path: res.data.data.path + "&uid=" + Zwgame.uid,

                success(res) {
                  // 打开成功
                }
              })
              break;
          }
          resolve(res.data);
        }
      })
    } else {
      reject('data is not obj');
    }
  }),
  zwOpenNumber: (data) => new Promise(function (resolve, reject) {
    console.log('Zwgame',Zwgame);
    let url = confArr[14];
    data.session_3rd = Zwgame.session_3rd;
    data.channel_id = Zwgame.channel;
    data.uid = Zwgame.uid;
    data.token = Zwgame.token;
    data.game_id = Zwgame.game_id;
    data.open = Zwgame.open_number;
    wx.request({
      url: url,
      data: data,
      method: "GET",
      success: (res) => {
        resolve(res.data);
      },
    })
  }),
  zwGetBox: (data) => new Promise(function (resolve, reject) {
    let url = confArr[13];
    data.session_3rd = Zwgame.session_3rd;
    data.channel_id = Zwgame.channel;
    data.uid = Zwgame.uid;
    data.token = Zwgame.token;
    data.game_id = Zwgame.game_id;
    wx.request({
      url: url,
      data: data,
      method: "GET",
      success: (res) => {
        resolve(res.data);
      },
    })
  }),
  // 绑定手机
  zwBindMobile: (data) => new Promise(function (reslove, reject) {
    let channel = Zwgame.channel;
    let openid = Zwgame.openid;
    wx.openCustomerServiceConversation({
      sessionFrom: 'WxaBind_' + openid,
      success: () => {
        console.log('success');
      }
    })
  }),
  //红包活动
  zwHongbao: (set) => new Promise(function (resolve, reject) {
    // 获取红包活动
    let url = confArr[11];
    wx.request({
      url: url + "&test=11&session_3rd=" + Zwgame.session_3rd + "&game_id=" + Zwgame.game_id,
      success(ret) {
        if (ret.data.code == 3001) {
          ret.data.status = 3001;
          ret.data.info = 'no set';
          resolve(ret.data);
          return false;
        }
        let res = {};
        res.icon = ret.data.hongbao_set.icon; //活动图标
        res.area = ret.data.hongbao_set.area; //有效区服
        res.set_rank = ret.data.hongbao_set.set_rank; //设置名称
        res.end_time = ret.data.hongbao_set.end_time; //结束时间
        res.message = ret.data.hongbao_set.message; //活动描述
        switch (set) {
          case 1:
            //红包活动首屏
            console.log('红包活动：', ret.data.hongbao_set);
            res.status = 1001;
            res.info = 'success';
            res.paihang = ret.data.paihang; //活动排行榜
            if (ret.data.require.my_roles_info) {
              res.rank = ret.data.require.my_roles_info.rank;
              res.my_paihang = ret.data.require.my_roles_info.my_paiming;
              res.my_area = ret.data.require.my_roles_info.area;
              res.my_role_name = ret.data.require.my_roles_info.role_name;
              res.my_pai_price = ret.data.require.my_pai_price;
            } else {
              res.rank = 0;
              res.my_paihang = 0;
              res.my_area = 0;
              res.my_role_name = '无';
              res.my_pai_price = 0;
            }
            res.paihang = ret.data.paihang; //活动排行榜

            break;
          case 2:
            res.status = 1001;
            res.info = 'success';
            res.require = ret.data.hongbao_set.one_require; //达标位置
            res.reward = ret.data.hongbao_set.one_reward; //奖励金额
            res.workman = ret.data.hongbao_set.one_workman; //奖励人数设置
            res.men = ret.data.require.men; //已达标人数
            if (ret.data.require.my_roles_info) {
              res.rank = ret.data.require.my_roles_info.rank;
              res.my_area = ret.data.require.my_roles_info.area;
              res.my_role_name = ret.data.require.my_roles_info.role_name;
              res.my_price = ret.data.require.my_price;
            } else {
              res.rank = 0;
              res.my_paihang = 0;
              res.my_area = 0;
              res.my_role_name = '无';
              res.my_price = 0;
            }
            break;
        }
        resolve(res);
      }
    })
  }),
  /**
   * 获取分享参数
   * params参数由3部分构成
   */

  getShareData: (set) => new Promise(function (resolve, reject) {
    wx.request({
      url: confArr[8],
      data: {
        appid: Zwgame.appid,
        channel: Zwgame.channel,
        token: Zwgame.app_token,
        game_id: Zwgame.game_id
      },
      method: 'GET',
      dataType: 'json',
      success: function (res) {
        console.log(11111111111);
        if (res.data.status == 1001) {
          console.log("分享:", res.data.info);
          Zwgame.share_data = res.data.info;
          resolve(res);
        } else {
          params.errorCallback(res);
          console.log("share失败", res);
        }
      },
      fail: function (e) {
        console.log("请求失败", e)
      }
    })
  }),

  /**
   * 分享
   * params参数由3部分构成
   * type———————-------—1，2，3，4（1:正常分享  2:分数分享  3:助力分享  4:vip分享）
   * shareQuery---------入口参数
   * successCallback----成功分享回调函数
   * errorCallback------失败分享回调函数
   */
  goShareData: (params) => {
    var shareData = Zwgame.share_data;
    console.log("紫琬share数据", shareData);
    var data = {
      title: shareData.title,
      imageUrlId: shareData.imageUrlId,
      imageUrl: shareData.imgUrl,
      query: params.shareQuery + "&share_material_id=" + shareData.id
    }
    console.log("分享:", data);
    wx.shareAppMessage(data);
    params.successCallback && params.successCallback(shareData);
  },

  /**
   * 上报分享
   * params.material_id-----素材的id
   * channel
   * appid
   * server_id----------(必填：否)所在区服
   * openid------------（必填，否）当前用户的openid
   * shareQuery--------（必填，否）用户的分享拼接字符串
   */
  upShareData: (params) => {
    var key = "sy_share_material:" + params.material_id;
    var log = Zwgame.cookieData({
      type: 'get',
      'key': key
    }) ? 1 : 0; //1-已记录，0-未记录
    if (log == 0) Zwgame.cookieData({
      type: 'set',
      key: key,
      data: (new Date()).getTime()
    });
    params.log = log;
    wx.request({
      url: confArr[9],
      data: params,
      method: 'POST',
      dataType: 'json',
      success: function (res) {
        console.log(res)
      },
      fail: function (e) {
        console.log("请求失败", e)
      }
    })
  },

  /**
   * 上报点击
   * params.material_id-----素材的id
   * params.channel
   * params.appid
   * params.shareData---(必填：否)入口参数。
   */
  upClickData: (params) => {
    var key = "sy_click_material:" + params.material_id;
    var log = Zwgame.cookieData({
      type: 'get',
      'key': key
    }) ? 1 : 0; //1-已记录，0-未记录
    if (log == 0) Zwgame.cookieData({
      type: 'set',
      key: key,
      data: (new Date()).getTime()
    });
    params.log = log;
    wx.request({
      url: confArr[10],
      data: params,
      method: 'POST',
      dataType: 'json',
      success: function (res) {
        console.log(res)
      },
      fail: function (e) {
        console.log("请求失败", e)
      }
    })
  },

  /**
   * 利用本地存储简单的记录
   * params有4个参数
   *
   * type---可选项，get，set，rm
   * key----键名
   * data---值
   * expired_at——————js的13位毫秒时间戳
   */
  cookieData: (params) => {
    switch (params.type) {
      case 'get':
        var data = wx.getStorageSync(params.key)
        try {
          data = JSON.parse(data);
          if ((new Date()).getTime() < data.expired_at) {
            return data.data;
          }
        } catch (e) { }
        return false;
        break;
      case 'set':
        if (!params.expired_at) {
          params.expired_at = new Date(new Date().toLocaleDateString()).getTime() + 3600 * 24 * 1000 * 3650;
        }
        try {
          wx.setStorageSync(params.key, JSON.stringify({
            data: params.data,
            expired_at: params.expired_at
          }))
          return true;
        } catch (e) { }
        return false;
        break;
      case 'rm':
        wx.removeStorageSync(params.key)
        return true;
        break;
    }
  }



};
export default Zwgame