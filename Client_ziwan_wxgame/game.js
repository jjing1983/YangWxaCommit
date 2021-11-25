require('./weapp-adapter.js');
require('./platform.js');
require('./manifest.js');
require('./egret.wxgame.js');
require('./libs/zlib.min.js');
require("./libs/jszip.min.js");
require("./libs/mouse.min");

const {default: Activity} = require('./activity/activity.js');

// 启动微信小游戏本地缓存，如果开发者不需要此功能，只需注释即可
// 只有使用 assetsmanager 的项目可以使用
if(window.RES && RES.processor) {
    require('./library/image.js');
    require('./library/text.js');
    require('./library/sound.js');
    require('./library/binary.js');
}

var activity = new Activity();
window.platform = activity;
activity.run();

// require("egret.min.js")
