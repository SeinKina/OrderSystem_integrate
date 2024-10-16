import { NextApiRequest, NextApiResponse } from 'next'
import * as line from '@line/bot-sdk';
import { userStatus } from './linebot';
import { getOrderData } from './getter/getOrderData';

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
            const normalizedMessageText = messageText.replace(/[０-９]/g, (s: string) => String.fromCharCode(s.charCodeAt(0) - 0xFEE0));
            if (!isNaN(Number(normalizedMessageText))) {
                await client.replyMessage(event.replyToken, {
                    type: 'text',
                    text: '注文時に登録した名前をカタカナかひらがなで入力してね\n\n例: コウセンタロウ or こうせんたろう',
                });
                userStatus[userId].userNumber = normalizedMessageText;
                userStatus[userId].status = "watingName";
                break;
            } else {
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
                if (!userOrderData) {
                    await client.replyMessage(event.replyToken, {
                        type: 'text',
                        text: '番号または名前が違います。',
                    });
                } else {
                    // 店ごとに注文情報をグループ化
                    const storeOrderMap: { [storeId: string]: any[] } = {};
                    userOrderData.orderList.forEach((item: any) => {
                        if (!storeOrderMap[item.storeId]) {
                            storeOrderMap[item.storeId] = [];
                        }
                        storeOrderMap[item.storeId].push(item);
                    });

                    // 各店ごとにフレックスメッセージを作成して送信
                    for (const [storeId, orders] of Object.entries(storeOrderMap)) {
                        const flexMsg = flexMessage(orders);
                        const waitTimeValue = userOrderData.waitTime.get(storeId);
                        await client.pushMessage(userId, [
                            flexMsg,
                            {
                                type: 'text',
                                text: `${orders[0].storeName}の注文です。待ち時間は約${waitTimeValue} 分です。`,
                            },
                            ]);
                    }
                    await client.pushMessage(userId, [
                        {
                            type: 'text',
                            text: `${userOrderData.clientName}さんの注文は以上だよ。\n※待ち時間は大幅に前後する可能性があります。`,
                        },
                    ]);

                }
                console.log(userOrderData);
            } else if (OrderData.success === false) {
                console.log("userOrderData can't get");
                await client.replyMessage(event.replyToken, {
                    type: 'text',
                    text: '失敗しました',
                });
            }
            delete userStatus[userId];
            break;
        default:
            break;
    }
}

function flexMessage(orderList: any) {
    return {
        type: 'flex',
        altText: '注文情報',
        contents: {
            type: 'carousel',
            contents: orderList.map((item: any) => ({
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
                            size: 'full',
                            aspectRatio: '1:1',
                            aspectMode: 'cover',
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
                                    margin: 'lg',
                                },
                                {
                                    type: 'text',
                                    text: `屋台名: ${item.storeName}`,
                                    wrap: true,
                                    size: 'sm',
                                    margin: 'md',
                                },
                                {
                                    type: 'text',
                                    text: `× ${item.orderQuantity}`,
                                    wrap: true,
                                    size: 'sm',
                                    margin: 'md',
                                    align: 'end',
                                },
                            ],
                            paddingTop: '10px',
                        },
                    ],
                },
                styles: {
                    body: {
                        backgroundColor: '#ffffff',
                    },
                },
            })),
        },
    } as line.FlexMessage;
}
