import { reviewCycles } from '../../../data/reviewCycles'; // Example data source

export default function handler(req, res) {
  if (req.method === 'GET') {
    res.status(200).json(reviewCycles);
  } else if (req.method === 'POST') {
    const newCycle = req.body;
    reviewCycles.push(newCycle); // Add new review cycle to the list (replace with actual DB logic)
    res.status(201).json(newCycle);
  } else {
    res.status(405).end(); // Method Not Allowed
  }
}
