import { userStatus } from './linebot';
import { getOrderData } from './getter/getOrderData';
import { flexMessage } from './flexMessage';
import * as line from '@line/bot-sdk';
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

            const OrderData = await getOrderData(userStatus[userId].userNumber, userStatus[userId].userName, userId);
            await client.showLoadingAnimation({
                chatId: userId,
                loadingSeconds: 30,
            });
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
                    userOrderData.orderList.forEach((item: orderList) => {
                        if (!storeOrderMap[item.storeId]) {
                            storeOrderMap[item.storeId] = [];
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
                        await client.replyMessage({
                            replyToken: event.replyToken,
                            messages: [flexMsg,{type:"text", "text":`${orders[0].storeName}の注文です\n待ち時間は約${waitTimeValue} 分です`},],
                        });
                    }
                    await client.replyMessage({
                        replyToken: event.replyToken,
                        messages: [{type:"text", "text": `${userOrderData.clientName}さんの注文は以上です\n屋台ごとに調理が完了でき次第お呼びします！しばらくお待ちください\n\n※待ち時間は大幅に前後する可能性があります`},],
                    });
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