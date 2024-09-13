import type {NextApiRequest, NextApiResponse} from 'next';
import PurchaseService from '@component/pages/api/purchase/service/service';
import {DEFAULT_PURCHASE_PAGE_SIZE} from "@component/pages/api/constants";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const { page = 1, pageSize = DEFAULT_PURCHASE_PAGE_SIZE      } = req.query;

    try {
        const { purchases, totalPages } = await PurchaseService.fetchPurchases(Number(page), Number(pageSize));
        res.status(200).json({ purchases, totalPages });
    } catch (error: any) {
        console.error('Error fetching purchases:', error);
        res.status(500).json({ error: error.message });
    }
}
