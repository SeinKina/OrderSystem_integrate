import { userStatus } from './linebot';
import { getOrderData } from './getter/getOrderData';
import { flexMessage } from '../../formats/flexMessage';
import * as line from '@line/bot-sdk';
import { ticketMessge } from '../../formats/tickeMessage';
// const MessagingApiClient = line.messagingApi.MessagingApiClient;

export interface orderList {
    productName: string;
    productImageUrl: string;
    orderQuantity: number;
    storeId: string;
    storeName: string;
};

export async function listenOrder(event: line.WebhookEvent, client: line.messagingApi.MessagingApiClient) {
    const userId = event.source.userId;
    if (!userId){
        return;
    }

    let messageText = "";
    if (event.type !== "message") {
		return;
	}
	if (event.message.type === "text"){
		messageText = event.message.text;
	}

    if (!userStatus[userId]) {
        userStatus[userId] = { status: 'chatStart', userNumber: 0, userName: '' };
    }

    switch (userStatus[userId].status) {
        case "chatStart":
            await client.replyMessage({
                replyToken: event.replyToken,
                messages: [{type:"text", "text":"チケット番号を入力してください"}],
            });
            userStatus[userId].status = "watingNumber";
            break;
        case "watingNumber":
            const normalizedMessageText = messageText.replace(/[０-９]/g, (s: string) => String.fromCharCode(s.charCodeAt(0) - 0xFEE0));
            if (!isNaN(Number(normalizedMessageText))) {
                await client.replyMessage({
                    replyToken: event.replyToken,
                    messages: [{type:"text", "text":"注文時に登録した名前をカタカナかひらがなで入力してください\n\n例: コウセンタロウ or こうせんたろう"}],
                });
                userStatus[userId].userNumber = Number(normalizedMessageText);
                userStatus[userId].status = "watingName";
                break;
            } else {
                await client.replyMessage({
                    replyToken: event.replyToken,
                    messages: [{type:"text", "text":"正しい番号を入力してください"}],
                });
                break;
            }
        case "watingName":
            const nameMessageText = messageText.replace(/[ぁ-ん]/g, (s: string) => String.fromCharCode(s.charCodeAt(0) + 0x60));
            userStatus[userId].userName = nameMessageText;
            userStatus[userId].status = "watingName";
            await client.showLoadingAnimation({
                chatId: userId,
                loadingSeconds: 30,
            });
            const OrderData = await getOrderData(userStatus[userId].userNumber, userStatus[userId].userName, userId);
            if (OrderData.success === true) {
                const userOrderData = OrderData.orderDetails;
                if (!userOrderData) {
                    await client.replyMessage({
                        replyToken: event.replyToken,
                        messages: [{type:"text", "text":"番号または名前が違います"}],
                    });
                } else {
                    // 店ごとに注文情報をグループ化
                    const storeOrderMap: { [storeId: string]: orderList[] } = {};
                    const finishCookStoreName: string[] = [];
                    userOrderData.orderList.forEach((item: orderList) => {
                        if (!storeOrderMap[item.storeId]) {
                            storeOrderMap[item.storeId] = [];
                            if(userOrderData.finishCook.get(item.storeName) === true){
                                // 調理が既に完了している屋台を保存
                                finishCookStoreName.push(item.storeName);
                            }
                        }
                        storeOrderMap[item.storeId].push(item);
                    });
                    await client.replyMessage({
                        replyToken: event.replyToken,
                        messages: [{type:"text", "text":`${userOrderData.clientName}さんの注文を表示します`}],
                    });

                    // 各店ごとにフレックスメッセージを作成して送信
                    for (const [storeId, orders] of Object.entries(storeOrderMap)) {
                        const flexMsg = await flexMessage(orders);
                        const waitTimeValue = Math.floor(userOrderData.waitTime.get(storeId) / 60000);  // ミリ秒を分に変換
                        await client.pushMessage({
                            to: userId,
                            messages: [flexMsg,{type:"text", "text":`${orders[0].storeName}の注文です\n待ち時間は約${waitTimeValue} 分です`},],
                        });
                    }
                    await client.pushMessage({
                        to: userId,
                        messages: [{type:"text", "text": `${userOrderData.clientName}さんの注文は以上です\n屋台ごとに調理が完了でき次第お呼びします！しばらくお待ちください\n\n※待ち時間は大幅に前後する可能性があります`},],
                    });

                    if(finishCookStoreName.length !== 0){
                        await client.pushMessage({
                            to: userId,
                            messages: [{type:"text", "text": `以下の屋台は既に調理が完了しています`},],
                        });
                        for (const storeName of finishCookStoreName){
                            const ticketMsg = await ticketMessge(userOrderData.ticketNumber, storeName);
                            await client.pushMessage({
                                to: userId,
                                messages: [ticketMsg,]
                            });
                        }
                    }
                }
            } else if (OrderData.success === false) {
                console.log("userOrderData can't get");
                await client.replyMessage({
                    replyToken: event.replyToken,
                    messages: [{type:"text", "text":"データの取得に失敗しました\n時間を置いてもう一度入力を行って下さい"}],
                });
            }
            delete userStatus[userId];
            break;
        default:
            break;
            
    }
}