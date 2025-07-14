export default async function handler(req, res) {
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  if (req.method === 'GET') {
    try {
      const response = await fetch(`${BACKEND_URL}/api/users`);
      const data = await response.json();
      return res.status(200).json(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      return res.status(500).json({ error: 'Failed to fetch users' });
    }
  } else {
    return res.status(405).end(); // Method Not Allowed
  }
}