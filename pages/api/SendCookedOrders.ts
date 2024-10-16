import axios from 'axios';

const sendLineNotification = async (order :any) => {
  const message = {
    to: order.LineUserId,  // 送信先のLINEユーザーID
    messages: [
      {
        type: 'text',
        text: `注文の料理が準備できました！整理券番号: ${order.ticketNumber}`
      }
    ]
  };

  try {
    await axios.post('https://api.line.me/v2/bot/message/push', message, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer {LINE_CHANNEL_ACCESS_TOKEN}`
      }
    });
    console.log('通知を送信しました');
  } catch (error) {
    console.error('通知の送信に失敗しました:', error);
  }
};
