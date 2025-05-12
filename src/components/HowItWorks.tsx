
import React from 'react';
import { Card, CardContent } from './ui/card';

const steps = [
  {
    id: 1,
    title: 'Browse Listings',
    description: 'Explore our comprehensive database of businesses for sale across various industries and locations.',
    icon: '🔍'
  },
  {
    id: 2,
    title: 'Contact Sellers',
    description: 'Connect directly with business owners or their representatives to get detailed information.',
    icon: '📞'
  },
  {
    id: 3,
    title: 'Due Diligence',
    description: 'Review financial records, operations, and other critical aspects of the business before making a decision.',
    icon: '📋'
  },
  {
    id: 4,
    title: 'Close the Deal',
    description: 'Finalize the purchase with help from our network of trusted service providers and professionals.',
    icon: '🤝'
  }
];

const HowItWorks = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">How It Works</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Empire Market makes buying a business simple and straightforward. Follow these steps to find and purchase your next business venture.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step) => (
            <Card key={step.id} className="border-t-4 border-blue-600">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center text-2xl">
                  {step.icon}
                </div>
                <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-4">
                  {step.id}
                </div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
