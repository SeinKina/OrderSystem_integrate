// import { Client, ImageMessage } from '@line/bot-sdk';
import { flexMessage } from './flexMessage';
import * as line from '@line/bot-sdk';
import { orderList } from './ListenOrder';
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
    await client.pushMessage({
        to: userId,
        messages: [
            {
                type:'text',
                text: `${OrderData.clientName}さんお待たせしました！`
            },
            flexMsg,
            {
                type: 'flex',
                altText: '調理完了しました',
                contents: {
                type: 'bubble',
                size: 'hecto',
                body: {
                    type: 'box',
                    layout: 'vertical',
                    contents: [
                    {
                        type: 'text',
                        text: `\nチケット番号\n`,
                        wrap: true,
                        size: 'md',
                        align: "center",
                        weight: 'bold', 
                    },
                    {
                        type: 'text',
                        text: `${OrderData.ticketNumber}`,
                        wrap: true,
                        size: '5xl',
                        color: '#00AA00', 
                        weight: 'bold', 
                        gravity: "center",
                        align: "center",
                    },
                    {
                        "type": "separator"
                    },
                    {
                        type: 'text',
                        text: `\n${userOrderList[0].storeName}\n調理完了`,
                        wrap: true,
                        size: 'lg',
                        weight: 'bold', 
                        align: "center",

                    },
                    {
                        type: 'text',
                        text: `\n上記の商品が出来上がりました\nこの画面を表示して${userOrderList[0].storeName}まで受け取りに来てください\n`,
                        wrap: true,
                        size: 'md',
                    },
                    ],
                },
            },
          }
        ],
    });
}