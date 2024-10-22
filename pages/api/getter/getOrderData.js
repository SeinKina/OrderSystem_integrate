// pages/api/getOrderData.js
import connectToDatabase from '../../../lib/mongoose';
import OrderData from '../../../models/OrderData';
import ProductData from '../../../models/ProductData';  // eslint-disable-line
import StoreData from '../../../models/StoreData';  // eslint-disable-line

// タイムアウト用のヘルパー関数
function timeoutPromise(ms) {
    return new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Request timed out after ${ms} ms`)), ms)
    );
}
  
export async function getOrderData(userNumber, userName, lineUserId) {
  await connectToDatabase();
  try {
    const orderData = await Promise.race([OrderData.find({ ticketNumber: userNumber, clientName: userName })
        .populate({
            path: 'orderList.productId',
            select: 'productName productImageUrl',
        })
        .populate({
            path: 'orderList.storeId',
            select: 'storeName',
        })
        .exec(),
        timeoutPromise(10000) // 10秒以内に解決されなければタイムアウト
    ]);

    if (orderData.length === 0){
        console.log("空だったよ");
        return{
            success: true,
            orderDetails: null,
        }
    }

    const firstOrder = orderData[0];
    // console.log(firstOrder);
    firstOrder.lineUserId = lineUserId; // 取得したデータにlineUserIdをセット
    await firstOrder.save();

    // 各注文の商品情報を追加
    const  orderDetails = {
        ticketNumber: firstOrder.ticketNumber,   // 整理券番号
        clientName: firstOrder.clientName,       // 注文者名
        orderList: firstOrder.orderList.map(orderItem => {
            console.log("storeIdこれ: " ,orderItem.storeId);
            const product = orderItem.productId;  // populate された productId から商品データを取得
            return {
            productName: product.productName,         // 商品名
            productImageUrl: product.productImageUrl, // 商品画像URL
            orderQuantity: orderItem.orderQuantity,   // 注文個数
            storeId: orderItem.storeId._id.toString(),  // storeId
            storeName: orderItem.storeId.storeName,     // 屋台名
            };
        }),
        waitTime: firstOrder.waitTime,
        finishCook: firstOrder.finishCook,
    }; 

    console.log("wittime: ", firstOrder.waitTime);
    return {
        success: true,
        orderDetails,
    };
  } catch (error){

    console.log('Error:', error.message);
    return { success: false }; // エラー処理
  }
}
