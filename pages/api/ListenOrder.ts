import { NextApiRequest, NextApiResponse } from 'next'
import * as line from '@line/bot-sdk';
import { userStatus } from './linebot';
import {getOrderData} from './getter/getOrderData';


export async function listenOrser(event: any, client: line.Client) {
    console.log("きたよ");
    const userId = event.source.userId;
    const messageText = event.message.text;

    if (!userStatus[userId]) {
        userStatus[userId] = { status: 'chatStart', userNumber: 0, userName: '' };
        console.log("空にしたよ");
    }

    switch (userStatus[userId].status) {
        case "chatStart":
            await client.replyMessage(event.replyToken, {
                type: 'text',
                text: '番号を入力してください。',
              });
              userStatus[userId].status = "watingNumber";
            break;
        case "watingNumber":
            // 入力された番号が全角の場合半角に変換
            const normalizedMessageText = messageText.replace(/[０-９]/g, (s: string) => String.fromCharCode(s.charCodeAt(0) - 0xFEE0));
            if(!isNaN(Number(normalizedMessageText))){
                await client.replyMessage(event.replyToken, {
                    type: 'text',
                    text: '注文時に登録した名前を入力してください。',
                    });
                    userStatus[userId].userNumber = normalizedMessageText;
                    userStatus[userId].status = "watingName";
                break;
            }
            else{
                await client.replyMessage(event.replyToken, {
                    type: 'text',
                    text: '正しい番号を入力してください。',
                  });
                break;
            }
            case "watingName":
                  userStatus[userId].userName = messageText;
                  userStatus[userId].status = "watingName";
                  console.log("名前来てる");

                  const OrderData = await getOrderData(userStatus[userId].userNumber, userStatus[userId].userName, userId);
                  if (OrderData.success === true) {
                    const userOrderData = OrderData.orderDetails;
                    if (!userOrderData){
                        // 注文情報が見つからなかった場合の処理
                        await client.replyMessage(event.replyToken, {
                        type: 'text',
                        text: '番号または名前が違います。',
                      });
                      }
                      else{
                         // 注文情報が見つかった場合の処理
                        const clientName = userOrderData.clientName; // clientNameを取得
                        const ticketNumber = userOrderData.ticketNumber; // ticketNumberを取得
                        await client.replyMessage(event.replyToken, {
                        type: 'text',
                        text: `${clientName}さんの注文番号は${ticketNumber}`,
                      });
                      }
                    console.log(userOrderData);
                  } else if (OrderData.success === false) {
                    // エラー時の処理
                    console.log("userOrderData can't get");
                  }
                delete userStatus[userId];
                break;
        default:
            break;
    }
}