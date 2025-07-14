import { goals } from '../../../data/goals'; // Example data source

export default function handler(req, res) {
  const { id } = req.query;
  const goal = goals.find(g => g.id === parseInt(id));

  if (req.method === 'PUT') {
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }
    const updatedGoal = { ...goal, ...req.body };
    res.status(200).json(updatedGoal);
  } else if (req.method === 'DELETE') {
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }
    const index = goals.indexOf(goal);
    goals.splice(index, 1); // Remove goal from the list (replace with actual DB logic)
    res.status(204).end();
  } else {
    res.status(405).end(); // Method Not Allowed
  }
}
