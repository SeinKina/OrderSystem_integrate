import { messagingApi } from '@line/bot-sdk';
export async function ticketMessge(ticketNumber: number, storeName: string): Promise<messagingApi.Message> {
    return {
        type: 'flex',
        altText: '調理完了しました',
        contents: {
        type: 'bubble',
        size: 'hecto',
        body: {
            type: 'box',
            layout: 'vertical',
            contents: [
            {
                type: 'text',
                text: `\nチケット番号\n`,
                wrap: true,
                size: 'md',
                align: "center",
                weight: 'bold', 
            },
            {
                type: 'text',
                text: `${ticketNumber}`,
                wrap: true,
                size: '5xl',
                color: '#00AA00', 
                weight: 'bold', 
                gravity: "center",
                align: "center",
            },
            {
                "type": "separator"
            },
            {
                type: 'text',
                text: `\n${storeName}\n調理完了`,
                wrap: true,
                size: 'lg',
                weight: 'bold', 
                align: "center",

            },
            {
                type: 'text',
                text: `\n上記の商品が出来上がりました\nこの画面を表示して${storeName}まで受け取りに来てください\n`,
                wrap: true,
                size: 'md',
            },
            ],
        },
    },
    }
}
