// pages/api/getOrderData.js
import connectToDatabase from '../../../lib/mongoose';
import OrderData from '../../../models/OrderData';

export async function getOrderData(userNumber, userName) {
  await connectToDatabase();
  try {
    const allOrderData = await OrderData.find({ ticketNumber: userNumber, clientName: userName });

    return allOrderData; // 取得したデータを返す
  } catch {
    return { success: false }; // エラー処理
  }
}
