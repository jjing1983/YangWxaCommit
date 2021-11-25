import ActivityBase from "./activityBase";
import Zwgame from '../sdk/zwsdk-wxapp';
export default class Activity extends ActivityBase { 

    run() {
        this.initSdk();

        this.initPush();

        this.initPay();

        this.setKeepScreenOn();

        super.run();
    }

    initSdk() {
        var data = wx.getLaunchOptionsSync();
        Zwgame.init(data);
    }

    setKeepScreenOn() {
        wx.setKeepScreenOn({
            keepScreenOn: true
        })
    }

    initSystemInfo() {
        super.initSystemInfo();
        if(js_gameVars.wxSystemInfo) {
            const safeAreaData = js_gameVars.wxSystemInfo.safeArea;
            // if (safeAreaData.height > safeAreaData.width) {
            //     js_gameVars.screenleftMargin = safeAreaData.left;
            // } else {
            //     js_gameVars.screenleftMargin = safeAreaData.top;
            // }
            js_gameVars.screenleftMargin = js_gameVars.wxSystemInfo.statusBarHeight;
        }
    }

    getUserName() {
        var t = this;
        // wx.login({
        //     success(res) {
        //         if (res.code) {
        //             t.isUserNameOk = true;
        //             t.enterGame();
        //         }
        //     }
        // })  
        
        Zwgame.zwLogin().then((res) => {
            console.log('用户：', res);
            if(res) {
                js_gameVars.username = res.uid;
                js_gameVars.openid = res.wecha_id;
                if(!js_gameVars.banshu) {
                    js_gameVars.banshu = res.pay_status == 3003;
                }
                t.isUserNameOk = true;
                t.enterGame();
            }
        })
    }

    /**数据上报 */
    initPush() {
        var t = this;
        //进入游戏
        window.apiEnterGame = function(data) {
            console.log("进入游戏返回: " + JSON.stringify(data));
            t.infoReport(data,0);
        }
        //创建角色
        window.apiCreateRole = function(data) {
             t.infoReport(data,1);
        }
        //等级提升
        window.apiLevelUp = function(data) {
             t.infoReport(data,0);
        }
    }
    
    infoReport(data,roleCTime) {
        var info = {
            area: data.serverName,				// 角色区服 (必填)
            role_name: data.roleName,			// 用户角色名(必填)
            rank: data.level,					// 等级(必填)
            new_role: roleCTime,				// 1为创角，0为登录游戏、角色升级(必填)
            money: data.nowMoney,				// 元宝数
        }
        Zwgame.zwReportRoleInfo(info).then((res) => {
            console.log("上报返回" + roleCTime,res);
        })
    }

    /**支付 */
    initPay() {
        let t = this;
        window.apiPay = function(data) {
            let payData = {
                orderid: data.orderid,			// 游戏方订单号（必填）
                product_name: data.rechargeCfg.name,  // 订单商品名称（必填）
                price: data.rechargeCfg.rmb,	// 订单金额，元为单位（必填）
                role_name: data.roleName,			// 用户充值角色名（必填）
                area: data.sid,					// 用户充值角色所在区服（必填）
                other: data.orderid,				// 其他信息（非必填）
            };
            Zwgame.zwPay(payData).then((res) => {
                console.log("支付发起返回: " + JSON.stringify(res));
            })
        }
    }

    sendShare() {
        Zwgame.getShareData(1).then((res) => {
            console.log('游戏内分享',res.data);
            if(res.data && res.data.info) {
                var title = res.data.info.title;
                var imageUrl = res.data.info.image;
                var path = '';
                wx.shareAppMessage({
                    title: title,
                    imageUrl: imageUrl,
                    query: path,
                    success(res){
                        console.log("----shareAppMessage----success");
                    },fail(res){
                        console.log("----shareAppMessage----fail");
                    } 
                });
            }
        })
    }

    getBox() {
        Zwgame.zwGetBox(data).then((res) => {
            console.log(res);
        })
    }

    reload() {
        window.location.reload();
    }

    onActiveBtnBeClick(idx) {
        switch (idx) {
            case 1055:
                wx.navigateToMiniProgram({
                    appId: Zwgame.go_appid,
                    path: Zwgame.go_path,
                    success(res) {
                        console.log("账号跳转: " + JSON.stringify(res));
                    }
                })
                break;
        }
    }

    isActiveBtnShow(idx) {
        switch(idx) {
            case 1055: //账号互通
                return js_gameVars.isZhHt;
                break;
        }
    }

    getActiveBtnImageUrl(idx) {
        return "";
    }
}