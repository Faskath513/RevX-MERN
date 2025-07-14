import { reviews } from '../../../data/reviews'; // Example data source

export default function handler(req, res) {
  const { id } = req.query;
  const review = reviews.find(r => r.id === parseInt(id));

  if (req.method === 'PUT') {
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    const updatedReview = { ...review, ...req.body };
    res.status(200).json(updatedReview);
  } else if (req.method === 'DELETE') {
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    const index = reviews.indexOf(review);
    reviews.splice(index, 1); // Remove review from the list (replace with actual DB logic)
    res.status(204).end();
  } else {
    res.status(405).end(); // Method Not Allowed
  }
}
