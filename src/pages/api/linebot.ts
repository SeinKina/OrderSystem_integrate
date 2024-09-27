import { NextApiRequest, NextApiResponse } from 'next'
import * as line from '@line/bot-sdk';


const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN!,
  channelSecret: process.env.CHANNEL_SECRET!
};

const client = new line.Client(config);


export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
){
    if(req.method !== 'POST') {
        res.status(405).send('Method Not Allowed');
        return;
    }

    try {
        const events = req.body.events;

        if (events.length > 0) {
            const event = events[0];

            if (event.type === 'message' && event.message.type === 'text') {
                const messageText = event.message.text;

                if(messageText === 'hi') {
                    await client.pushMessage(event.replyMessage,{
                        type: 'text',
                        text: 'hello',
                    });

                    res.status(200).json({message: 'hello ok'});
                } else {
                    res.status(200).json({message: 'no hello'});
                }
            }
        } else {
            res.status(400).json({message: 'no'});
        }
    } catch (e) {
        res.status(500).json({message: 'error: ${e}'});
    }
}