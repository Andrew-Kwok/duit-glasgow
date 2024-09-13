import type {NextApiRequest, NextApiResponse} from 'next';
import PurchaseService from '@component/pages/api/purchase/service/service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'DELETE') {
        res.setHeader('Allow', ['DELETE']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const { id} = req.query;
    const { code } = req.body;
    if (code !== process.env.UPDATE_DATABASE_CODE) {
        return res.status(403).json({ error: 'Invalid or missing code' });
    }

    if (typeof id !== 'string') {
        return res.status(400).json({ error: 'Invalid or missing purchase ID' });
    }

    try {
        await PurchaseService.deletePurchaseById(id);
        res.status(200).json({ message: 'Purchase deleted successfully' });
    } catch (error: any) {
        console.error('Error deleting purchase:', error);
        res.status(500).json({ error: error.message });
    }
}
