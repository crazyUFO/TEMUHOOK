// ==UserScript==
// @name         TEMUHOOK
// @namespace    SAN
// @version      3.0
// @description  TEMUHOOK 提交
// @author       XIAOSAN
// @match        *://seller.kuajingmaihuo.com/*
// @match        *://agentseller.temu.com/*
// @homepageURL  https://www.baidu.com
// @updateURL    https://raw.githubusercontent.com/crazyUFO/TEMUHOOK/refs/heads/main/dist/main.min.js
// @downloadURL  https://raw.githubusercontent.com/crazyUFO/TEMUHOOK/refs/heads/main/dist/main.min.js
// @require      https://cdn.jsdelivr.net/npm/vue@3.5.13/dist/vue.global.min.js
// @require      data:application/javascript,unsafeWindow.Vue%3DVue%2Cthis.Vue%3DVue%3B
// @require      https://cdn.jsdelivr.net/npm/element-plus@2.9.5/dist/index.full.min.js
// @resource     ELEMENT_CSS https://cdn.jsdelivr.net/npm/element-plus@2.9.5/dist/index.min.css
// @grant        unsafeWindow
// @grant        GM_getResourceText
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function () {
  "use strict";

  // 引入UI的CSS
  const elementPlusCss = GM_getResourceText("ELEMENT_CSS");
  GM_addStyle(elementPlusCss);

  // 自定义CSS
  GM_addStyle(`
        #vueApp{
            position: fixed;
            top: 50%;
            right: 30px;
            z-index: 99999;
        }
        #vueApp .fix-tabs{
            display: flex;
            flex-direction: column-reverse;
        }
        .el-tag + .el-tag {
          margin-left: 10px;
        }
        #vueApp .logBox{
            margin-bottom: 20px;
            max-height: 300px;
            overflow: auto;
        }
        #vueApp .process-progress{
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-top: 10px;
            justify-content: space-between;
            align-items: center;
        }
        .is-blockPopUps [data-testid="beast-core-modal-mask"],
        .is-blockPopUps [data-testid="beast-core-modal"]{
            display: none !important;
        }
        .el-overlay.is-message-box {
          z-index: 999999 !important; /* 例如 3000 */
        }
    `);

  // HTML模板
  let appHtml = `
        <div id="vueApp">
            <el-button type="info" @click="openPanl">TEMUHOOK</el-button>

            <el-drawer v-model="settingDrawer" title="设置面板" :with-header="false" >

                <el-tabs type="border-card" class="fix-tabs" v-model="currentTab">
<!--                     <el-tab-pane label="全局">
                        <el-form :model="configSetting" label-width="auto">
                            <el-form-item label="隐藏弹窗">
                                <el-switch v-model="configSetting.blockPopUps" :disabled="fetchState" />
                            </el-form-item>
                            <el-form-item label="页面大小">
                                <el-input v-model="configSetting.pageSize" :disabled="fetchState" />
                            </el-form-item>
                            <el-form-item label="起始页码">
                                <el-input v-model="configSetting.pageNum" :disabled="fetchState" />
                            </el-form-item>
                            <el-form-item label="自动翻页">
                                <el-switch v-model="configSetting.autoPage" :disabled="fetchState" />
                            </el-form-item>
                            <el-form-item label="等待时间">
                                <el-input v-model="configSetting.waitSeconds" :disabled="fetchState" />
                            </el-form-item>
                        </el-form>
                    </el-tab-pane> -->
                    <el-tab-pane label="上新生命周期" name="SMZQ">
                        <el-form :model="configSetting" label-width="auto">
                            <el-table :data="configSetting.abandonPriceRule" style="width: 100%">
                                <el-table-column label="价格(分)">
                                    <template #default="scope">
                                        <el-input-number v-model="scope.row.price" :min="0" :precision="0" :disabled="fetchState" controls-position="right" />
                                    </template>
                                </el-table-column>
                                <el-table-column label="最高价格(分)">
                                    <template #default="scope">
                                        <el-input-number v-model="scope.row.maxPrice" :min="0" :precision="0" :disabled="fetchState" controls-position="right" />
                                    </template>
                                </el-table-column>
                                <el-table-column label="" width="100">
                                    <template #default="scope">
                                        <el-button size="small" type="danger" @click="SMZQ_abandonPriceRuleDelete(scope.$index, scope.row)" :disabled="fetchState">
                                        Delete
                                        </el-button>
                                    </template>
                                </el-table-column>
                            </el-table>
                            <div style="margin-top: 30px;">
                                <el-button type="info" @click="SMZQ_abandonPriceRuleAdd" :disabled="configSetting.abandonPriceRule.length > 0">添加金额规则</el-button>
                            </div>
                        </el-form>
                    </el-tab-pane>
                    <el-tab-pane label="活动申报" name="HDSB">
                        <el-form :model="configSetting" label-width="auto">
                            <el-table :data="configSetting.activityPriceRule" style="width: 100%">
                                <el-table-column label="价格(分)">
                                    <template #default="scope">
                                        <el-input-number v-model="scope.row.price" :min="0" :precision="0" :disabled="fetchState" controls-position="right" />
                                    </template>
                                </el-table-column>
                                <el-table-column label="最高价格(分)">
                                    <template #default="scope">
                                        <el-input-number v-model="scope.row.maxPirce" :min="0" :precision="0" :disabled="fetchState" controls-position="right" />
                                    </template>
                                </el-table-column>
                                <el-table-column label="" width="100">
                                    <template #default="scope">
                                        <el-button size="small" type="danger" @click="HDSB_activityPirceDelete(scope.$index, scope.row)" :disabled="fetchState">
                                        Delete
                                        </el-button>
                                    </template>
                                </el-table-column>
                            </el-table>
                            <div style="margin-top: 30px;">
                                <el-button type="info" @click="HDSB_activityPirceAdd" :disabled="configSetting.activityPriceRule.length > 0">添加金额规则</el-button>
                            </div>
                        <el-divider>过滤字符</el-divider>
                            <el-table :data="configSetting.activityFilerStrRule" style="width: 100%">
                                <el-table-column label="SKU属性集">
                                    <template #default="scope">
                                        <el-input v-model="scope.row.str"  :disabled="fetchState" controls-position="right" />
                                    </template>
                                </el-table-column>
                                <el-table-column label="" width="100">
                                    <template #default="scope">
                                        <el-button size="small" type="danger" @click="HDSB_activityFilerStrDel(scope.$index, scope.row)" :disabled="fetchState">
                                        Delete
                                        </el-button>
                                    </template>
                                </el-table-column>
                            </el-table>
                            <div style="margin-top: 30px;">
                                <el-button type="info" @click="HDSB_activityFilerStrAdd">添加字符匹配过滤</el-button>
                            </div>
                        <el-divider>活动库存</el-divider>
                            <el-table :data="configSetting.activityTargetActivityStock" style="width: 100%">
                                <el-table-column label="库存数量">
                                    <template #default="scope">
                                        <el-input v-model="scope.row.num"  :disabled="fetchState" controls-position="right" />
                                    </template>
                                </el-table-column>
                                <el-table-column label="" width="100">
                                    <template #default="scope">
                                        <el-button size="small" type="danger" @click="HDSB_activityTargetActivityStockDel(scope.$index, scope.row)" :disabled="fetchState">
                                        Delete
                                        </el-button>
                                    </template>
                                </el-table-column>
                            </el-table>
                            <div style="margin-top: 30px;">
                                <el-button type="info" @click="HDSB_activityTargetActivityStockAdd" :disabled="configSetting.activityTargetActivityStock.length > 0">添加数量</el-button>
                            </div>

                        </el-form>
                    </el-tab-pane>
                </el-tabs>
                <div style="margin-top: 30px;" v-if="siteList.length">
                  <el-divider content-position="left">选择站点 <el-button type="text" :disabled="siteList.length == 0" @click="showSelectSite">更改</el-button></el-divider>
                  <!--<template v-if="siteList.length"><el-tag size="small" v-for="val in configSetting.checkedSites" :key="val">{{siteLabel(val) }}</el-tag></template>-->
                  <el-tag size="small" v-if="configSetting.checkedSites" >{{siteLabel(configSetting.checkedSites) }}</el-tag>
                </div>
                <div style="margin-top: 30px;" v-if="malInfoList.length">
                <el-divider  content-position="left">选择店铺</el-divider> 
                <el-radio-group v-model="configSetting.mallId">
                        <el-radio v-for="item in malInfoList" :key="item.mallId" :value="item.mallId" :disabled="fetchState">{{item.mallName}}</el-radio>
                    </el-radio-group>
                </div>
<!--                 <div style="margin-top: 30px;">
                    <el-button type="info" @click="dialogLogVisible = true">日志</el-button>
                <div> -->


                <div style="margin-top: 30px;" v-if="getUserInfoState && configSetting.mallId">
                  <el-button v-if="currentTab == 'SMZQ'" :loading="fetchState" type="primary" @click="handleClick('上新生命周期')">上新生命周期</el-button>

<!--                       <el-button type="info" @click="handleClick('批量签署JIT规则')">批量签署JIT规则</el-button> -->

                    <el-button v-if="currentTab == 'HDSB'" :loading="fetchState" type="primary" @click="handleClick('批量活动申报')">批量活动申报</el-button>
                </div>

            </el-drawer>

            <el-dialog v-model="dialogLogVisible" :title="'日志: ' + clickState" destroy-on-close>
                <template v-if="clickState == '上新生命周期'">
                    <div class="logBox" v-if="logList.length">
                        <ul>
                            <li v-for="item in logList">
                                {{item.text}}
                            </li>
                        </ul>
                    </div>
                    <template v-if="logInfo.totals > 0">
                        <div><el-progress :percentage="Number((logInfo.index / logInfo.totals * 100).toFixed(2))" /></div>
                        <div class="process-progress"><span>任务进度: {{logInfo.text}}</span><span>{{logInfo.index}}/{{logInfo.totals}}</span></div>
                    </template>
                </template>
                <template v-if="clickState == '批量签署JIT规则'">
                    <div class="logBox" v-if="logList.length">
                        <ul>
                            <li v-for="item in logList">
                                {{item.text}}
                            </li>
                        </ul>
                    </div>
                </template>
                <template v-if="clickState == '批量活动申报'">
                    <div class="logBox" v-if="logList.length">
                        <ul>
                            <li v-for="item in logList">
                                {{item.text}}
                            </li>
                        </ul>
                    </div>
                </template>
            </el-dialog>

            <el-dialog v-model="dialogSiteVisible" title="选择地区" destroy-on-close>
              <!--<el-checkbox-group v-model="configSetting.checkedSites" >
                  <el-checkbox v-for="val in siteList" :label="val.siteId" :key="val.siteId">{{val.siteName}}</el-checkbox>
              </el-checkbox-group>-->
                <el-radio-group v-model="configSetting.checkedSites" @change="dialogSiteVisible = false">
                  <el-radio v-for="val in siteList" :label="val.siteId" :key="val.siteId">{{val.siteName}}</el-radio>
              </el-radio-group>
            </el-dialog>
        </div>
    `;
  let vueEl = document.createElement("div");
  vueEl.innerHTML = appHtml;
  console.log(document.cookie);
  document.body.append(vueEl);
  const App = {
    data() {
      return {
        settingDrawer: false,
        currentTab: "SMZQ",
        dialogLogVisible: false,
        dialogSiteVisible: false,
        selectedActivity: "",
        siteList: [
          {
            siteId: 100,
            siteName: "美国站",
            dr: "us",
            matchSemiManaged: true,
            matchPreSemiHosting: false,
          },
          {
            siteId: 101,
            siteName: "加拿大站",
            dr: "us",
            matchSemiManaged: true,
            matchPreSemiHosting: false,
          },
          {
            siteId: 102,
            siteName: "英国站",
            dr: "eu",
            matchSemiManaged: true,
            matchPreSemiHosting: false,
          },
          {
            siteId: 103,
            siteName: "澳大利亚站",
            dr: "us",
            matchSemiManaged: true,
            matchPreSemiHosting: false,
          },
          {
            siteId: 104,
            siteName: "新西兰站",
            dr: "us",
            matchSemiManaged: true,
            matchPreSemiHosting: false,
          },
          {
            siteId: 105,
            siteName: "德国站",
            dr: "eu",
            matchSemiManaged: true,
            matchPreSemiHosting: true,
          },
          {
            siteId: 106,
            siteName: "法国站",
            dr: "eu",
            matchSemiManaged: true,
            matchPreSemiHosting: true,
          },
          {
            siteId: 107,
            siteName: "意大利站",
            dr: "eu",
            matchSemiManaged: true,
            matchPreSemiHosting: true,
          },
          {
            siteId: 108,
            siteName: "荷兰站",
            dr: "eu",
            matchSemiManaged: true,
            matchPreSemiHosting: true,
          },
          {
            siteId: 109,
            siteName: "西班牙站",
            dr: "eu",
            matchSemiManaged: true,
            matchPreSemiHosting: true,
          },
          {
            siteId: 110,
            siteName: "墨西哥站",
            dr: "us",
            matchSemiManaged: true,
            matchPreSemiHosting: false,
          },
          {
            siteId: 111,
            siteName: "葡萄牙站",
            dr: "eu",
            matchSemiManaged: true,
            matchPreSemiHosting: true,
          },
          {
            siteId: 112,
            siteName: "波兰站",
            dr: "eu",
            matchSemiManaged: true,
            matchPreSemiHosting: true,
          },
          {
            siteId: 113,
            siteName: "瑞典站",
            dr: "eu",
            matchSemiManaged: true,
            matchPreSemiHosting: true,
          },
          {
            siteId: 114,
            siteName: "瑞士站",
            dr: "eu",
            matchSemiManaged: true,
            matchPreSemiHosting: false,
          },
          {
            siteId: 115,
            siteName: "希腊",
            dr: "eu",
            matchSemiManaged: true,
            matchPreSemiHosting: true,
          },
          {
            siteId: 116,
            siteName: "爱尔兰",
            dr: "eu",
            matchSemiManaged: true,
            matchPreSemiHosting: true,
          },
          {
            siteId: 117,
            siteName: "塞浦路斯",
            dr: "eu",
            matchSemiManaged: true,
            matchPreSemiHosting: true,
          },
          {
            siteId: 118,
            siteName: "日本站",
            dr: "us",
            matchSemiManaged: true,
            matchPreSemiHosting: false,
          },
          {
            siteId: 119,
            siteName: "韩国站",
            dr: "us",
            matchSemiManaged: false,
            matchPreSemiHosting: false,
          },
          {
            siteId: 120,
            siteName: "沙特站",
            dr: "eu",
            matchSemiManaged: true,
            matchPreSemiHosting: false,
          },
          {
            siteId: 121,
            siteName: "新加坡站",
            dr: "us",
            matchSemiManaged: false,
            matchPreSemiHosting: false,
          },
          {
            siteId: 122,
            siteName: "阿联酋站",
            dr: "eu",
            matchSemiManaged: true,
            matchPreSemiHosting: false,
          },
          {
            siteId: 123,
            siteName: "科威特站",
            dr: "eu",
            matchSemiManaged: true,
            matchPreSemiHosting: false,
          },
          {
            siteId: 124,
            siteName: "挪威站",
            dr: "eu",
            matchSemiManaged: true,
            matchPreSemiHosting: false,
          },
          {
            siteId: 125,
            siteName: "智利站",
            dr: "us",
            matchSemiManaged: true,
            matchPreSemiHosting: false,
          },
          {
            siteId: 126,
            siteName: "马来西亚站",
            dr: "us",
            matchSemiManaged: true,
            matchPreSemiHosting: false,
          },
          {
            siteId: 127,
            siteName: "菲律宾站",
            dr: "us",
            matchSemiManaged: true,
            matchPreSemiHosting: false,
          },
          {
            siteId: 128,
            siteName: "中国台湾站",
            dr: "us",
            matchSemiManaged: false,
            matchPreSemiHosting: false,
          },
          {
            siteId: 129,
            siteName: "泰国站",
            dr: "us",
            matchSemiManaged: true,
            matchPreSemiHosting: false,
          },
          {
            siteId: 130,
            siteName: "卡塔尔站",
            dr: "eu",
            matchSemiManaged: true,
            matchPreSemiHosting: false,
          },
          {
            siteId: 131,
            siteName: "约旦站",
            dr: "eu",
            matchSemiManaged: true,
            matchPreSemiHosting: false,
          },
          {
            siteId: 132,
            siteName: "巴西站",
            dr: "us",
            matchSemiManaged: false,
            matchPreSemiHosting: false,
          },
          {
            siteId: 133,
            siteName: "阿曼站",
            dr: "eu",
            matchSemiManaged: true,
            matchPreSemiHosting: false,
          },
          {
            siteId: 134,
            siteName: "巴林站",
            dr: "eu",
            matchSemiManaged: true,
            matchPreSemiHosting: false,
          },
          {
            siteId: 135,
            siteName: "以色列站",
            dr: "eu",
            matchSemiManaged: true,
            matchPreSemiHosting: false,
          },
          {
            siteId: 136,
            siteName: "南非站",
            dr: "eu",
            matchSemiManaged: true,
            matchPreSemiHosting: false,
          },
          {
            siteId: 141,
            siteName: "保加利亚站",
            dr: "eu",
            matchSemiManaged: true,
            matchPreSemiHosting: true,
          },
          {
            siteId: 137,
            siteName: "捷克站",
            dr: "eu",
            matchSemiManaged: true,
            matchPreSemiHosting: true,
          },
          {
            siteId: 138,
            siteName: "匈牙利站",
            dr: "eu",
            matchSemiManaged: true,
            matchPreSemiHosting: true,
          },
          {
            siteId: 139,
            siteName: "丹麦站",
            dr: "eu",
            matchSemiManaged: true,
            matchPreSemiHosting: true,
          },
          {
            siteId: 140,
            siteName: "罗马尼亚站",
            dr: "eu",
            matchSemiManaged: true,
            matchPreSemiHosting: true,
          },
          {
            siteId: 142,
            siteName: "比利时站",
            dr: "eu",
            matchSemiManaged: true,
            matchPreSemiHosting: true,
          },
          {
            siteId: 143,
            siteName: "奥地利站",
            dr: "eu",
            matchSemiManaged: true,
            matchPreSemiHosting: true,
          },
          {
            siteId: 144,
            siteName: "芬兰站",
            dr: "eu",
            matchSemiManaged: true,
            matchPreSemiHosting: true,
          },
          {
            siteId: 145,
            siteName: "斯洛伐克站",
            dr: "eu",
            matchSemiManaged: true,
            matchPreSemiHosting: true,
          },
          {
            siteId: 146,
            siteName: "克罗地亚站",
            dr: "eu",
            matchSemiManaged: true,
            matchPreSemiHosting: true,
          },
          {
            siteId: 147,
            siteName: "斯洛文尼亚站",
            dr: "eu",
            matchSemiManaged: true,
            matchPreSemiHosting: true,
          },
          {
            siteId: 148,
            siteName: "立陶宛站",
            dr: "eu",
            matchSemiManaged: true,
            matchPreSemiHosting: true,
          },
          {
            siteId: 149,
            siteName: "爱沙尼亚站",
            dr: "eu",
            matchSemiManaged: true,
            matchPreSemiHosting: true,
          },
          {
            siteId: 150,
            siteName: "拉脱维亚站",
            dr: "eu",
            matchSemiManaged: true,
            matchPreSemiHosting: true,
          },
          {
            siteId: 151,
            siteName: "马耳他站",
            dr: "eu",
            matchSemiManaged: true,
            matchPreSemiHosting: true,
          },
          {
            siteId: 152,
            siteName: "卢森堡站",
            dr: "eu",
            matchSemiManaged: true,
            matchPreSemiHosting: true,
          },
          {
            siteId: 153,
            siteName: "塞尔维亚",
            dr: "eu",
            matchSemiManaged: true,
            matchPreSemiHosting: false,
          },
          {
            siteId: 154,
            siteName: "摩尔多瓦",
            dr: "eu",
            matchSemiManaged: true,
            matchPreSemiHosting: false,
          },
          {
            siteId: 155,
            siteName: "黑山",
            dr: "eu",
            matchSemiManaged: true,
            matchPreSemiHosting: false,
          },
          {
            siteId: 156,
            siteName: "冰岛",
            dr: "eu",
            matchSemiManaged: true,
            matchPreSemiHosting: false,
          },
          {
            siteId: 157,
            siteName: "安道尔",
            dr: "eu",
            matchSemiManaged: false,
            matchPreSemiHosting: false,
          },
          {
            siteId: 158,
            siteName: "波黑",
            dr: "eu",
            matchSemiManaged: true,
            matchPreSemiHosting: false,
          },
          {
            siteId: 159,
            siteName: "阿尔巴尼亚",
            dr: "eu",
            matchSemiManaged: true,
            matchPreSemiHosting: false,
          },
          {
            siteId: 160,
            siteName: "北马其顿-已废弃",
            dr: "eu",
            matchSemiManaged: false,
            matchPreSemiHosting: false,
          },
          {
            siteId: 162,
            siteName: "哈萨克斯坦",
            dr: "eu",
            matchSemiManaged: false,
            matchPreSemiHosting: false,
          },
          {
            siteId: 163,
            siteName: "秘鲁",
            dr: "us",
            matchSemiManaged: true,
            matchPreSemiHosting: false,
          },
          {
            siteId: 164,
            siteName: "哥伦比亚",
            dr: "us",
            matchSemiManaged: true,
            matchPreSemiHosting: false,
          },
          {
            siteId: 165,
            siteName: "格鲁吉亚",
            dr: "eu",
            matchSemiManaged: true,
            matchPreSemiHosting: false,
          },
          {
            siteId: 166,
            siteName: "亚美尼亚",
            dr: "eu",
            matchSemiManaged: true,
            matchPreSemiHosting: false,
          },
          {
            siteId: 167,
            siteName: "阿塞拜疆",
            dr: "eu",
            matchSemiManaged: true,
            matchPreSemiHosting: false,
          },
          {
            siteId: 168,
            siteName: "乌克兰",
            dr: "eu",
            matchSemiManaged: false,
            matchPreSemiHosting: false,
          },
          {
            siteId: 169,
            siteName: "乌拉圭",
            dr: "us",
            matchSemiManaged: false,
            matchPreSemiHosting: false,
          },
          {
            siteId: 161,
            siteName: "科索沃",
            dr: "eu",
            matchSemiManaged: false,
            matchPreSemiHosting: false,
          },
          {
            siteId: 170,
            siteName: "毛里求斯",
            dr: "eu",
            matchSemiManaged: true,
            matchPreSemiHosting: false,
          },
          {
            siteId: 171,
            siteName: "摩洛哥",
            dr: "eu",
            matchSemiManaged: true,
            matchPreSemiHosting: false,
          },
          {
            siteId: 172,
            siteName: "多米尼加",
            dr: "us",
            matchSemiManaged: false,
            matchPreSemiHosting: false,
          },
          {
            siteId: 173,
            siteName: "哥斯达黎加",
            dr: "us",
            matchSemiManaged: false,
            matchPreSemiHosting: false,
          },
          {
            siteId: 174,
            siteName: "土耳其",
            dr: "eu",
            matchSemiManaged: false,
            matchPreSemiHosting: false,
          },
          {
            siteId: 175,
            siteName: "阿尔及利亚站",
            dr: "eu",
            matchSemiManaged: false,
            matchPreSemiHosting: false,
          },
          {
            siteId: 176,
            siteName: "巴拿马站",
            dr: "us",
            matchSemiManaged: true,
            matchPreSemiHosting: false,
          },
          {
            siteId: 177,
            siteName: "肯尼亚站",
            dr: "eu",
            matchSemiManaged: false,
            matchPreSemiHosting: false,
          },
          {
            siteId: 178,
            siteName: "厄瓜多尔站",
            dr: "us",
            matchSemiManaged: true,
            matchPreSemiHosting: false,
          },
          {
            siteId: 179,
            siteName: "特立尼达和多巴哥站",
            dr: "us",
            matchSemiManaged: false,
            matchPreSemiHosting: false,
          },
          {
            siteId: 180,
            siteName: "危地马拉站",
            dr: "us",
            matchSemiManaged: false,
            matchPreSemiHosting: false,
          },
          {
            siteId: 181,
            siteName: "乌兹别克斯坦站",
            dr: "eu",
            matchSemiManaged: false,
            matchPreSemiHosting: false,
          },
          {
            siteId: 182,
            siteName: "洪都拉斯站",
            dr: "us",
            matchSemiManaged: false,
            matchPreSemiHosting: false,
          },
          {
            siteId: 183,
            siteName: "萨尔瓦多站",
            dr: "us",
            matchSemiManaged: false,
            matchPreSemiHosting: false,
          },
          {
            siteId: 184,
            siteName: "巴基斯坦站",
            dr: "eu",
            matchSemiManaged: false,
            matchPreSemiHosting: false,
          },
          {
            siteId: 185,
            siteName: "斯里兰卡站",
            dr: "eu",
            matchSemiManaged: true,
            matchPreSemiHosting: false,
          },
          {
            siteId: 186,
            siteName: "蒙古站",
            dr: "eu",
            matchSemiManaged: false,
            matchPreSemiHosting: false,
          },
          {
            siteId: 187,
            siteName: "越南站",
            dr: "us",
            matchSemiManaged: true,
            matchPreSemiHosting: false,
          },
          {
            siteId: 188,
            siteName: "文莱站",
            dr: "us",
            matchSemiManaged: true,
            matchPreSemiHosting: false,
          },
          {
            siteId: 189,
            siteName: "阿根廷站",
            dr: "us",
            matchSemiManaged: false,
            matchPreSemiHosting: false,
          },
          {
            siteId: 190,
            siteName: "尼日利亚站",
            dr: "eu",
            matchSemiManaged: false,
            matchPreSemiHosting: false,
          },
          {
            siteId: 191,
            siteName: "柬埔寨站",
            dr: "us",
            matchSemiManaged: false,
            matchPreSemiHosting: false,
          },
          {
            siteId: 192,
            siteName: "北马其顿",
            dr: "eu",
            matchSemiManaged: true,
            matchPreSemiHosting: false,
          },
          {
            siteId: 193,
            siteName: "孟加拉站",
            dr: "us",
            matchSemiManaged: false,
            matchPreSemiHosting: false,
          },
          {
            siteId: 194,
            siteName: "吉尔吉斯斯坦站",
            dr: "eu",
            matchSemiManaged: true,
            matchPreSemiHosting: false,
          },
          {
            siteId: 196,
            siteName: "马尔代夫站",
            dr: "eu",
            matchSemiManaged: false,
            matchPreSemiHosting: false,
          },
          {
            siteId: 197,
            siteName: "列支敦士登站",
            dr: "eu",
            matchSemiManaged: false,
            matchPreSemiHosting: false,
          },
          {
            siteId: 198,
            siteName: "加纳站",
            dr: "eu",
            matchSemiManaged: false,
            matchPreSemiHosting: false,
          },
          {
            siteId: 199,
            siteName: "埃及站",
            dr: "eu",
            matchSemiManaged: false,
            matchPreSemiHosting: false,
          },
          {
            siteId: 200,
            siteName: "巴拉圭站",
            dr: "us",
            matchSemiManaged: false,
            matchPreSemiHosting: false,
          },
        ],
        configSetting: Object.assign(
          {
            Cookie: "",
            blockPopUps: false,
            pageSize: 100,
            pageNum: 1,
            autoPage: true,
            waitSeconds: 5,
            abandonPriceRule: [],
            activityPriceRule: [],
            activityFilerStrRule: [],
            activityTargetActivityStock: [],
            token: null,
            checkedSites: null,
          },
          GM_getValue("configSetting"),
          { Cookie: document.cookie }
        ),
        getUserInfoState: false,
        clickState: "",
        fetchState: false,
        malInfoList: [],
        activityList: [],
        currentActivity: 25022164983552,
        logList: [],
        logInfo: {
          index: 0,
          totals: 0,
          text: "",
        },
      };
    },
    mounted() {
      this.$nextTick(async () => {
        await this.getUserInfo();
        this.getSiteList();
        this.HDSB_getActivityList();
        const body = unsafeWindow.document.body;
        if (this.configSetting.blockPopUps) {
          body.classList.add("is-blockPopUps");
        }
        this.configSetting;
      });
    },
    methods: {
      /**
       * 打开设置面板
       */
      openPanl: async function () {
        let is_open = await this.checkToken();
        if (is_open) {
          this.settingDrawer = true;
        }
        //
      },
      /**
       * 令牌输入框
       * @param {string} value 令牌
       * @returns {Promise}  resolve(value) or reject(null)
       */
      login() {
        this.$prompt("输入令牌", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          customClass: "login-message-box",
          inputPattern:
            /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/,
          inputErrorMessage: "输入令牌格式不正确",
        })
          .then(({ value }) => {
            let url = "http://81.69.13.209:8765/login";
            GM_xmlhttpRequest({
              url,
              method: "POST", // 指定请求方法为POST
              headers: {
                "Content-Type": "application/json", // 设置请求头，告诉服务器发送的是JSON数据
              },
              data: JSON.stringify({ username: value }),
              onload: (response) => {
                console.log(response);
                if (response.status == 200) {
                  this.configSetting.token = value;
                  this.$message({
                    type: "success",
                    message: "你的令牌是: " + value,
                  });
                  this.settingDrawer = true;
                } else {
                  this.$message({
                    type: "error",
                    message: "没有此令牌",
                  });
                  setTimeout(() => {
                    this.login();
                  }, 1000);
                }
              },

              onerror: (error) => {
                console.error("Error:", error);
              },
            }); // 解析JSON响应
          })
          .catch(() => {
            this.$message({
              type: "error",
              message: "取消输入",
            });
          });
      },

      checkToken: async function () {
        let url = "http://81.69.13.209:8765/protected";

        // 返回一个新的 Promise
        return new Promise((resolve, reject) => {
          // 如果 token 不存在，直接调用 login 并返回 false
          if (!this.configSetting.token) {
            this.login();
            resolve(false);
            return;
          }
          GM_xmlhttpRequest({
            url,
            method: "GET",
            headers: {
              "X-Username": this.configSetting.token,
            },
            onload: (response) => {
              if (response.status === 200) {
                // 请求成功，返回 true
                resolve(true);
              } else {
                // 请求失败，清空 token 并返回 false
                this.configSetting.token = null;
                this.login();
                this.$message({
                  type: "error",
                  message: "失效的令牌",
                });
                resolve(false);
              }
            },
            onerror: (error) => {
              // 请求出错，返回 false
              console.error("Error:", error);
              resolve(false);
            },
          });
        });
      },
      /**
       * 获取商品
       * @param {*}pageToken 下一页token
       * @returns
       */
      HDSB_getMatch: function (pageToken) {
        const configSetting = this.configSetting;
        const urlParams = new URLSearchParams(window.location.search);

        let type = urlParams.get("type");
        let thematicId = urlParams.get("thematicId");
        // 定义请求的URL
        const url =
          "https://agentseller.temu.com/api/kiana/gamblers/marketing/enroll/semi/scroll/match";

        // pageSize = typeof pageSize == "undefined" ? configSetting.pageSize : pageSize;
        // 定义要发送的数据
        const data = {
          activityThematicId: thematicId * 1,
          activityType: type * 1,
          addSite: true,
          rowCount: 50,
        };
        if (pageToken) {
          data["searchScrollContext"] = pageToken;
        }
        // 使用fetch API发起POST请求
        return fetch(url, {
          method: "POST", // 指定请求方法为POST
          headers: {
            "Content-Type": "application/json", // 设置请求头，告诉服务器发送的是JSON数据
            Cookie: configSetting.Cookie, // 添加Cookie标头
            mallid: configSetting.mallId, // 添加mallid标头
          },
          body: JSON.stringify(data), // 将JavaScript对象转换为JSON字符串
        }).then((response) => response.json()); // 解析JSON响应
      },
      HDSB_submit: async function (productList) {
        const configSetting = this.configSetting;
        const urlParams = new URLSearchParams(window.location.search);
        const url =
          "https://agentseller.temu.com/api/kiana/gamblers/marketing/enroll/semi/submit";
        let type = urlParams.get("type");
        let thematicId = urlParams.get("thematicId");
        const data = {
          activityThematicId: thematicId,
          activityType: type,
          productList: productList,
        };
        // 使用fetch API发起POST请求
        return fetch(url, {
          method: "POST", // 指定请求方法为POST
          headers: {
            "Content-Type": "application/json", // 设置请求头，告诉服务器发送的是JSON数据
            Cookie: configSetting.Cookie, // 添加Cookie标头
            mallid: configSetting.mallId, // 添加mallid标头
          },
          body: JSON.stringify(data), // 将JavaScript对象转换为JSON字符串
        }).then((response) => response.json()); // 解析JSON响应
      },
      /**
       * 获取活动列表
       * @returns {Promise} Promise对象，resolve一个活动列表对象
       */
      HDSB_getActivityList: function () {
        const configSetting = this.configSetting;
        // 定义请求的URL
        const url =
          "https://seller.kuajingmaihuo.com/marvel-mms/cn/api/kiana/gambit/marketing/enroll/activity/list";
        const data = {
          needCanEnrollCnt: true,
          needSessionItem: true,
        };
        // 使用fetch API发起POST请求
        fetch(url, {
          method: "POST", // 指定请求方法为POST
          headers: {
            "Content-Type": "application/json", // 设置请求头，告诉服务器发送的是JSON数据
            Cookie: configSetting.Cookie, // 添加Cookie标头
            mallid: configSetting.mallId, // 添加mallid标头
          },
          body: JSON.stringify(data), // 将JavaScript对象转换为JSON字符串
        })
          .then((response) => response.json())
          .then((data) => {
            // console.log("HDSB_getActivityList: ", data);
            // console.log("configSetting: ", configSetting);
            if (data.success) {
              let list = [];
              data.result.activityList.forEach((val) => {
                list = list.concat(val.thematicList);
              });
              this.activityList = list;
              // console.log(this.activityList)
            } else {
              console.warn(`获取活动列表失败: ${data.errorMsg}`);
            }
          })
          .catch((error) => {
            console.error("获取活动列表失败: ", error); // 打印错误信息
          }); // 解析JSON响应
      },
      /**
       * 等待时间
       * @param {*} seconds 秒
       * @returns
       */
      waitSeconds: function (seconds) {
        return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
      },
      getUserInfo: function () {
        switch (window.location.host) {
          case "seller.kuajingmaihuo.com":
            this.getUserInfo_seller_kuajingmaihuo_com();
            break;
          case "agentseller.temu.com":
            this.getUserInfo_agentseller_temu_com();
            break;
          default:
            this.getUserInfo_seller_kuajingmaihuo_com();
            break;
        }
      },
      /**
       * 获取用户信息 seller.kuajingmaihuo.com
       */
      getUserInfo_seller_kuajingmaihuo_com: async function () {
        const configSetting = this.configSetting;
        const url =
          "https://seller.kuajingmaihuo.com/bg/quiet/api/mms/userInfo";
        // 定义要发送的数据
        const data = {};
        // 使用fetch API发起POST请求
        fetch(url, {
          method: "POST", // 指定请求方法为POST
          headers: {
            "Content-Type": "application/json", // 设置请求头，告诉服务器发送的是JSON数据
            Cookie: configSetting.Cookie, // 添加Cookie标头
          },
          body: JSON.stringify(data), // 将JavaScript对象转换为JSON字符串
        })
          .then((response) => response.json())
          .then((data) => {
            // console.log("getUserInfo: ", data);
            // console.log("configSetting: ", configSetting);
            if (data.success) {
              this.malInfoList = data.result.companyList[0].malInfoList;
              this.configSetting.mallId = this.malInfoList[0].mallId;
              this.getUserInfoState = true;
            } else {
              console.warn(`获取用户信息失败: ${data.errorMsg}`);
            }
          })
          .catch((error) => {
            console.error("获取用户信息失败: ", error); // 打印错误信息
          }); // 解析JSON响应
      },

      /**
       * 获取用户信息 seller.kuajingmaihuo.com
       */
      getUserInfo_agentseller_temu_com: async function () {
        const configSetting = this.configSetting;
        const url = "https://agentseller.temu.com/api/seller/auth/userInfo";
        // 定义要发送的数据
        const data = {};
        // 使用fetch API发起POST请求
        fetch(url, {
          method: "POST", // 指定请求方法为POST
          headers: {
            "Content-Type": "application/json", // 设置请求头，告诉服务器发送的是JSON数据
            Cookie: configSetting.Cookie, // 添加Cookie标头
          },
          body: JSON.stringify(data), // 将JavaScript对象转换为JSON字符串
        })
          .then((response) => response.json())
          .then((data) => {
            // console.log("getUserInfo: ", data);
            // console.log("configSetting: ", configSetting);
            if (data.success) {
              this.malInfoList = data.result.mallList;
              this.configSetting.mallId = this.malInfoList[0].mallId;
              this.getUserInfoState = true;
            } else {
              console.warn(`获取用户信息失败: ${data.errorMsg}`);
            }
          })
          .catch((error) => {
            console.error("获取用户信息失败: ", error); // 打印错误信息
          }); // 解析JSON响应
      },

      /**
       * 获取站点列表
       * @returns {Promise} Promise对象，resolve一个站点列表对象
       */
      getSiteList: function () {
        const configSetting = this.configSetting;
        // 定义请求的URL
        const url =
          "https://seller.kuajingmaihuo.com/bg-visage-mms/config/common/site/query";
        // 定义要发送的数据
        const data = {};
        // 使用fetch API发起POST请求
        fetch(url, {
          method: "POST", // 指定请求方法为POST
          headers: {
            "Content-Type": "application/json", // 设置请求头，告诉服务器发送的是JSON数据
            Cookie: configSetting.Cookie, // 添加Cookie标头
            mallid: configSetting.mallId, // 添加mallid标头
          },
          body: JSON.stringify(data), // 将JavaScript对象转换为JSON字符串
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.success) {
              this.siteList = data.result.siteBaseList;
            } else {
              console.warn(`获取站点列表失败: ${data.errorMsg}`);
            }
          })
          .catch((error) => {
            console.error("获取站点列表失败: ", error); // 打印错误信息
          }); // 解析JSON响应
      },
      /**
       * 显示选择站点对话框
       */
      showSelectSite: function () {
        this.dialogSiteVisible = true;
      },
      siteLabel(siteId) {
        return this.siteList.find((item) => item.siteId == siteId).siteName;
      },
      /**
       * 新生命周期-添加价格规则
       */
      SMZQ_abandonPriceRuleAdd: function () {
        this.configSetting.abandonPriceRule.push({
          price: 0,
          maxPrice: 0,
        });
      },

      /**
       * 新生命周期-删除价格规则
       */
      SMZQ_abandonPriceRuleDelete: function (index, data) {
        this.configSetting.abandonPriceRule.splice(index, 1);
      },

      /**
       * 新生命周期-判断提交哪一种类型 1 按照参考价 2自定义价 3 放弃
       * @param suggestSupplyPrice//参考价
       *@returns
       */
      SMZQ_AbandonPriceRule: function (suggestSupplyPrice) {
        const price = this.configSetting.abandonPriceRule[0].price;
        const maxPrice = this.configSetting.abandonPriceRule[0].maxPrice;
        console.log(price, maxPrice);
        if (suggestSupplyPrice < price) {
          return 3;
        } else if (suggestSupplyPrice > maxPrice) {
          return 2;
        } else {
          return 1;
        }
      },

      /**
       * 新生命周期-使用金额范围进行金额设定
       * @param suggestSupplyPrice//参考价
       *@returns
       */
      SMZQ_AbandonPriceSet: function (suggestSupplyPrice) {
        const price = this.configSetting.abandonPriceRule[0].price;
        const maxPrice = this.configSetting.abandonPriceRule[0].maxPrice;
        if (suggestSupplyPrice > maxPrice) {
          return maxPrice;
        } else {
          return suggestSupplyPrice;
        }
      },

      /**
       * 新生命周期-获取上新生命周期的价格申报中列表
       * @returns
       */
      SMZQ_searchForChainSupplier: function (pageNum, pageSize) {
        const configSetting = this.configSetting;
        // 定义请求的URL
        // const url =
        //   "https://seller.kuajingmaihuo.com/marvel-mms/cn/api/kiana/xmen/select/searchForSemiSupplier";
        const url =
          "https://agentseller.temu.com/api/kiana/mms/robin/searchForSemiSupplier";

        pageSize =
          typeof pageSize == "undefined" ? configSetting.pageSize : pageSize;
        // 定义要发送的数据
        const data = {
          pageSize: pageSize,
          pageNum: pageNum,
          secondarySelectStatusList: [7],
          supplierTodoTypeList: [1],
        };

        // 使用fetch API发起POST请求
        return fetch(url, {
          method: "POST", // 指定请求方法为POST
          headers: {
            "Content-Type": "application/json", // 设置请求头，告诉服务器发送的是JSON数据
            Cookie: configSetting.Cookie, // 添加Cookie标头
            mallid: configSetting.mallId, // 添加mallid标头
          },
          body: JSON.stringify(data), // 将JavaScript对象转换为JSON字符串
        }).then((response) => response.json()); // 解析JSON响应
      },

      /**
       * 新生命周期-批量请求价格信息（最大700条一次）
       * @param {*} orderId 订单id
       * @returns
       */
      SMZQ_rejectRemark: function (orderIds) {
        const configSetting = this.configSetting;
        // 定义请求的URL
        // const url =
        //   "https://seller.kuajingmaihuo.com/marvel-mms/cn/api/kiana/magnus/price/bargain-no-bom/batch/info/query";
        const url =
          "https://agentseller.temu.com/api/kiana/magnus/mms/price/bargain-no-bom/batch/info/query";
        // 定义要发送的数据
        const data = {
          orderIds: orderIds,
        };
        // 使用fetch API发起POST请求
        return fetch(url, {
          method: "POST", // 指定请求方法为POST
          headers: {
            "Content-Type": "application/json", // 设置请求头，告诉服务器发送的是JSON数据
            Cookie: configSetting.Cookie, // 添加Cookie标头
            mallid: configSetting.mallId, // 添加mallid标头
          },
          body: JSON.stringify(data), // 将JavaScript对象转换为JSON字符串
        }).then((response) => response.json()); // 解析JSON响应
      },

      /**
       * 新生命周期-放弃报价
       * @param {*} priceOrderId
       * @returns
       */
      SMZQ_reviewNoBom: function (priceOrderId) {
        const configSetting = this.configSetting;
        // 定义请求的URL
        const url =
          "https://seller.kuajingmaihuo.com/gmp/bg/magneto/api/price-review-order/no-bom/review";
        // 定义要发送的数据
        const data = {
          priceOrderId: priceOrderId,
        };
        // 使用fetch API发起POST请求
        return fetch(url, {
          method: "POST", // 指定请求方法为POST
          headers: {
            "Content-Type": "application/json", // 设置请求头，告诉服务器发送的是JSON数据
            Cookie: configSetting.Cookie, // 添加Cookie标头
            mallid: configSetting.mallId, // 添加mallid标头
          },
          body: JSON.stringify(data), // 将JavaScript对象转换为JSON字符串
        }).then((response) => response.json()); // 解析JSON响应
      },
      /**
       * 新生命周期-组合数据
       * @param {*} dataList
       * @returns
       */
      SMZQ_combineData: function (dataList) {},
      /**
       * 新生命周期-批量的讨价还价
       * @param {*} postData
       * @returns
       */
      SMZQ_bargainNoBom: function (postData) {
        const configSetting = this.configSetting;
        // 定义请求的URL
        // const url =
        //   "https://seller.kuajingmaihuo.com/marvel-mms/cn/api/kiana/magnus/price/bargain-no-bom/batch";
        const url =
          "https://agentseller.temu.com/api/kiana/magnus/mms/price/bargain-no-bom/batch";

        // 使用fetch API发起POST请求
        return fetch(url, {
          method: "POST", // 指定请求方法为POST
          headers: {
            "Content-Type": "application/json", // 设置请求头，告诉服务器发送的是JSON数据
            Cookie: configSetting.Cookie, // 添加Cookie标头
            mallid: configSetting.mallId, // 添加mallid标头
          },
          body: JSON.stringify(postData), // 将JavaScript对象转换为JSON字符串
        }).then((response) => response.json()); // 解析JSON响应
      },

      /**
       * 批量活动申报-匹配提交数据
       */
      HDSB_match_procution_data: function (data) {
        const configSetting = this.configSetting;
        const price = configSetting.activityPriceRule[0].price;
        const maxPirce = configSetting.activityPriceRule[0].maxPirce;
        const filerSkustr = configSetting.activityFilerStrRule;
        const targetActivityStock = configSetting.activityTargetActivityStock;
        const siteId = configSetting.checkedSites;
        console.log(targetActivityStock);
        const _Vue = this;
        _Vue.fetchState = true;
        _Vue.logList = [];
        let matchList = data;
        let productList = [];
        if (filerSkustr.length) {
          _Vue.logList.push({
            text: `排除掉所有SKU属性集包含的...`,
          });

          let filteredList = [];
          let skippedCount = 0;

          for (let item of matchList) {
            const shouldSkip = item.activitySiteInfoList.some((site) =>
              site.skcList.some((skc) =>
                skc.skuList.some((sku) => {
                  return Object.values(sku.properties).some((prop) => {
                    if (this.HDSB_activityFilterSKU(prop)) {
                      _Vue.logList.push({
                        text: `排除：sku属性集${prop}中包含设置的字符`,
                      });
                      return true;
                    }
                    return false;
                  });
                })
              )
            );

            if (shouldSkip) {
              skippedCount++;
            } else {
              filteredList.push(item);
            }
          }

          _Vue.logList.push({
            text: `统计：共${matchList.length} 条数据, 通过SKU属性集排除了 ${skippedCount} 条数据`,
          });

          matchList = filteredList;
        }

        if (siteId) {
          _Vue.logList.push({
            text: `筛选站点:${this.siteLabel(siteId)}的数据`,
          });
          let filer_data = matchList.filter((value) => {
            return value.sites.some((v) => v.siteId == siteId);
          });
          matchList = filer_data;
          _Vue.logList.push({
            text: `站点:${this.siteLabel(siteId)}的数据,共 ${
              matchList.length
            } 条数据`,
          });
        }
        productList = matchList.map((value) => {
          return {
            productId: value.productId,
            activityStock:
              (targetActivityStock.length > 0
                ? targetActivityStock[0].num
                : value.targetActivityStock) * 1,
            siteInfoList: value.activitySiteInfoList.map((val) => {
              return {
                siteId: val.siteId,
                skcList: val.skcList
                  .filter((v) => {
                   return v.suggestActivityPrice >= price
                  })
                  .map((v) => {
                    let activityPrice =
                      v.suggestActivityPrice > maxPirce
                        ? maxPirce
                        : v.suggestActivityPrice;
                    _Vue.logList.push({
                      text: `${value.productId}---价格 ${v.suggestActivityPrice}=>${activityPrice}`,
                    });
                    return {
                      skcId: v.skcId,
                      skuList: v.skuList.map((vv) => {
                        return {
                          skuId: vv.skuId,
                        };
                      }),
                      activityPrice: activityPrice,
                    };
                  }),
              };
            }).filter((val) => val.skcList.length > 0),
            sessionIds: value.suggestEnrollSessionIdList,
          };
        }).filter((val) => val.siteInfoList.length > 0);
        // matchList.forEach((value) => {
        //   let productList_item = {
        //     productId: value.productId,
        //     activityStock:
        //       (targetActivityStock.length > 0
        //         ? targetActivityStock[0].num
        //         : value.targetActivityStock) * 1,
        //     siteInfoList: [],
        //     sessionIds: value.suggestEnrollSessionIdList,
        //   };
        //   value.activitySiteInfoList.forEach((val) => {
        //     let siteInfoList = {
        //         siteId: val.siteId,
        //         skcList: [],
        //     }
        //     val.skcList.forEach((v) => {
        //       let skcList = {
        //         skcId: v.skcId,
        //         skuList: v.skuList.map((vv)=>{skuId:vv.skuId}),
        //         activityPrice:v.suggestActivityPrice > maxPirce ? maxPirce : v.suggestActivityPrice,
        //       };

        //     })
        //   })
        //   value.skcList.forEach((val) => {
        //     let skcList = {
        //       skcId: val.skcId,
        //       skuList: [],
        //     };
        //     if (val.sitePriceList) {
        //       //外层存在sitePriceList
        //       skcList["siteActivityPriceList"] = (
        //         val.sitePriceList ? val.sitePriceList : []
        //       )
        //         .filter((v) => v.suggestActivityPrice >= price)
        //         .map((v) => {
        //           let activityPrice =
        //             v.suggestActivityPrice > maxPirce
        //               ? maxPirce
        //               : v.suggestActivityPrice;
        //           _Vue.logList.push({
        //             text: `${value.productId}---价格 ${v.suggestActivityPrice}=>${activityPrice}`,
        //           });
        //           return { activityPrice: activityPrice, siteId: v.siteId };
        //         });
        //       skcList["skuList"] = val.skuList.map((v) => ({
        //         skuId: v.skuId,
        //       }));
        //       if (skcList.siteActivityPriceList.length) {
        //         productList_item.skcList.push(skcList);
        //       }
        //     } else {
        //       val.skuList.forEach((v) => {
        //         let sku_item = {
        //           skuId: v.skuId,
        //           siteActivityPriceList: v.sitePriceList
        //             .filter((j) => j.suggestActivityPrice >= price)
        //             .map((j) => {
        //               let activityPrice =
        //                 j.suggestActivityPrice > maxPirce
        //                   ? maxPirce
        //                   : j.suggestActivityPrice;
        //               _Vue.logList.push({
        //                 text: `${value.productId}---价格 ${j.suggestActivityPrice}=>${activityPrice}`,
        //               });
        //               return {
        //                 activityPrice: activityPrice,
        //                 siteId: j.siteId,
        //               };
        //             }),
        //         };
        //         if (sku_item.siteActivityPriceList.length) {
        //           skcList.skuList.push(sku_item);
        //         }
        //       });
        //       if (skcList.skuList.length) {
        //         productList_item.skcList.push(skcList);
        //       }
        //     }
        //   });
        //   if (productList_item.skcList.length) {
        //     productList.push(productList_item);
        //   }
        // });
        return productList;
      },
      /**
       * 批量活动申报
       */
      HDSB_execute: async function () {
        const configSetting = this.configSetting;
        const waitSeconds = this.waitSeconds;
        const _Vue = this;
        _Vue.fetchState = true;
        _Vue.logList = [];
        let hasMore = true;
        let pageToken = null;
        do {
          let res = await this.HDSB_getMatch(pageToken);
          if (res.success) {
            let matchList = res.result.matchList;
            hasMore = res.result.hasMore;
            pageToken = hasMore ? res.result.searchScrollContext : null;
            _Vue.logList.push({
              text: `服务器返回数据成功, 共${matchList.length}条数据`,
            });
            let productList = this.HDSB_match_procution_data(matchList);
            if (productList.length) {
              _Vue.logList.push({
                text: `等待${configSetting.waitSeconds}秒后提交`,
              });
              await waitSeconds(configSetting.waitSeconds);
              let result = await this.HDSB_submit(productList);
              if (result.success) {
                _Vue.logList.push({
                  text: `活动申报成功,该页总归申报${productList.length}个`,
                });
              } else {
                _Vue.logList.push({
                  text: `活动申报失败`,
                });
                console.warn(`活动申报失败: ${data.errorMsg}`);
              }
            } else {
              _Vue.logList.push({
                text: `该页没有符合条件的数据`,
              });
            }
          } else {
            _Vue.logList.push({
              text: `获取商品信息失败`,
            });
            console.warn(`获取商品信息失败: ${data.errorMsg}`);
          }
          _Vue.logList.push({
            text: `等待${configSetting.waitSeconds}秒请求....`,
          });
          await waitSeconds(configSetting.waitSeconds);
        } while (hasMore);
        _Vue.fetchState = false;
        _Vue.logList.push({
          text: `全部处理完成`,
        });
      },
      /**
       * 批量申报价格
       */
      SMZQ_execute: async function () {
        const configSetting = this.configSetting;
        const waitSeconds = this.waitSeconds;
        const getDataList = this.SMZQ_searchForChainSupplier;
        const rejectRemark = this.SMZQ_rejectRemark;
        const AbandonPriceRule = this.SMZQ_AbandonPriceRule;
        const AbandonPriceSet = this.SMZQ_AbandonPriceSet;
        const reviewPrice = this.SMZQ_reviewNoBom;
        const revisePrice = this.SMZQ_bargainNoBom;
        const siteId = this.configSetting.checkedSites;

        const _Vue = this;
        _Vue.fetchState = true;
        _Vue.logList = [];
        _Vue.logInfo = {
          index: 0,
          totals: 3,
          text: "正在拉取商品数据",
        };

        let maxPage = 0;
        let curPageIndex = configSetting.pageNum;

        if (configSetting.autoPage) {
          await getDataList(1, 1)
            .then((data) => {
              console.log("getDataList(1,1): ", data);
              if (data.success) {
                maxPage = Math.ceil(data.result.total / configSetting.pageSize);
              } else {
                _Vue.logList.push({
                  text: `获取商品信息失败`,
                });
                console.warn(`获取商品信息失败: ${data.errorMsg}`);
              }
            })
            .catch((error) => {
              console.error("获取商品信息失败: ", error); // 打印错误信息
            });
        }

        let arrDataList = [];
        let priceReviewItemListPromise = [];
        let postDataPromise = [];
        do {
          _Vue.logList.push({
            text: `等待${configSetting.waitSeconds}秒请求: 发送请求第${curPageIndex}页`,
          });
          await waitSeconds(configSetting.waitSeconds);
          arrDataList.push(getDataList(curPageIndex));

          curPageIndex++;
          if (curPageIndex > maxPage) {
            _Vue.logList.push({
              text: `请求商品列表结束,等待服务器返回数据`,
            });
          }
        } while (curPageIndex <= maxPage);

        Promise.all(arrDataList)
          .then(async (resource) => {
            let dataList = [];
            resource.forEach((element) => {
              if (element.success) {
                dataList.push(...element.result.dataList);
              }
            });
            _Vue.logList.push({
              text: `服务器返回数据成功, 共${dataList.length}条数据`,
            });
            let priceOrderIds = [];
            for (let i = 0; i < dataList.length; i++) {
              const curData = dataList[i];
              for (let j = 0; j < curData.skcList.length; j++) {
                const curSkc = curData.skcList[j];

                _Vue.logList.push({
                  text: `正在处理SKC: ${curSkc.skcId}`,
                });

                for (
                  let m = 0;
                  m < curSkc.supplierPriceReviewInfoList.length;
                  m++
                ) {
                  const curSupplier = curSkc.supplierPriceReviewInfoList[m];

                  /**
                   * status
                   * 0 价格申报中
                   * 1 待卖家确认
                   */
                  const curStatus = curSupplier.status;

                  if (curStatus == 0) {
                    _Vue.logList.push({
                      text: `跳过: 价格申报中`,
                    });
                    continue;
                  }
                  if (
                    siteId &&
                    !curSupplier.siteList.some((x) => x.siteId == siteId)
                  ) {
                    _Vue.logList.push({
                      text: `跳过: 不属于 ${this.siteLabel(siteId)} 站点`,
                    });
                    continue;
                  }
                  priceOrderIds.push(curSupplier.priceOrderId);
                }
              }
            }
            let priceOrderIdsArr = this.sliceArrayInChunks(priceOrderIds, 700);
            for (let [key, value] of priceOrderIdsArr.entries()) {
              _Vue.logList.push({
                text: `等待${configSetting.waitSeconds}秒请求第${
                  key + 1
                }片: 价格推荐信息=>700条一片`,
              });

              await waitSeconds(configSetting.waitSeconds);
              priceReviewItemListPromise.push(rejectRemark(value)); // push promise
            }
            // 全部完成完成
            // _Vue.logList.push({
            //   text: `=======所有商品数据请求完毕=======`,
            // });
            _Vue.logInfo = {
              index: 1,
              totals: 3,
              text: "正在处理上新审核价格",
            };
            return Promise.all(priceReviewItemListPromise);
          })
          .then(async (res) => {
            _Vue.logList.push({
              text: `请求商品列表结束,等待服务器返回数据`,
            });
            let priceReviewItemList = [];
            res.forEach((element) => {
              console.log(element);
              if (element.success) {
                priceReviewItemList.push(...element.result.priceReviewItemList);
              }
            });
            _Vue.logList.push({
              text: `服务器返回数据成功, 共${priceReviewItemList.length}条数据`,
            });
            _Vue.logList.push({
              text: `等待: 组合提交数据`,
            });
            let itemRequests = priceReviewItemList.map((val) => {
              let supplierResult = AbandonPriceRule(val.suggestSupplyPrice);
              return supplierResult == 3
                ? {
                    priceOrderId: val.id,
                    supplierResult: supplierResult, //使用这个进行对比 1 是使用推荐价格 2是自定义价格 3是放弃
                    items: val.skuInfoList.map((item) => ({
                      productSkuId: item.productSkuId,
                    })),
                  }
                : {
                    priceOrderId: val.id,
                    supplierResult: supplierResult, //使用这个进行对比 1 是使用推荐价格 2是自定义价格 3是放弃
                    items: val.skuInfoList.map((item) => ({
                      productSkuId: item.productSkuId,
                      price: AbandonPriceSet(item.suggestSupplyPrice),
                    })),
                  };
            });
            _Vue.logList.push({
              text: `数据组合完毕: 共${itemRequests.length}条数据`,
            });
            let postDatas = this.sliceArrayInChunks(itemRequests, 200);
            for (let [key, value] of postDatas.entries()) {
              _Vue.logList.push({
                text: `等待${configSetting.waitSeconds}秒请求第${
                  key + 1
                }片: 数据提交=>200条一片`,
              });

              await waitSeconds(configSetting.waitSeconds);
              postDataPromise.push(revisePrice({ itemRequests: value })); // push promise
            }
            _Vue.logInfo = {
              index: 2,
              totals: 3,
              text: "正在处理最后数据提交",
            };
            return Promise.all(postDataPromise);
          })
          .then(async (res) => {
            res.forEach((element, key) => {
              if (element.success) {
                _Vue.logList.push({
                  text: `返回=>第${key + 1}片: 成功`,
                });
              } else {
                _Vue.logList.push({
                  text: `返回=>第${key + 1}片: 失败`,
                });
              }
            });
            _Vue.logInfo = {
              index: 3,
              totals: 3,
              text: "任务全部完成",
            };
          })
          .then(() => {
            _Vue.logList.push({
              text: `所有任务已完成`,
            });
            _Vue.fetchState = false;
          })
          .catch((error) => {
            console.error("服务器返回数据失败: ", error); // 打印错误信息
          });
      },

      /**
       * 商品列表-请求商品列表
       * @returns
       */
      SPLB_pageQuery: function (pageNum, pageSize) {
        const configSetting = this.configSetting;
        // 定义请求的URL
        const url =
          "https://seller.kuajingmaihuo.com/bg-visage-mms/product/skc/pageQuery";

        pageSize =
          typeof pageSize == "undefined" ? configSetting.pageSize : pageSize;
        // 定义要发送的数据
        const data = {
          pageSize: pageSize,
          page: pageNum,
          skcJitStatus: 3,
          skcSiteStatus: 0,
        };

        // 使用fetch API发起POST请求
        return fetch(url, {
          method: "POST", // 指定请求方法为POST
          headers: {
            "Content-Type": "application/json", // 设置请求头，告诉服务器发送的是JSON数据
            Cookie: configSetting.Cookie, // 添加Cookie标头
            mallid: configSetting.mallId, // 添加mallid标头
          },
          body: JSON.stringify(data), // 将JavaScript对象转换为JSON字符串
        }).then((response) => response.json()); // 解析JSON响应
      },

      /**
       * 商品列表-签JIT
       * @returns
       */
      SPLB_signJIT: function (postData) {
        const configSetting = this.configSetting;
        // 定义请求的URL
        const url =
          "https://seller.kuajingmaihuo.com/bg-visage-mms/product/agreement/batch/sign";

        // 定义要发送的数据
        const data = {
          skcList: postData,
        };

        // 使用fetch API发起POST请求
        return fetch(url, {
          method: "POST", // 指定请求方法为POST
          headers: {
            "Content-Type": "application/json", // 设置请求头，告诉服务器发送的是JSON数据
            Cookie: configSetting.Cookie, // 添加Cookie标头
            mallid: configSetting.mallId, // 添加mallid标头
          },
          body: JSON.stringify(data), // 将JavaScript对象转换为JSON字符串
        }).then((response) => response.json()); // 解析JSON响应
      },

      /**
       * 批量签署JIT规则
       */
      SPLB_execute: async function () {
        const configSetting = this.configSetting;
        const waitSeconds = this.waitSeconds;

        const pageQuery = this.SPLB_pageQuery;
        const signJIT = this.SPLB_signJIT;

        const _Vue = this;
        _Vue.fetchState = true;
        _Vue.logList = [];

        let maxPage = 0;
        let curPageIndex = configSetting.pageNum;

        if (configSetting.autoPage) {
          await pageQuery(1, 1)
            .then((data) => {
              console.log("pageQuery(1,1): ", data);
              if (data.success) {
                maxPage = Math.ceil(data.result.total / configSetting.pageSize);
              } else {
                _Vue.logList.push({
                  text: `获取商品信息失败`,
                });
                console.warn(`获取商品信息失败: ${data.errorMsg}`);
              }
            })
            .catch((error) => {
              console.error("获取商品信息失败: ", error); // 打印错误信息
            });
        }

        let arrDataList = [];
        do {
          _Vue.logList.push({
            text: `等待${configSetting.waitSeconds}秒请求: 发送请求第${curPageIndex}页`,
          });
          await waitSeconds(configSetting.waitSeconds);
          arrDataList.push(pageQuery(curPageIndex));

          curPageIndex++;
          if (curPageIndex > maxPage) {
            _Vue.logList.push({
              text: `请求商品列表结束,等待服务器返回数据`,
            });
          }
        } while (curPageIndex <= maxPage);

        Promise.all(arrDataList)
          .then(async (resource) => {
            let dataList = [];
            resource.forEach((element) => {
              if (element.success) {
                dataList.push(...element.result.pageItems);
              }
            });
            _Vue.logList.push({
              text: `服务器返回数据成功, 共${dataList.length}条数据`,
            });
            console.log(dataList);

            let postData = [];
            for (let index = 0; index < dataList.length; index++) {
              const curItem = dataList[index];
              postData.push({
                productId: curItem.productId,
                productSkcId: curItem.productSkcId,
              });
            }

            // 数据分组,因为请求的最大数量是20个
            let postGroup = [];
            for (let index = 0; index < postData.length; index += 20) {
              postGroup.push(postData.slice(index, index + 20));
            }

            if (postGroup.length) {
              for (let index = 0; index < postGroup.length; index++) {
                const curPostData = postGroup[index];
                _Vue.logList.push({
                  text: `等待${configSetting.waitSeconds}秒请求: 第${
                    index + 1
                  }次签署,签署${curPostData.length}个`,
                });
                await waitSeconds(configSetting.waitSeconds);
                await signJIT(curPostData)
                  .then((data) => {
                    if (data.success) {
                      _Vue.logList.push({
                        text: `签署成功: ${data.result.successNum}`,
                      });
                      _Vue.logList.push({
                        text: `签署失败: ${data.result.failedNum}`,
                      });
                      if (data.result.failedDetailList.length) {
                        for (
                          let i = 0;
                          i < data.result.failedDetailList.length;
                          i++
                        ) {
                          const curFailed = data.result.failedDetailList[i];
                          _Vue.logList.push({
                            text: `Skc: ${curFailed.productSkcId}, ${curFailed.errorMsg}`,
                          });
                        }
                      }
                    } else {
                      console.warn(`签署失败: ${data.errorMsg}`);
                    }
                  })
                  .catch((error) => {
                    console.error("签署失败: ", error); // 打印错误信息
                  });
              }
            } else {
              _Vue.logList.push({
                text: `需要签署为空`,
              });
            }

            _Vue.fetchState = false;
          })
          .catch((error) => {
            console.error("服务器返回数据失败: ", error); // 打印错误信息
          });
      },

      /**
       * 活动申报-添加价格规则
       */
      HDSB_activityPirceAdd: function () {
        this.configSetting.activityPriceRule.push({
          price: 0,
          maxPirce: 0,
        });
      },
      /**
       * 活动申报-活动数量
       * @description 添加一条活动数量规则
       */

      HDSB_activityTargetActivityStockAdd: function () {
        this.configSetting.activityTargetActivityStock.push({
          num: "",
        });
      },
      /**
       * 活动申报-字符过滤
       * @description 添加一条字符过滤规则
       */
      HDSB_activityFilerStrAdd: function () {
        this.configSetting.activityFilerStrRule.push({
          str: "",
        });
      },
      /**
       * 活动申报-删除活动申报数量规则
       * @param {Number} index - 在configSetting.activityFilerStrRule中的索引
       */
      HDSB_activityTargetActivityStockDel: function (index) {
        this.configSetting.activityTargetActivityStock.splice(index, 1);
      },
      /**
       * 活动申报-删除字符串过滤规则
       * @param {Number} index - 在configSetting.activityFilerStrRule中的索引
       */
      HDSB_activityFilerStrDel: function (index) {
        this.configSetting.activityFilerStrRule.splice(index, 1);
      },
      /**
       * 活动申报-删除价格规则
       */
      HDSB_activityPirceDelete: function (index, data) {
        this.configSetting.activityPriceRule.splice(index, 1);
      },

      /**
       * 活动申报-SKU过滤
       * @description 通过设置的选项过滤SKU字符
       * @param skustr
       * @returns
       */
      HDSB_activityFilterSKU: function (skustr) {
        return this.configSetting.activityFilerStrRule.some((val) =>
          new RegExp(val.str, "i").test(skustr)
        );
      },
      /**
       * 点击执行类型
       * @param {*} state
       */
      handleClick: async function (state) {
        let succ = await this.checkToken();
        if (!succ) {
          this.settingDrawer = false;
          return;
        }
        if (state == "上新生命周期") {
          this.SMZQ_execute();
        }

        if (state == "批量签署JIT规则") {
          this.SPLB_execute();
        }

        if (state == "批量活动申报") {
          this.HDSB_execute();
        }
        this.clickState = state;
        this.dialogLogVisible = true;
      },

      /**
       * 数组分片
       * @param {*} arr
       * @param {*} chunkSize
       * @returns
       */
      sliceArrayInChunks: function (arr, chunkSize) {
        const result = [];
        let i = 0;

        while (i < arr.length) {
          result.push(arr.slice(i, i + chunkSize)); // 每次切片 700 个
          i += chunkSize; // 移动到下一个片段
        }

        return result;
      },
    },
    watch: {
      configSetting: {
        handler(newVal, oldVal) {
          this.$nextTick(() => {
            const body = unsafeWindow.document.body;
            body.classList.toggle("is-blockPopUps", newVal.blockPopUps);
            GM_setValue("configSetting", newVal);
          });
        },
        // 开启深度监听
        deep: true,
      },
    },
  };
  const app = Vue.createApp(App);
  app.use(ElementPlus);
  app.mount("#vueApp");
})();
