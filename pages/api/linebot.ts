import { NextApiRequest, NextApiResponse } from 'next'
import { listenOrder } from './ListenOrder';
import { ImageMessage } from '@line/bot-sdk';
import * as line from '@line/bot-sdk';
const MessagingApiClient = line.messagingApi.MessagingApiClient;

export const userStatus: { [userId: string]: { status: string, userNumber: number, userName: string } } = {};

const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN!,
  channelSecret: process.env.CHANNEL_SECRET!
};

const client =  new MessagingApiClient(config);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.status(404).send('Method Not Allowed');
    return;
  }

  try {
    const events = req.body.events;

    if (!events || events.length === 0) {
      console.log('No events received');
      res.status(200).json({ message: 'no events' });
      return;
    }

    const event = events[0];
    const userId = event.source.userId;

    if (event.type === 'message' && event.message.type === 'text') {
      const messageText = event.message.text;

      if (messageText === '注文情報との連携') {
        console.log("ここだよ")
        await listenOrder(event, client);
        res.status(200).json({ message: 'hello ok' });
      } else if(messageText === 'メニュー表'){
        await client.showLoadingAnimation({
          chatId: userId,
          loadingSeconds: 30,
        });
        const imageUrl = 'https://ordersystemlinebot-production.up.railway.app/images/menu2.png';
        // 画像メッセージを送信
        
        const imageMessage: ImageMessage = {
          type: 'image',                      
          originalContentUrl: imageUrl,       
          previewImageUrl: imageUrl,         
        };

        await client.replyMessage({
          replyToken: event.replyToken,
          messages:[imageMessage],
        });
        
      }
      else {
        if (!userStatus[userId]){
          await client.replyMessage({
            replyToken: event.replyToken,
            messages:[{type:"text", "text":"たくさん注文してね"},],
          });
        } else {
          await listenOrder(event, client);
        }
        res.status(200).json({ message: 'no hello' });
      }

    } else {
      res.status(400).json({ message: 'Unsupported event type' });
    }
  } catch (e) {
    console.log("era-500: ", e);
    res.status(500).json({ message: `error: ${e}` });
  }
}
