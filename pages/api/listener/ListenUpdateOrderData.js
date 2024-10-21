import connectToDatabase from '../../../lib/mongoose';
import mongoose from 'mongoose';
import StoreOrderSchema from '../../../models/StoreOrder';
import { getUpdateOrderData } from '../getter/getUpdateOrderData';
import { SendCookedOrders } from '../SendCookedOrders';
import StoreData from '../../../models/StoreData';
// import { MongoClient } from 'mongodb';

export default async function ListenUpdateOrderData(req, res) {
  try {
    // データベースに接続
    await connectToDatabase();

    const storeData = await StoreData.find({}, "storeName");
    console.log("storeData:", storeData);

    storeData.forEach(storeData =>{
      const collectionName = storeData.storeName + "_orders";
   

      // StoreOrder モデルを作成
      let StoreOrder;
      if (mongoose.modelNames().includes(collectionName)) {
        StoreOrder = mongoose.model(collectionName);
      } else {
        StoreOrder = mongoose.model(collectionName, StoreOrderSchema);
      }

      // StoreOrder の変更を監視
      const storeOrderChangeStream = StoreOrder.watch();

      storeOrderChangeStream.on('change', async (change) => {
        // cookStatus が true に変更されたときの処理
        if (change.operationType === 'update' && change.updateDescription.updatedFields.cookStatus === true) {
          console.log('cookStatus が true に更新されました。');
          const updatedOrder = await StoreOrder.findById(change.documentKey._id);
          const userOrderData =await getUpdateOrderData(updatedOrder); 
          if (userOrderData.success === false){
            console.log("できなかったっぽ:" , userOrderData.message);
            return
          }
          console.log("引数:", userOrderData);
          SendCookedOrders(userOrderData.orderDetails);
          // 必要な処理をここに追加
        }
    });
  })
    res.status(200).json({ message: '変更の監視を開始しました' });
  } catch (error) {
    console.error('エラーが発生しました:', error);
    res.status(500).json({ error: 'エラーが発生しました' });
  }
}

