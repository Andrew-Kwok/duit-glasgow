import type {NextApiRequest, NextApiResponse} from 'next';
import PurchaseService from '@component/pages/api/purchase/service/service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const { purchase, code } = req.body;
    if (code !== process.env.UPDATE_DATABASE_CODE) {
        return res.status(403).json({ error: 'Invalid or missing code' });
    }

    try {
        await PurchaseService.upsertPurchaseWithDetails(purchase);
        res.status(200).json({ message: 'Purchase upserted successfully' });
    } catch (error: any) {
        console.error('Error upserting purchase:', error);
        res.status(500).json({ error: error.message });
    }
}
