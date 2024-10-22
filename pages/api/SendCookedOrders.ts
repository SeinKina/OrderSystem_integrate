// import { Client, ImageMessage } from '@line/bot-sdk';
import { flexMessage } from '../../formats/flexMessage';
import * as line from '@line/bot-sdk';
import { orderList } from './ListenOrder';
import { ticketMessge } from '../../formats/tickeMessage';
const MessagingApiClient = line.messagingApi.MessagingApiClient;

interface orderDate {
    ticketNumber: number;
    lineUserId: string;
    clientName: string;
    orderList: orderList[];
};

export async function SendCookedOrders(OrderData: orderDate){
    console.log("sendCookedOrderきたよ");
    const config = {
        channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN!,
        channelSecret: process.env.CHANNEL_SECRET!
    };
      
    const client =  new MessagingApiClient(config);


    // const userOrderData = OrderData.orderDetails;
    const userOrderList = OrderData.orderList;
    const userId = OrderData.lineUserId;
    // 各店ごとにフレックスメッセージを作成して送信
    const flexMsg = await flexMessage(userOrderList);
    const ticketMsg = await ticketMessge(OrderData.ticketNumber, userOrderList[0].storeName);
    await client.pushMessage({
        to: userId,
        messages: [
            {
                type:'text',
                text: `${OrderData.clientName}さんお待たせしました！`
            },
            flexMsg,
            ticketMsg,            
        ],
    });
}