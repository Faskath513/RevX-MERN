export default async function handler(req, res) {
  const { id } = req.query;
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  try {
    if (req.method === 'PUT') {
      const response = await fetch(`${BACKEND_URL}/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body),
      });
      const data = await response.json();
      return res.status(response.status).json(data);

    } else if (req.method === 'DELETE') {
      const response = await fetch(`${BACKEND_URL}/api/users/${id}`, {
        method: 'DELETE',
      });
      return res.status(response.status).end();

    } else {
      return res.status(405).end(); // Method Not Allowed
    }
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}