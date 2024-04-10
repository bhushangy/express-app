const express = require('express');
const {
  getAllUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
} = require('../controllers/userController');
const { signup } = require('../controllers/authController');

const router = express.Router();

router.post('/signup', signup);
// Why 2 routes to create a user. /signup is for the actual user itself, whereas the other endpoints are
// for admins who also may want to create users.
router.route('/').get(getAllUsers).post(createUser);
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
