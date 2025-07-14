export default async function handler(req, res) {
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  if (req.method === 'GET') {
    const response = await fetch(`${BACKEND_URL}/api/review-cycles`);
    const data = await response.json();
    res.status(200).json(data);
  } else if (req.method === 'POST') {
    const response = await fetch(`${BACKEND_URL}/api/review-cycles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });
    const data = await response.json();
    res.status(201).json(data);
  } else {
    res.status(405).end();
  }
}