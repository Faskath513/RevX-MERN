import { feedback } from '../../../data/feedback'; // Example data source

export default function handler(req, res) {
  const { id } = req.query;
  const fb = feedback.find(f => f.id === parseInt(id));

  if (req.method === 'PUT') {
    if (!fb) {
      return res.status(404).json({ message: 'Feedback not found' });
    }
    const updatedFeedback = { ...fb, ...req.body };
    res.status(200).json(updatedFeedback);
  } else if (req.method === 'DELETE') {
    if (!fb) {
      return res.status(404).json({ message: 'Feedback not found' });
    }
    const index = feedback.indexOf(fb);
    feedback.splice(index, 1); // Remove feedback from the list (replace with actual DB logic)
    res.status(204).end();
  } else {
    res.status(405).end(); // Method Not Allowed
  }
}
