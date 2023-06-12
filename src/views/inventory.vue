<!-- 
 * @description: 盘点页面
 * @fileName: inventory.vue 
 * @author: zhozihan 
 * @date: 2023-06-02 19:11:19 
 * @后台人员:  
 * @path:  
 * @version: V1.0.5 
!-->

<template>
  <div>
    <van-nav-bar
      :title="userName"
      left-text="返回"
      left-arrow
      safe-area-inset-top
      @click-left="goBack"
      style="margin-bottom: 30px"
    >
      <!-- <template #right>
        <van-icon name="search" size="18" />
      </template> -->
    </van-nav-bar>

    <van-button
      type="primary"
      icon="plus"
      size="large"
      style="width: 80%; margin-bottom: 20px"
      @click="addInventory"
      >添加</van-button
    >

    <van-field
      v-model="keyWord"
      center
      clearable
      label="关键字"
      placeholder="按商品、货位索索"
      size="large"
      class="customSearchInput"
    >
      <template #button>
        <van-button size="small" type="primary" style="width: 60px"
          >搜索</van-button
        >
      </template>
    </van-field>
    <!-- 待提交的列表 -->
    <van-list
      v-model="loading"
      :finished="finished"
      finished-text="没有更多了"
      @load="onLoad"
    >
      <van-swipe-cell
        v-for="item in orders"
        :key="item.id"
        :before-close="beforeClose"
      >
        <div @click="clickItem(item)">
          <div class="listIntroItem">
            【{{ item.goods_brand }}】 {{ item.goods_name }} （{{
              item.goods_spec
            }}）
          </div>
          <div class="listIntroItem">
            货位:{{ item.stock_location }}，生产日期：{{
              item.pro_date
            }}，有效期：{{ item.shelf_life_days }}天
          </div>
          <div class="listIntroItem">
            数量：整{{ item.main_num }}{{ item.main_unit }},零{{ item.sub_num
            }}{{ item.sub_unit }}
          </div>
        </div>

        <template #right>
          <van-button square text="删除" type="danger" class="delete-button" />
        </template>
      </van-swipe-cell>
    </van-list>
    <!-- 添加、编辑商品弹窗 -->
    <van-action-sheet
      v-model="dialogShow"
      :title="formTitle"
      :close-on-click-overlay="false"
    >
      <div class="content">
        <van-form validate-first @failed="onFailed">
          <van-field
            v-model="form.goods_name"
            @focus="openSearchGoodsListDialog"
            name="goods_name"
            placeholder="商品名称"
            label="规格"
            readonly
          />
          <van-field
            v-model="form.locationNo"
            name="locationNo"
            placeholder="货位"
            label="货位"
          />
          <!-- 通过 pattern 进行正则校验 -->
          <!-- :rules="[{ pattern, message: '请输入正确内容' }]" -->
          <van-field
            v-model="form.goods_spec"
            name="goods_spec"
            placeholder="规格"
            label="规格"
            readonly
          />
          <van-field
            v-model="form.goods_brand"
            name="goods_brand"
            placeholder="品牌"
            label="品牌"
            readonly
          />
          <van-cell value="" class="customCell">
            <template #title>
              <span class="custom-title">数量</span>
              <div>
                <van-field
                  v-model="form.main_num"
                  name="main_num"
                  placeholder="正则校验"
                  label="整"
                >
                  <template #extra>
                    <span>{{ form.main_unit }}</span>
                  </template>
                </van-field>
                <van-field
                  v-if="form.sub_unit"
                  v-model="form.sub_num"
                  name="sub_num"
                  placeholder="正则校验"
                  label="零"
                >
                  <template #extra>
                    <span>{{ form.sub_unit }}</span>
                  </template>
                </van-field>
              </div>
              <!-- <van-tag type="danger">标签</van-tag> -->
            </template>
          </van-cell>
          <van-cell
            is-link
            class="customDateCell"
            @click="openDatePickerPopUp"
            :value="form.pro_date"
          >
            <template #title>
              <span class="custom-title">生产日期</span>
              <!-- <van-tag type="danger">标签</van-tag> -->
            </template>
          </van-cell>
          <van-field
            v-model="form.shelf_life_days"
            name="pattern"
            placeholder="正则校验"
            label="保质期"
            readonly
          >
            <template #extra>
              <span>天</span>
            </template>
          </van-field>
          <div style="margin: 16px">
            <van-button round block type="info" native-type="submit"
              >提交</van-button
            >
          </div>
        </van-form>
      </div>
    </van-action-sheet>
    <!-- 时间选择弹窗 -->
    <van-popup
      v-model="datePickerPopUp"
      position="bottom"
      :style="{ height: '30%' }"
    >
      <!-- :min-date="minDate"
        :max-date="maxDate" -->
      <van-datetime-picker
        v-model="currentDate"
        type="date"
        title="选择年月日"
        @confirm="confirmDate"
        @cancel="cancel"
      />
    </van-popup>
    <!-- 商品选择弹窗 -->
    <van-popup
      v-model="searchGoodsdialog"
      position="bottom"
      style="height: 90%; padding-top: 30px"
      closeable
      class="van-clearfix"
    >
      <van-field
        v-model="searchGoodsForm.keyWord"
        @input="onInputSearchGoods"
        center
        label="关键字"
        placeholder="按商品名称搜索"
        size="large"
        class="customSearchInput"
        name="keyWord"
      >
      </van-field>
      <!-- 商品列表 -->
      <!-- <van-pull-refresh v-model="goodsRefreshing" @refresh="goodsOnRefresh"> -->
        <van-list
          v-model="goodsLoading"
          :finished="goodsFinished"
          finished-text="没有更多了"
          @load="goodsOnLoad"
        >
          <div v-for="item in goodsList" :key="item.goods_id">
            <div @click="clickGoodsItem(item)">
              <div class="listIntroItem">
                【{{ item.goods_brand }}】 {{ item.goods_name }} （{{
                  item.goods_spec
                }}）
              </div>
              <div class="listIntroItem">
                货位:{{ item.stock_location }}，生产日期：{{
                  item.pro_date
                }}，有效期：{{ item.shelf_life_days }}天
              </div>
              <div class="listIntroItem">
                数量：整{{ item.main_num }}{{ item.main_unit }},零{{
                  item.sub_num
                }}{{ item.sub_unit }}
              </div>
            </div>
          </div>
        </van-list>
      <!-- </van-pull-refresh> -->
    </van-popup>
  </div>
</template>

<script>
import moment from "moment";
import { Dialog } from "vant";
import { initJsStore } from "@/service/idb_service";
import { GoodsService } from "@/service/goods_service";
export default {
  name: "Inventory",
  data() {
    return {
      keyWord: "",
      title: "",
      //   currentDate:this.$formatDate.nowFormat("YYYY-MM-DD"),
      loading: false,
      goodsLoading: false,
      searchGoodsdialog: false,
      finished: false,
      goodsFinished: false,
      currentDate: new Date(),
      formTitle: "添加",
      userName: "",
      form: {
        goods_name: "", //商品名称
        goods_spec: "", //规格
        goods_brand: "", //品牌name
        main_unit: "件", //主单位
        sub_unit: "袋", //辅单位
        main_num: 0, //主单位数量
        sub_num: 0, //辅单位数量
        stock_location: "",
        person: "", //操作人
        shelf_life_days: "", //保质期
        pro_date: "", //生产日期
      },
      searchGoodsForm: { keyWord: "", pageSize: 10, pageNum: 1 },
      dialogShow: false, //form表单弹窗
      datePickerPopUp: false, //日期选择弹窗
      pattern: "/d{6}/",
      value1: "",
      //商品列表
      goodsList: [],
      currentGoods: null,
      //待提交订单
      orders: [
        {
          id: 132,
          batch_no: "20230604",
          goods_id: 123456,
          goods_name: "测试商品",
          goods_spec: "50袋/件",
          goods_brand: "天宇",
          pro_date: "2020-08-24",
          shelf_life_days: 180,
          main_unit: "件",
          sub_unit: "袋",
          main_num: "20",
          sub_num: "30",
          stock_location: "123456",
          person: "cscs",
          create_time: "2022-03-05",
          update_time: "2022-03-05",
        },
      ],
    };
  },
  async beforeCreate() {
    try {
      const isDbCreated = await initJsStore();
      if (isDbCreated) {
        console.log("db created");
        // prefill database
      } else {
        console.log("db opened");
      }
    } catch (ex) {
      console.error(ex);
      alert(ex.message);
      Global.isIndexedDbSupported = false;
    }
  },
  mounted() {
    let userName = localStorage.getItem("userName");
    if (userName) {
      this.userName = "工作台：" + userName;
    } else {
      location.href = "/login";
    }
  },
  methods: {
    //添加盘点商品数据 打开
    addInventory() {
      this.dialogShow = true;
      // this.
      this.form = {
        goods_name: "", //商品名称
        goods_spec: "", //规格
        goods_brand: "", //品牌name
        main_unit: "件", //主单位
        sub_unit: "袋", //辅单位
        main_num: 0, //主单位数量
        sub_num: 0, //辅单位数量
        stock_location: "",
        person: "", //操作人
        shelf_life_days: "", //保质期
        pro_date: "", //生产日期
      };
    },
    //商品输入框获取焦点 打开商品搜索弹窗
    openSearchGoodsListDialog() {
      this.searchGoodsdialog = true;
      this.searchGoods();
    },
    onInputSearchGoods() {
      this.searchGoodsForm.pageNum = 1;
      this.searchGoods();
    },
    //搜索商品
    async searchGoods() {
      try {
        let res = await new GoodsService().getGoodsByGoodsName(
          this.searchGoodsForm.keyWord,
          this.searchGoodsForm.pageSize,
          this.searchGoodsForm.pageNum
        );
        console.log("搜索数据", res);
        this.goodsList = res;

        
        this.goodsLoading = false;
        // this.goodsFinished = true;
      } catch (error) {
        console.log("error", error);
      }
    },
    onLoad() {
      // 异步更新数据
      // setTimeout 仅做示例，真实场景中一般为 ajax 请求
      // setTimeout(() => {
      //   for (let i = 0; i < 10; i++) {
      //     this.orders.push(this.orders[0]);
      //   }
      //   // 加载状态结束
      //   this.loading = false;
      //   // 数据全部加载完成
      //   if (this.orders.length >= 40) {
      //     this.finished = true;
      //   }
      // }, 1000);
    },
    goodsOnLoad() {
      console.log("执行了");
      this.searchGoods();
    },
    //点击选择商品
    clickGoodsItem(goods) {
      this.currentGoods = JSON.parse(JSON.stringify(goods));
      this.form = this.currentGoods;
      this.searchGoodsdialog = false;
    },
    goBack() {
      this.$router.go(-1);
    },
    onFailed(err) {
      console.log(err);
    },
    openDatePickerPopUp() {
      this.datePickerPopUp = true;
    },
    //时间选择 确认
    confirmDate(value) {
      //    console.log(value)
      this.form.producedDate = moment(value).format("YYYY-MM-DD");
      this.datePickerPopUp = false;
    },
    //日期选择 点击取消 关闭弹窗
    cancel() {
      this.datePickerPopUp = false;
    },
    //下拉选择远程搜索
    remoteMethod(query) {
      console.log("query", query);
      // if (query !== "") {
      //   this.$nextTick(() => {
      //     this.supplierParams.supplier_name = query;
      //     this.supplierParams.page = 1;
      //     this.getSupList();
      //   });
      // } else {
      //   this.supplierParams.supplier_name = "";
      //   this.$nextTick(() => {
      //     this.getSupList();
      //   });
      // }
    },
    cancalReadOnly(onOff) {
      this.$nextTick(() => {
        if (!onOff) {
          const { select } = this.$refs;
          const input = select.$el.querySelector(".el-input__inner");
          input.removeAttribute("readonly");
        }
      });
    },
    changeSelectGoods(val) {
      console.log("changeVal", val);
    },
    beforeClose({ position, instance }) {
      switch (position) {
        case "left":
        case "cell":
        case "outside":
          instance.close();
          break;
        case "right":
          Dialog.confirm({
            message: "确定删除吗？",
          })
            .then(() => {
              instance.close();
            })
            .catch(() => {
              instance.close();
            });
          break;
      }
    },

    //点击待提交的订单
    clickItem(e) {
      this.dialogShow = true;
      this.form = JSON.parse(JSON.stringify(e));
      this.formTitle = "编辑";
    },
  },
};
</script>

<style lang="scss" scoped>
.customCell {
  text-align: left;
  .van-cell__title {
    flex: 4;
  }
}
.customDateCell {
  text-align: left;
  .van-cell__value {
    flex: 2.5;
    text-align: left;
  }
}
.customSelectCell {
  text-align: left;
  .van-cell__value {
    flex: 3;
    text-align: left;
    .el-select {
      width: 100%;
    }
  }
}
.van-swipe-cell ::v-deep {
  min-height: 100px;
  border-bottom: 1px solid #ebedf0;
  .van-swipe-cell__wrapper {
    min-height: 100px;

    // display: flex;
  }
  .delete-button {
    height: 100%;
  }
}
.customSearchInput ::v-deep {
  .van-field__control {
    font-size: 16px;
  }
}
.listIntroItem {
  text-align: left;
  padding: 5px;
}
</style>