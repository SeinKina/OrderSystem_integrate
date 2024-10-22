import { messagingApi } from '@line/bot-sdk';
import { orderList } from '../api/ListenOrder';
export async function flexMessage(orderList: orderList[]): Promise<messagingApi.Message> {
    return {
        type: 'flex',
        altText: '注文情報',
        contents: {
            type: 'carousel',
            contents: orderList.map((item: orderList) => ({
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
            })),
        },
    }
}
