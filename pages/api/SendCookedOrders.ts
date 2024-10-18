// import { Client, ImageMessage } from '@line/bot-sdk';
import * as line from '@line/bot-sdk';
import { flexMessage } from './flexMessage';

export async function SendCookedOrders(OrderData: any){
    console.log("sendCookedOrderきたよ");
    console.log("OrderData : ", OrderData);
    console.log("OrderData.List:", OrderData.orderList);
    const config = {
        channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN!,
        channelSecret: process.env.CHANNEL_SECRET!
    };
      
    const client = new line.Client(config);

    const userOrderData = OrderData.orderDetails;
    const userOrderList = userOrderData.orderList;
    const userId = userOrderData.lineUserId;
    // 各店ごとにフレックスメッセージを作成して送信
    const flexMsg = await flexMessage(userOrderList);
    await client.pushMessage(userId, [
        flexMsg,
        {
            type: 'text',
            text: `${userOrderData.clientName}さんお待たせしました！\n以上の注文が完成しました\n${userOrderList[0].storeName}まで受け取りに来てください`,
        },
    ]);
        
    // await client.pushMessage(userId, [
    //     {
    //         type: 'text',
    //         text: `${userOrderData.clientName}さん！\n以上の注文が完成しました。${userOrderList[0].storeName}まで受け取りに来てください。`,
    //     },
    // ]);
}