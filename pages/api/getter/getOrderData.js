// pages/api/getOrderData.js
import connectToDatabase from '../../../lib/mongoose';
import OrderData from '../../../models/OrderData';
import ProductData from '../../../models/ProductData';
import StoreData from '../../../models/StoreData';

export async function getOrderData(userNumber, userName, lineUserId) {
  await connectToDatabase();
  try {
    const orderData = await OrderData.find({ ticketNumber: userNumber, clientName: userName })
    .populate({
        path: 'orderList.productId',
        select: 'productName productImageUrl',
    })
    .populate({
        path: 'orderList.storeId',
        select: 'storeName',
    })
    .exec();
    // console.log(orderData);
    if (orderData.length === 0){
        return{
            success: true,
            orderDetails: null,
        }
    }

    const firstOrder = orderData[0];
    firstOrder.LineUserId = lineUserId; // 取得したデータにlineUserIdをセット
    await firstOrder.save();
    // 各注文の商品情報を追加
    const orderDetails = {
        ticketNumber: firstOrder.ticketNumber,   // 整理券番号
        LineUserId: firstOrder.LineUserId,       // LINEのユーザーID
        clientName: firstOrder.clientName,       // 注文者名
        orderList: firstOrder.orderList.map(orderItem => {
            const product = orderItem.productId;  // populate された productId から商品データを取得
            const store = orderItem.storeId;
            return {
            productName: product.productName,         // 商品名
            productImageUrl: product.productImageUrl, // 商品画像URL
            orderQuantity: orderItem.orderQuantity,   // 注文個数
            storeId: orderItem.storeId,               // storeId
            soreName: store.soreName,                 // 屋台名
            };
        }),
        createdAt: firstOrder.createdAt,         // 作成日時
        updatedAt: firstOrder.updatedAt,         // 更新日時
    }; 

    console.log(orderDetails);

    return {
        success: true,
        orderDetails,
    };
    // return allOrderData; // 取得したデータを返す
  } catch {
    return { success: false }; // エラー処理
  }
}
