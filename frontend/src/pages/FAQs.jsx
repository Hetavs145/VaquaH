import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from 'lucide-react';

const FAQs = () => {
  const faqs = [
    {
      category: "General",
      items: [
        {
          q: "What areas do you serve?",
          a: "We currently serve the greater Mumbai area and surrounding suburbs. We are expanding to new locations soon!"
        },
        {
          q: "How do I book a service?",
          a: "You can book a service directly through our website by navigating to the 'Services' page, selecting your desired service, and choosing a convenient time slot."
        }
      ]
    },
    {
      category: "Services & Pricing",
      items: [
        {
          q: "Are your prices fixed?",
          a: "We offer transparent, upfront pricing for most standard services. For complex jobs, we provide an estimated range and a final quote after inspection."
        },
        {
          q: "Do you provide a warranty on services?",
          a: "Yes! We offer a 30-day warranty on all our repair services. If the issue persists, we'll fix it for free."
        }
      ]
    },
    {
      category: "Orders & Payments",
      items: [
        {
          q: "What payment methods do you accept?",
          a: "We accept all major credit/debit cards, UPI, net banking, and cash on delivery for select services."
        },
        {
          q: "Can I cancel my order?",
          a: "Yes, you can cancel your order before it has been shipped. For services, you can cancel up to 4 hours before the scheduled time."
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex-1">
        {/* Hero Section */}
        <div className="bg-vaquah-blue text-white py-20 animate-fade-in">
          <div className="container-custom text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 animate-slide-up">Frequently Asked Questions</h1>
            <p className="text-xl max-w-2xl mx-auto opacity-90 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              Find answers to common questions about our services and products.
            </p>
          </div>
        </div>

        <div className="container-custom section-padding max-w-4xl">
          {faqs.map((section, idx) => (
            <div key={idx} className="mb-12 animate-slide-up" style={{ animationDelay: `${0.2 + (idx * 0.1)}s` }}>
              <div className="flex items-center gap-3 mb-6">
                <HelpCircle className="text-vaquah-blue" />
                <h2 className="text-2xl font-bold text-gray-800">{section.category}</h2>
              </div>

              <Accordion type="single" collapsible className="w-full space-y-4">
                {section.items.map((item, i) => (
                  <AccordionItem
                    key={i}
                    value={`item-${idx}-${i}`}
                    className="bg-white border border-gray-200 rounded-lg px-6 shadow-sm hover:shadow-md transition-shadow duration-200"
                  >
                    <AccordionTrigger className="text-lg font-medium text-gray-800 hover:text-vaquah-blue hover:no-underline py-4">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-600 pb-4 leading-relaxed">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}

          <div className="text-center mt-16 bg-blue-50 rounded-2xl p-8 animate-scale-in">
            <h3 className="text-xl font-bold mb-4">Still have questions?</h3>
            <p className="text-gray-600 mb-6">Can't find the answer you're looking for? Please chat to our friendly team.</p>
            <a href="/contact" className="inline-block bg-vaquah-blue text-white px-8 py-3 rounded-lg font-medium hover:bg-vaquah-dark-blue transition-colors shadow-lg hover:shadow-xl hover:-translate-y-1 duration-300">
              Get in Touch
            </a>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default FAQs;
