import React from 'react';
import { Button } from '../components/ui/button';
import { Check } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const PricingTier = ({ 
  name, 
  price, 
  description, 
  features, 
  highlighted = false,
  buttonText = "Get Started"
}) => {
  return (
    <div className={`rounded-lg overflow-hidden ${
      highlighted ? 'ring-2 ring-primary shadow-lg' : 'border border-gray-200'
    }`}>
      <div className={`p-6 ${highlighted ? 'bg-primary text-white' : 'bg-white'}`}>
        <h3 className="text-xl font-semibold mb-1">{name}</h3>
        <div className="flex items-baseline mb-4">
          <span className="text-3xl font-bold">${price}</span>
          {price > 0 && <span className={`ml-1 text-sm ${highlighted ? 'text-white/80' : 'text-gray-500'}`}>/month</span>}
        </div>
        <p className={`text-sm ${highlighted ? 'text-white/80' : 'text-gray-500'}`}>{description}</p>
      </div>
      <div className="p-6 bg-white space-y-4">
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
              <span className="text-sm text-gray-600">{feature}</span>
            </li>
          ))}
        </ul>
        <Button className={`w-full ${
          highlighted ? 'bg-primary hover:bg-primary-dark' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
        }`}>
          {buttonText}
        </Button>
      </div>
    </div>
  );
};

const Pricing = () => {
  const pricingTiers = [
    {
      name: "Basic",
      price: 0,
      description: "For individuals looking to explore the marketplace",
      features: [
        "Browse business listings",
        "Basic business search filters",
        "Contact up to 3 sellers per month",
        "Email support"
      ],
      buttonText: "Sign Up Free"
    },
    {
      name: "Professional",
      price: 49,
      description: "For serious buyers and business brokers",
      features: [
        "All Basic features",
        "Unlimited seller contacts",
        "Advanced search filters",
        "Early access to new listings",
        "Priority email support"
      ],
      highlighted: true
    },
    {
      name: "Enterprise",
      price: 199,
      description: "For investment firms and acquisition teams",
      features: [
        "All Professional features",
        "Deal advisory services",
        "Due diligence assistance",
        "Dedicated account manager",
        "Custom reporting",
        "Phone & email support"
      ]
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
            <p className="text-xl text-gray-600">
              Choose the plan that's right for your business acquisition goals.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingTiers.map((tier, index) => (
              <PricingTier 
                key={index} 
                name={tier.name} 
                price={tier.price} 
                description={tier.description} 
                features={tier.features} 
                highlighted={tier.highlighted}
                buttonText={tier.buttonText}
              />
            ))}
          </div>
          
          <div className="mt-16 text-center">
            <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
            <div className="max-w-3xl mx-auto space-y-4 text-left">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="font-semibold mb-2">Can I change plans later?</h3>
                <p className="text-gray-600">Yes, you can upgrade or downgrade your plan at any time. Changes will take effect at the start of your next billing cycle.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="font-semibold mb-2">What payment methods do you accept?</h3>
                <p className="text-gray-600">We accept all major credit cards, PayPal, and bank transfers for enterprise accounts.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="font-semibold mb-2">Is there a contract or commitment?</h3>
                <p className="text-gray-600">No long-term contracts. All plans are month-to-month and can be canceled at any time.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Pricing;
