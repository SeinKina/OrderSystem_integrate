// models/OrderData.js
import mongoose from 'mongoose';

const OrderDataSchema = new mongoose.Schema({
  // 整理券番号
  "ticketNumber": {
    type: mongoose.Schema.Types.Number,
    required: true,
    unique: true,
    default: 0,
    min: 0,
  },

  //LINEのユーザーID
  // "lineUserId":{
  //   type: mongoose.Schema.Types.String,
  //   required: false,
  //   unique: false,
  // },
  "LineUserId":{
    type: mongoose.Schema.Types.String,
    required: false,
    unique: false,
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

  // 注文者名
  "clientName": {
    type: mongoose.Schema.Types.String,
    required: true,
    validate: [
      {
        validator: (v) => {
          // カタカナのみ許可
          const katakanaRegex = /^[\u30A0-\u30FF]+$/;
          return katakanaRegex.test(v);
        },
        message: "カタカナで入力してください",
      },
      {
        validator: (v) => {
          // 10文字以内
          return v.length <= 10;
        },
        message: "10文字以内で入力してください",
      },
    ],
  },

}, {
  // 追加・更新日時を自動で保存
  timestamps: true,
});

export default mongoose.models.OrderData || mongoose.model('OrderData', OrderDataSchema);