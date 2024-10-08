import { NextApiRequest, NextApiResponse } from 'next'
import * as line from '@line/bot-sdk';
import { listenOrser } from './ListenOrder';

export let userStatus: { [userId: string]: { status: string, userNumber: number, userName: string } } = {};

const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN!,
  channelSecret: process.env.CHANNEL_SECRET!
};

const client = new line.Client(config);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  console.log('Request body:', req.body);  // リクエストボディを出力

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

      if (messageText === '注文完了') {
        console.log("ここだよ")
        listenOrser(event, client);
        res.status(200).json({ message: 'hello ok' });
      } else {
        if (!userStatus[userId]){
          await client.replyMessage(event.replyToken, {
            type: 'text',
            text: 'たくさん注文してね',
          });
        } else {
          listenOrser(event, client);
        }
        res.status(200).json({ message: 'no hello' });
      }

    } else {
      res.status(400).json({ message: 'Unsupported event type' });
    }
  } catch (e) {
    res.status(500).json({ message: `error: ${e}` });
  }
}
