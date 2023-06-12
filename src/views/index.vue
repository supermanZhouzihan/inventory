<!-- 
 * @description: 主页
 * @fileName: index.vue 
 * @author: zhouzihan 
 * @date: 2023-06-02 15:15:59 
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

    <!-- <van-nav-bar left-text="返回" left-arrow @click-left="goBack"
      style="margin-bottom: 30px">
      <template #title>
        <div class="cusNavtitle">{{ userName }}</div>
      </template>
    </van-nav-bar> -->

    <van-cell-group style="margin-bottom: 30px">
      <van-cell value="" title-class="cellTitle" value-class="valueTitle">
        <!-- 使用 title 插槽来自定义标题 -->
        <template #title>
          <span class="custom-title">初始化品牌、商品数据</span>
          <van-button
            @click="initLocalGoodsData"
            type="info"
            size="mini"
            style="width: 100px; font-size: 14px"
            >初始化</van-button
          >
        </template>
      </van-cell>

      <van-cell value="" title-class="cellTitle" value-class="valueTitle">
        <template #title>
          <span class="custom-title">待提交数据:{{ noSubmitNumber }}条</span>
          <van-button
            @click="submitGoods"
            type="info"
            size="mini"
            style="width: 100px; font-size: 14px"
            >立即提交</van-button
          >
        </template>
      </van-cell>
    </van-cell-group>

    <van-cell
      class="mb20"
      title="货位预填入"
      value=""
      title-class="cellTitle"
      value-class="valueTitle"
    />

    <div class="tag">
      <van-badge
        v-for="(item, index) in locationNoList"
        :key="item.locationNo"
        class="vanBadge"
      >
        <div class="child" @click="editLocation(item, index)">
          {{ item.locationNo }}
        </div>
        <template #content>
          <van-icon
            name="cross"
            class="badge-icon"
            @click="delLocation(item, index)"
          />
        </template>
      </van-badge>
      <van-button
        icon="plus"
        type="info"
        class="child customBtn"
        @click="addLocation"
      ></van-button>
    </div>

    <van-button
      @click="goInventroy"
      round
      type="primary"
      size="large"
      class="roundBtn"
    >
      盘点
    </van-button>
    <!-- @confirm="locationDialogConfirm"
      @cancel="locationDialogCancel" -->
    <van-dialog
      v-model="locationDialogShow"
      :title="locationDialogTitle"
      show-cancel-button
      className="locationDialog"
      :before-close="beforeCloseDialog"
    >
      <div>货位号：<input type="text" v-model="locationForm.locationNo" /></div>
    </van-dialog>
  </div>
</template>

<script>
import axios from "axios";
import { initJsStore } from "@/service/idb_service";
// import { StudentService } from "@/service/student_service";
import { GoodsService } from "@/service/goods_service";
export default {
  data() {
    return {
      userName: "",
      locationNoList: [], //货位号数组
      noSubmitNumber: 0,
      locationDialogShow: false,
      locationDialogTitle: "添加货位",
      currentIndex: null,
      locationForm: {
        locationNo: "",
      },
      students:[],
      goodsList:[],
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
    let userName = localStorage.getItem("userName")
      ? localStorage.getItem("userName")
      : "";
    let localLocationList = localStorage.getItem("localLocationList")
      ? JSON.parse(localStorage.getItem("localLocationList"))
      : [];
    console.log("localLocationList", localLocationList);
    if (userName) {
      this.userName = "工作台：" + userName;
    } else {
      location.href = "/login";
    }
    this.locationNoList = localLocationList;

    this.initLocalGoodsData();
    // this.testDb();
  },
  methods: {
    // async testDb(){
    //   this.goodsList = await new GoodsService().getGoodsList();
    //   console.log(this.goodsList)
    // },
    //初始化商品数据，存在本地数据库
    initLocalGoodsData() {
      let baseUrl=process.env.VUE_APP_BASE_API_PURCHASE;
      console.log(baseUrl);
      let url=baseUrl+'/api/stocktacking/getAllGoods'
      axios.get(url).then(( {data} ) => {
        console.log('返回数据',data.data)

        this.insertGoodsToDb(data.data);
        // let uploadAuth = data.UploadAuth;
        // let uploadAddress = data.UploadAddress;
        // let videoId = data.VideoId;
        // uploader.setUploadAuthAndAddress(
        //   uploadInfo,
        //   uploadAuth,
        //   uploadAddress,
        //   videoId
        // );
      });
    },
    async insertGoodsToDb(goods){
      this.goodsList = await new GoodsService().addMultiGoods(goods);
      console.log('11',this.goodsList)
    },
    //提交未提交的盘库数据
    submitGoods() {
      
    },
    //修改货位
    editLocation(item, index) {
      console.log("修改", item);
      this.locationDialogShow = true;
      this.locationDialogTitle = "编辑货位";
      this.locationForm.locationNo = item.locationNo;
      this.currentIndex = index;
    },
    //添加货位
    addLocation() {
      this.locationDialogShow = true;
      this.currentIndex = null;
      this.locationDialogTitle = "添加货位";
      this.locationForm.locationNo = "";
    },
    //删除货位
    delLocation(item, index) {
      this.$dialog
        .alert({
          title: "提示",
          message: "是否要删除" + item.locationNo + "这条货位数据？",
          showCancelButton: true,
        })
        .then((res) => {
          this.locationNoList.splice(index, 1);
          localStorage.setItem(
            "localLocationList",
            JSON.stringify(this.locationNoList)
          );
          console.log("res", res);
        })
        .catch((err) => {
          console.log("err", err);
        });
      console.log(item);
    },
    beforeCloseDialog(action, done) {
      if (action == "confirm") {
        if (!this.locationForm.locationNo) {
          this.$toast("货位号不能为空");
          done(false);
          return;
        }
        //编辑
        if (this.currentIndex !== null) {
          this.locationNoList[this.currentIndex].locationNo =
            this.locationForm.locationNo;
        }
        //新增
        else {
          this.locationNoList.push({
            locationNo: this.locationForm.locationNo,
          });
        }
        localStorage.setItem(
          "localLocationList",
          JSON.stringify(this.locationNoList)
        );
      }
      done();
    },
    goBack() {
      this.$router.push({
        name: "Login",
      });
    },
    //去盘点
    goInventroy() {
      // if(!this.locationNoList||this.locationNoList.length==0){
      //   this.$toast("先设置货位号");
      //   return
      // }
      this.$router.push({
        name: "Inventory",
      });
    },
    //货位点击确定
    // locationDialogConfirm() {
    //   console.log("点击确定");
    // },
    // //货位点击取消
    // locationDialogCancel() {
    //   console.log("点击取消");
    // },
  },
};
</script>

<style lang="scss" scoped>
// .van-nav-bar__content{
//   height: 80px;;
// }
.cellTitle {
  display: flex;
  flex: 8;
  justify-content: space-between;
  .custom-title {
    font-size: 16px;
    text-align: right;
  }
}
.valueTitle {
  flex: 1;
}
.tag {
  display: flex;
  flex-wrap: wrap;
  padding: 10px;
  margin-bottom: 40px;
}
.vanBadge {
  // flex: 1;
  margin: 0 15px 15px 0;
}
// .closeIcon {
//   position: absolute;
//   right: 0;
//   top: 0;
//   transform: translate(60%, -50%);
//   z-index: 2;
// }
.child {
  width: 80px;
  height: 30px;
  line-height: 30px;
  border: 1px solid;
}
.customBtn {
  box-sizing: content-box;
  padding: 0;
}
.badge-icon {
  display: block;
  font-size: 10px;
  line-height: 16px;
}
.van-dialog.locationDialog ::v-deep {
  .van-dialog__header {
    margin-bottom: 30px;
  }
  .van-dialog__content {
    margin-bottom: 30px;
  }
}
.roundBtn {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  font-size: 30px;
}
</style>