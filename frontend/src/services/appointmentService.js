import api from './api';

export const appointmentService = {
  createAppointment: async (appointmentData) => {
    const { data } = await api.post('/appointments', appointmentData);
    return data;
  },

  getMyAppointments: async () => {
    const { data } = await api.get('/appointments/myappointments');
    return data;
  },

  getAppointmentById: async (id) => {
    const { data } = await api.get(`/appointments/${id}`);
    return data;
  },
};
