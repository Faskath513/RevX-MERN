// pages/api/feedback/index.js

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/feedback`);
      const feedback = await response.json();
      res.status(200).json(feedback);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch feedback' });
    }
  } else if (req.method === 'POST') {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body),
      });

      const result = await response.json();
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create feedback' });
    }
  } else {
    res.status(405).end(); // Method Not Allowed
  }
}