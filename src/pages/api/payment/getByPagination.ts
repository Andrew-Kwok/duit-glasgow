import type {NextApiRequest, NextApiResponse} from 'next';
import PaymentService from "@component/pages/api/payment/service/service";
import {DEFAULT_PAYMENT_PAGE_SIZE} from "@component/pages/api/constants";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const { page = 1, pageSize = DEFAULT_PAYMENT_PAGE_SIZE } = req.query;

    try {
        const { payments, totalPages } = await PaymentService.fetchPayments(Number(page), Number(pageSize));
        res.status(200).json({ payments, totalPages });
    } catch (error: any) {
        console.error('Error fetching payments:', error);
        res.status(500).json({ error: error.message });
    }
}
