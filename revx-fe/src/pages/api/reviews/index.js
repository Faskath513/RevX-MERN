import { reviews } from '../../../data/reviews'; // Example data source

export default function handler(req, res) {
  if (req.method === 'GET') {
    res.status(200).json(reviews);
  } else if (req.method === 'POST') {
    const newReview = req.body;
    reviews.push(newReview); // Add new review to the list (replace with actual DB logic)
    res.status(201).json(newReview);
  } else {
    res.status(405).end(); // Method Not Allowed
  }
}
