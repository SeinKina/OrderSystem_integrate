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
                text: 'チケット番号を入力してね',
              });
              userStatus[userId].status = "watingNumber";
            break;
        case "watingNumber":
            // 入力された番号が全角の場合半角に変換
            const normalizedMessageText = messageText.replace(/[０-９]/g, (s: string) => String.fromCharCode(s.charCodeAt(0) - 0xFEE0));
            if(!isNaN(Number(normalizedMessageText))){
                await client.replyMessage(event.replyToken, {
                    type: 'text',
                    text: '注文時に登録した名前をカタカナかひらがなで入力してね\n\n例: コウセンタロウ or こうせんたろう',
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
                  const nameMessageText = messageText.replace(/[ぁ-ん]/g, (s: string) => String.fromCharCode(s.charCodeAt(0) + 0x60));
                  userStatus[userId].userName = nameMessageText;
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
                        // // 注文情報が見つかった場合の処理
                        // const flexMsg = flexMessage(userOrderData);
                        // await client.replyMessage(event.replyToken, [
                        //     flexMsg,
                        //     {
                        //     type: 'text',
                        //     text: `${userOrderData.clientName}さんの注文は以上だよ。\n調理が完了したら僕が呼び出します！`,
                        //     }],
                        // );
                            // 注文情報が見つかった場合の処理
                            const orderList = userOrderData.orderList;
                            const firstPartOrderList = orderList.slice(0, 10); // 最初の10個
                            const secondPartOrderList = orderList.slice(10); // 11個目以降

                            const flexMsg1 = flexMessage({ ...userOrderData, orderList: firstPartOrderList });

                            if (secondPartOrderList.length < 0) {
                                const flexMsg2 = flexMessage({ ...userOrderData, orderList: secondPartOrderList });
                                await client.replyMessage(event.replyToken, [
                                    flexMsg1,
                                    flexMsg2,
                                    {
                                    type: 'text',
                                    text: `${userOrderData.clientName}さんの注文は以上だよ。\n調理が完了したら僕が呼び出します！`,
                                }],
                            );}
                            else {
                                await client.replyMessage(event.replyToken, [
                                    flexMsg1,
                                    {
                                    type: 'text',
                                    text: `${userOrderData.clientName}さんの注文は以上だよ。\n調理が完了したら僕が呼び出します！`,
                                }],
                                );
                            }

                            // // 最終メッセージを送信
                            // await client.replyMessage(event.replyToken, {
                            //     type: 'text',
                            //     text: `${userOrderData.clientName}さんの注文は以上です。\n調理が完了したら僕が呼び出します！`,
                            // });
    
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

function flexMessage(userOrderData: any) {
    return {
        type: 'flex',
        altText: '注文情報',
        contents: {
            type: 'carousel', 
            contents: userOrderData.orderList.map((item: any) => ({
                type: 'bubble', 
                size: 'hecto',
                body: {
                    type: 'box',
                    layout: 'vertical',
                    paddingAll: '0px', 
                    contents: [
                        {
                            type: 'image',
                            url: item.productImageUrl,
                            size: 'full', // sm, md, lgの中から適宜変更可能
                            aspectRatio: '1:1', 
                            aspectMode: 'cover', // 画像を枠にフィット
                        },
                        {
                            type: 'box',
                            layout: 'vertical',
                            paddingAll: '10px', 
                            contents: [
                                {
                                    type: 'text',
                                    text: `${item.productName}`,
                                    wrap: true,
                                    size: 'md',
                                    weight: 'bold',
                                    margin: 'lg'
                                },
                                {
                                    type: 'text',
                                    text: `屋台名: ${item.storeName}`,
                                    wrap: true,
                                    size: 'sm',
                                    margin: 'md'
                                },
                                {
                                    type: 'text',
                                    text: `× ${item.orderQuantity}`,
                                    wrap: true,
                                    size: 'sm',
                                    margin: 'md',
                                    align: 'end'
                                },
                            ],
                            paddingTop: '10px', // 画像とテキストの間に余白
                        }
                    ],
                },
                styles: {
                    body: {
                        backgroundColor: '#ffffff', // 背景色を白に設定
                    }
                }
            }))
        }
    } as line.FlexMessage; // FlexMessageの型を明示的に指定
}
