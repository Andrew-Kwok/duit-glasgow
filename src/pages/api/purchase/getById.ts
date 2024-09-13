import type {NextApiRequest, NextApiResponse} from 'next';
import PurchaseService from '@component/pages/api/purchase/service/service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const { id } = req.query;

    if (typeof id !== 'string') {
        return res.status(400).json({ error: 'Invalid or missing purchase ID' });
    }

    try {
        const purchase = await PurchaseService.fetchCompletePurchaseById(id);
        res.status(200).json(purchase);
    } catch (error: any) {
        console.error('Error fetching complete purchase:', error);
        res.status(500).json({ error: error.message });
    }
}
