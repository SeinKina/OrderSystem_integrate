import { NextApiRequest, NextApiResponse } from 'next'
import * as line from '@line/bot-sdk';
import { userStatus } from './linebot';

export async function listenOrser(event: any, client: line.Client) {
    console.log("きたよ");
    const userId = event.source.userId;
    const messageText = event.message.text;

    if (!userStatus[userId]) {
        userStatus[userId] = { status: 'chatStart', userNumber: '', userName: '' };
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
            await client.replyMessage(event.replyToken, {
                type: 'text',
                text: '注文時に登録した名前を入力してください。',
              });
              userStatus[userId].userNumber = messageText;
              userStatus[userId].status = "watingName";
            break;
            case "watingName":
                await client.replyMessage(event.replyToken, {
                    type: 'text',
                    text: '名前きた。',
                  });
                  userStatus[userId].userName = messageText;
                  userStatus[userId].status = "watingName";
                  userStatus[userId] = { status: '', userNumber: '', userName: '' };    // テスト用にいったん消してる
                break;
        default:
            break;
    }
}