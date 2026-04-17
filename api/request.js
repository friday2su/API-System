import axios from 'axios';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { url, method, headers, params, body } = req.body;

    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    const startTime = Date.now();

    try {
        const response = await axios({
            url,
            method: method || 'GET',
            headers: headers || {},
            params: params || {},
            data: (method === 'POST' || method === 'PUT') ? body : undefined,
            validateStatus: () => true,
        });

        const endTime = Date.now();
        const responseTime = endTime - startTime;

        res.status(200).json({
            status: response.status,
            time: responseTime,
            headers: response.headers,
            data: response.data,
        });
    } catch (error) {
        const endTime = Date.now();
        const responseTime = endTime - startTime;

        res.status(500).json({
            status: 0,
            time: responseTime,
            headers: {},
            data: null,
            error: error.message,
        });
    }
}
