import React from 'react';
import { Star } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'Rahul Sharma',
    location: 'Mumbai',
    quote: 'The installation service was prompt and professional. The AC has been working perfectly since day one, and the cooling is excellent!',
    rating: 5,
    image: 'https://randomuser.me/api/portraits/men/32.jpg'
  },
  {
    id: 2,
    name: 'Priya Patel',
    location: 'Delhi',
    quote: 'I got the VaquaH Pro Inverter model, and it has significantly reduced my electricity bill. Customer service is outstanding.',
    rating: 5,
    image: 'https://randomuser.me/api/portraits/women/44.jpg'
  },
  {
    id: 3,
    name: 'Amit Verma',
    location: 'Bangalore',
    quote: 'The annual maintenance service is worth every penny. My 3-year-old AC still performs like new thanks to their regular servicing.',
    rating: 4,
    image: 'https://randomuser.me/api/portraits/men/68.jpg'
  }
];

const TestimonialSection = () => {
  return (
    <section className="section-padding bg-vaquah-light-blue">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">What Our Customers Say</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Don't just take our word for it. Here's what our happy customers have to say about our products and services.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center mb-4">
                {Array(5).fill(0).map((_, index) => (
                  <Star 
                    key={index}
                    size={16} 
                    fill={index < testimonial.rating ? "currentColor" : "none"}
                    className={index < testimonial.rating ? "text-yellow-400" : "text-gray-300"}
                  />
                ))}
              </div>
              <p className="text-gray-600 italic mb-4">"{testimonial.quote}"</p>
              <div className="flex items-center">
                <img 
                  src={testimonial.image} 
                  alt={testimonial.name} 
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div>
                  <div className="font-medium">{testimonial.name}</div>
                  <div className="text-sm text-gray-500">{testimonial.location}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;
