import { users } from '../../../data/users'; // Example data source

export default function handler(req, res) {
  const { id } = req.query;
  const user = users.find(u => u.id === parseInt(id));

  if (req.method === 'PUT') {
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const updatedUser = { ...user, ...req.body };
    res.status(200).json(updatedUser);
  } else if (req.method === 'DELETE') {
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const index = users.indexOf(user);
    users.splice(index, 1); // Remove user from the list (replace with actual DB logic)
    res.status(204).end();
  } else {
    res.status(405).end(); // Method Not Allowed
  }
}
