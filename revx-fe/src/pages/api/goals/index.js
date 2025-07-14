// No need to import from data

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const response = await fetch(`${process.env.BACKEND_URL}/api/goals`);
    const data = await response.json();
    res.status(200).json(data);
  } else if (req.method === 'POST') {
    const newGoal = req.body;
    const response = await fetch(`${process.env.BACKEND_URL}/api/goals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newGoal),
    });
    const result = await response.json();
    res.status(201).json(result);
  } else {
    res.status(405).end();
  }
}