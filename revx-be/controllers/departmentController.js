const Department = require('../models/Department');

// Create a new department
exports.createDepartment = async (req, res) => {
  const { departmentName, description } = req.body;

  try {
    const newDepartment = new Department({
      departmentName,
      description,
      createdBy: req.user.id, // User (likely HR) who creates the department
    });

    await newDepartment.save();
    res.status(201).json({ message: 'Department created successfully', department: newDepartment });
  } catch (error) {
    res.status(500).json({ message: 'Error creating department', error });
  }
};

// Get all departments
exports.getDepartments = async (req, res) => {
  try {
    const departments = await Department.find().populate('createdBy', 'username');
    res.status(200).json(departments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching departments', error });
  }
};

// Get a specific department by ID
exports.getDepartmentById = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id).populate('createdBy', 'username');
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    res.status(200).json(department);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching department', error });
  }
};

// Update a department
exports.updateDepartment = async (req, res) => {
  const { departmentName, description } = req.body;

  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    // Update fields
    if (departmentName) department.departmentName = departmentName;
    if (description) department.description = description;
    department.updatedAt = Date.now();

    await department.save();
    res.status(200).json({ message: 'Department updated successfully', department });
  } catch (error) {
    res.status(500).json({ message: 'Error updating department', error });
  }
};

// Delete a department
exports.deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findByIdAndDelete(req.params.id);
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    res.status(200).json({ message: 'Department deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting department', error });
  }
};
