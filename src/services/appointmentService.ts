
import api from './api';

export interface Appointment {
  _id: string;
  service: string;
  date: string;
  time: string;
  status: string;
  notes: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
}

export const appointmentService = {
  createAppointment: async (appointmentData: Partial<Omit<Appointment, 'address'>> & {
    address?: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
    }
  }): Promise<Appointment> => {
    const { data } = await api.post('/appointments', appointmentData);
    return data;
  },

  getMyAppointments: async (): Promise<Appointment[]> => {
    const { data } = await api.get('/appointments/myappointments');
    return data;
  },

  getAppointmentById: async (id: string): Promise<Appointment> => {
    const { data } = await api.get(`/appointments/${id}`);
    return data;
  },
};
