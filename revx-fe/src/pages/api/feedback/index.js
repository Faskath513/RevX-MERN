import { feedback } from '../../../data/feedback'; // Example data source

export default function handler(req, res) {
  if (req.method === 'GET') {
    res.status(200).json(feedback);
  } else if (req.method === 'POST') {
    const newFeedback = req.body;
    feedback.push(newFeedback); // Add new feedback to the list (replace with actual DB logic)
    res.status(201).json(newFeedback);
  } else {
    res.status(405).end(); // Method Not Allowed
  }
}
