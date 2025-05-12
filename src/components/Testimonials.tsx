
import React from 'react';
import { Card, CardContent } from './ui/card';

const testimonials = [
  {
    id: 1,
    name: 'Michael Johnson',
    position: 'Restaurant Owner',
    image: '/lovable-uploads/a2a50cd9-28b3-4526-9ab2-2b0f645b0edd.png',
    quote: 'Empire Market helped me find the perfect buyer for my restaurant business. The process was smooth and the support was excellent throughout.'
  },
  {
    id: 2,
    name: 'Sarah Williams',
    position: 'Tech Entrepreneur',
    image: '/lovable-uploads/8762974f-66a2-45ad-a90a-b43bb0c00331.png',
    quote: 'I found my dream business through Empire Market. The detailed listings and direct communication with the seller made the acquisition process transparent and efficient.'
  },
  {
    id: 3,
    name: 'David Chen',
    position: 'Retail Investor',
    image: '/lovable-uploads/99e45206-4341-4454-a8af-181b9a47f0da.png',
    quote: 'As a first-time business buyer, Empire Market provided all the resources and connections I needed to make an informed decision and successfully close the deal.'
  }
];

const Testimonials = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Success Stories</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            See what our users have to say about their experience with Empire Market.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="h-full">
              <CardContent className="p-6 flex flex-col h-full">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold">{testimonial.name}</h4>
                    <p className="text-sm text-gray-500">{testimonial.position}</p>
                  </div>
                </div>
                <div className="mt-2 flex-grow">
                  <p className="text-gray-600 italic">"{testimonial.quote}"</p>
                </div>
                <div className="mt-4 flex">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                    </svg>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
