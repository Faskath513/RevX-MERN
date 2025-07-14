import { reviewCycles } from '../../../data/reviewCycles'; // Example data source

export default function handler(req, res) {
  const { id } = req.query;
  const cycle = reviewCycles.find(c => c.id === parseInt(id));

  if (req.method === 'PUT') {
    if (!cycle) {
      return res.status(404).json({ message: 'Review cycle not found' });
    }
    const updatedCycle = { ...cycle, ...req.body };
    res.status(200).json(updatedCycle);
  } else if (req.method === 'DELETE') {
    if (!cycle) {
      return res.status(404).json({ message: 'Review cycle not found' });
    }
    const index = reviewCycles.indexOf(cycle);
    reviewCycles.splice(index, 1); // Remove review cycle from the list (replace with actual DB logic)
    res.status(204).end();
  } else {
    res.status(405).end(); // Method Not Allowed
  }
}
