
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from './ui/card';

const categories = [
  { name: 'Retail', icon: '🏪', count: 42 },
  { name: 'Technology', icon: '💻', count: 37 },
  { name: 'Food & Beverage', icon: '🍽️', count: 28 },
  { name: 'Health & Wellness', icon: '💆', count: 24 },
  { name: 'E-commerce', icon: '🛒', count: 31 },
  { name: 'Service Business', icon: '🔧', count: 45 },
];

const CategorySection = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold mb-4">Browse By Category</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explore businesses for sale in various industries and find the perfect opportunity that matches your interests and expertise.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Link 
              to={`/listings?category=${encodeURIComponent(category.name)}`}
              key={category.name}
            >
              <Card className="hover:shadow-lg transition-all cursor-pointer h-full">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <span className="text-4xl mb-4">{category.icon}</span>
                  <h3 className="text-xl font-semibold mb-2">{category.name}</h3>
                  <p className="text-gray-500">{category.count} listings</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
