
const express = require('express');
const router = express.Router();
const {
  createAppointment,
  getMyAppointments,
  getAppointmentById,
  updateAppointmentStatus,
} = require('../controllers/appointmentController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').post(protect, createAppointment);
router.route('/myappointments').get(protect, getMyAppointments);
router.route('/:id').get(protect, getAppointmentById);
router.route('/:id/status').put(protect, admin, updateAppointmentStatus);

module.exports = router;
