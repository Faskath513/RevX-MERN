import { goals } from '../../../data/goals'; // Example data source

export default function handler(req, res) {
  if (req.method === 'GET') {
    res.status(200).json(goals);
  } else if (req.method === 'POST') {
    const newGoal = req.body;
    goals.push(newGoal); // Add new goal to the list (replace with actual DB logic)
    res.status(201).json(newGoal);
  } else {
    res.status(405).end(); // Method Not Allowed
  }
}
