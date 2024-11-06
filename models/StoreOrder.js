// models/StoreOrder.js
import mongoose from 'mongoose';

const StoreOrderSchema = new mongoose.Schema({

  //注文情報Id
  "orderId":{
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'OrderData',
  },

  // 注文リスト
  "orderList": [{
    // 商品ID
    "productId": {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "ProductData",
    },

    // 屋台ID
    "storeId": {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "StoreData",
    },

    // 個数
    "orderQuantity": {
      type: mongoose.Schema.Types.Number,
      required: true,
      default: 0,
      min: 0,
    },
  }],

  // 調理ステータス
  "cookStatus": {
    type: mongoose.Schema.Types.Boolean,
    required: true,
    default: false,
  },

  // 受け取りステータス
  "getStatus": {
    type: mongoose.Schema.Types.Boolean,
    required: true,
    default: false,
  },

  // 注文キャンセルステータス
  "cancelStatus": {
    type: mongoose.Schema.Types.Boolean,
    required: true,
    default: false,
  },

  // 注文時間
  "orderTime": {
    type: mongoose.Schema.Types.Date,
    required: true,
    default: Date.now,
  },

}, {
  // 追加・更新日時を自動で保存
  timestamps: true,
});

// export default mongoose.models.StoreOrder || mongoose.model('StoreOrder', StoreOrderSchema);

export default StoreOrderSchema;