export default async function handler(req, res) {
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  if (req.method === 'GET') {
    try {
      const response = await fetch(`${BACKEND_URL}/api/reviews`);
      const data = await response.json();
      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch reviews' });
    }
  }

  if (req.method === 'POST') {
    try {
      const response = await fetch(`${BACKEND_URL}/api/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body),
      });

      const data = await response.json();
      return res.status(response.status).json(data);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to post review' });
    }
  }

  return res.status(405).end(); // Method Not Allowed
}