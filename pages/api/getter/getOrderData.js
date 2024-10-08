// pages/api/getOrderData.js
import connectToDatabase from '../../../lib/mongoose';
import OrderData from '../../../models/OrderData';

export async function getOrderData(userNumber) {
  await connectToDatabase();
  try {
    // const userNumber = req.query.userNumber;  // userNumber を取得
    console.log(!userNumber);
    const allOrderData = await OrderData.find({ ticketNumber: userNumber });

    return allOrderData; // 取得したデータを返す
  } catch {
    return { success: false }; // エラー処理
  }
}
