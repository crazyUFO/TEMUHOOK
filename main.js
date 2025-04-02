// ==UserScript==
// @name         TEMUHOOK
// @namespace    SAN
// @version      1.6
// @description  TEMUHOOK 提交
// @author       XIAOSAN
// @match        *://seller.kuajingmaihuo.com/*
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
                                        <el-input v-model="scope.row.str"  :disabled="fetchState" controls-position="right" />
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
<!--                           <el-divider>选择活动</el-divider>
                            <el-select v-model="selectedValue" placeholder="请选择">
                              <el-option
                                v-for="item in options"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value">
                              </el-option>
                            </el-select> -->
                        </el-form>
                    </el-tab-pane>
                </el-tabs>
                <div style="margin-top: 30px;" v-if="malInfoList.length">
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
        </div>
    `;
  let vueEl = document.createElement("div");
  vueEl.innerHTML = appHtml;
  document.body.append(vueEl);
  const App = {
    data() {
      return {
        settingDrawer: false,
        currentTab: "SMZQ",
        dialogLogVisible: false,
        selectActivity: false,
        selectedValue: "",
        options: [
          { value: "1", label: "选项1" },
          { value: "2", label: "选项2" },
          { value: "3", label: "选项3" },
        ],
        configSetting: Object.assign(
          {
            Cookie: "",
            blockPopUps: false,
            pageSize: 100,
            pageNum: 1,
            autoPage: true,
            waitSeconds: 3,
            abandonPriceRule: [],
            activityPriceRule: [],
            activityFilerStrRule: [],
            activityTargetActivityStock: [],
            token: null,
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
      this.$nextTick(() => {
        this.getUserInfo();
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
            let url = "http://182.254.136.122:8765/login";
            GM_xmlhttpRequest({
              url,
              method: "POST", // 指定请求方法为POST
              headers: {
                "Content-Type": "application/json", // 设置请求头，告诉服务器发送的是JSON数据
              },
              data: JSON.stringify({ username: value }),
              onload: (response) => {
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
        let url = "http://182.254.136.122:8765/protected";

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
          "https://seller.kuajingmaihuo.com/marvel-mms/cn/api/kiana/gambit/marketing/enroll/scroll/match";

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
          "https://seller.kuajingmaihuo.com/marvel-mms/cn/api/kiana/gambit/marketing/enroll/submit";
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

      /**
       * 获取用户信息
       */
      getUserInfo: function () {
        const configSetting = this.configSetting;
        // 定义请求的URL
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
        const url =
          "https://seller.kuajingmaihuo.com/marvel-mms/cn/api/kiana/xmen/select/searchForSemiSupplier";

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
        const url =
          "https://seller.kuajingmaihuo.com/marvel-mms/cn/api/kiana/magnus/price/bargain-no-bom/batch/info/query";
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
        const url =
          "https://seller.kuajingmaihuo.com/marvel-mms/cn/api/kiana/magnus/price/bargain-no-bom/batch";

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
        console.log(targetActivityStock);
        const _Vue = this;
        _Vue.fetchState = true;
        _Vue.logList = [];
        let matchList = data;
        let productList = [];
        if (filerSkustr.length) {
          console.log(filerSkustr);
          _Vue.logList.push({
            text: `排除掉所有SKU属性集包含的...`,
          });

          let filer_data = [];
          let skipCount = 0; // 统计跳过的 value 数量
          for (let i = 0; i < matchList.length; i++) {
            let value = matchList[i];
            let shouldSkipValue = false;

            for (let j = 0; j < value.skcList.length; j++) {
              let val = value.skcList[j];

              for (let k = 0; k < val.skuList.length; k++) {
                let v = val.skuList[k];

                for (let key in v) {
                  if (this.HDSB_activityFilterSKU(v[key])) {
                    _Vue.logList.push({
                      text: `排除：sku属性集${v[key]}中包含设置的字符`,
                    });
                    shouldSkipValue = true;
                    break; // 跳出 skuList 的遍历
                  }
                }

                if (shouldSkipValue) break; // 跳出 skcList 的遍历
              }

              if (shouldSkipValue) break; // 跳出 value 的遍历
            }

            if (!shouldSkipValue) {
              filer_data.push(value);
            } else {
              skipCount++; // 如果跳过了当前 value，递增计数器
            }
          }
          _Vue.logList.push({
            text: `统计：共${matchList.length} 条数据,通过SKU属性集排除了${skipCount}条数据`,
          });
          matchList = filer_data;
        }
        matchList.forEach((value) => {
          let productList_item = {
            productId: value.productId,
            activityStock:
              (targetActivityStock.length > 0
                ? targetActivityStock[0]
                : value.targetActivityStock) * 1,
            skcList: [],
            sessionIds: value.suggestEnrollSessionIdList,
          };
          value.skcList.forEach((val) => {
            let skcList = {
              skcId: val.skcId,
              skuList: [],
            };
            if (val.sitePriceList) {
              //外层存在sitePriceList
              skcList["siteActivityPriceList"] = (
                val.sitePriceList ? val.sitePriceList : []
              )
                .filter((v) => v.suggestActivityPrice >= price)
                .map((v) => {
                  let activityPrice =
                    v.suggestActivityPrice > maxPirce
                      ? maxPirce
                      : v.suggestActivityPrice;
                  _Vue.logList.push({
                    text: `${value.productId}---价格 ${v.suggestActivityPrice}=>${activityPrice}`,
                  });
                  return { activityPrice: activityPrice, siteId: v.siteId };
                });
              skcList["skuList"] = val.skuList.map((v) => ({
                skuId: v.skuId,
              }));
              if (skcList.siteActivityPriceList.length) {
                productList_item.skcList.push(skcList);
              }
            } else {
              val.skuList.forEach((v) => {
                let sku_item = {
                  skuId: v.skuId,
                  siteActivityPriceList: v.sitePriceList
                    .filter((j) => j.suggestActivityPrice >= price)
                    .map((j) => {
                      let activityPrice =
                        j.suggestActivityPrice > maxPirce
                          ? maxPirce
                          : j.suggestActivityPrice;
                      _Vue.logList.push({
                        text: `${value.productId}---价格 ${j.suggestActivityPrice}=>${activityPrice}`,
                      });
                      return {
                        activityPrice: activityPrice,
                        siteId: j.siteId,
                      };
                    }),
                };
                if (sku_item.siteActivityPriceList.length) {
                  skcList.skuList.push(sku_item);
                }
              });
              if (skcList.skuList.length) {
                productList_item.skcList.push(skcList);
              }
            }
          });
          if (productList_item.skcList.length) {
            productList.push(productList_item);
          }
        });
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
       * 活动申报-字符过滤
       * @description 添加一条字符过滤规则
       */
      HDSB_activityTargetActivityStockAdd: function () {
        this.configSetting.activityTargetActivityStock.push({
          str: "",
        });
      },
      /**
       * 活动申报-活动数量
       * @description 添加一条活动数量规则
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
