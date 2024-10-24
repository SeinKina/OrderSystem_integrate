import { NextApiRequest, NextApiResponse } from 'next'
import * as line from '@line/bot-sdk';
const MessagingApiClient = line.messagingApi.MessagingApiClient;


const config = {
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN!,
    channelSecret: process.env.CHANNEL_SECRET!
};
  
const client =  new MessagingApiClient(config);

export default async function broadCast(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { message } = req.body;
    
        try {
        await client.broadcast({messages:[{type:"text", "text": message}]});
        return res.status(200).json({ status: 'success', message: 'メッセージを送信しました。' });
        } catch (error) {
        console.error('メッセージ送信中にエラーが発生しました:', error);
        return res.status(500).json({ status: 'error', message: 'メッセージ送信中にエラーが発生しました。' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}