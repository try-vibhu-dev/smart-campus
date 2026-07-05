const express = require('express');
const router = express.Router();
const {
  addClassroom,
  getAllClassrooms,
  checkAvailability,
  deleteClassroom,
  updateClassroom,
  addScheduleSlot,
  deleteScheduleSlot,
  updateScheduleSlot
} = require('../controllers/classroomController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/', protect, getAllClassrooms);
router.get('/availability', protect, checkAvailability);
router.post('/', protect, adminOnly, addClassroom);
router.put('/:id', protect, adminOnly, updateClassroom);
router.delete('/:id', protect, adminOnly, deleteClassroom);
router.post('/:id/schedule', protect, adminOnly, addScheduleSlot);
router.put('/:id/schedule/:slotId', protect, adminOnly, updateScheduleSlot);
router.delete('/:id/schedule/:slotId', protect, adminOnly, deleteScheduleSlot);

module.exports = router;