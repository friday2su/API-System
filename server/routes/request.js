import express from 'express';
import axios from 'axios';

const router = express.Router();

router.post('/', async (req, res) => {
    const { url, method, headers, params, body } = req.body;

    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    const startTime = Date.now();

    try {
        const response = await axios({
            url,
            method,
            headers: headers || {},
            params: params || {},
            data: (method === 'POST' || method === 'PUT') ? body : undefined,
            validateStatus: () => true, // Forward all status codes
        });

        const endTime = Date.now();
        const responseTime = endTime - startTime;

        res.json({
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
});

export default router;
