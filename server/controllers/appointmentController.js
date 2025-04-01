
const Appointment = require('../models/appointmentModel');

// @desc    Create new appointment
// @route   POST /api/appointments
// @access  Private
const createAppointment = async (req, res) => {
  const {
    service,
    date,
    time,
    notes,
    address,
  } = req.body;

  const appointment = new Appointment({
    user: req.user._id,
    service,
    date,
    time,
    notes,
    address,
  });

  const createdAppointment = await appointment.save();
  res.status(201).json(createdAppointment);
};

// @desc    Get logged in user appointments
// @route   GET /api/appointments/myappointments
// @access  Private
const getMyAppointments = async (req, res) => {
  const appointments = await Appointment.find({ user: req.user._id });
  res.json(appointments);
};

// @desc    Get appointment by ID
// @route   GET /api/appointments/:id
// @access  Private
const getAppointmentById = async (req, res) => {
  const appointment = await Appointment.findById(req.params.id).populate(
    'user',
    'name email'
  );

  if (appointment) {
    res.json(appointment);
  } else {
    res.status(404);
    throw new Error('Appointment not found');
  }
};

// @desc    Update appointment status
// @route   PUT /api/appointments/:id/status
// @access  Private/Admin
const updateAppointmentStatus = async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);

  if (appointment) {
    appointment.status = req.body.status || appointment.status;
    
    if (req.body.technician) {
      appointment.technician = req.body.technician;
    }

    const updatedAppointment = await appointment.save();
    res.json(updatedAppointment);
  } else {
    res.status(404);
    throw new Error('Appointment not found');
  }
};

module.exports = {
  createAppointment,
  getMyAppointments,
  getAppointmentById,
  updateAppointmentStatus,
};
