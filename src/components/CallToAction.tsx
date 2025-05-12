
import React, { ReactNode } from 'react';

interface CallToActionProps {
  title: string;
  description: string;
  action: ReactNode;
}

const CallToAction: React.FC<CallToActionProps> = ({ title, description, action }) => {
  return (
    <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-4">{title}</h2>
        <p className="max-w-2xl mx-auto mb-6 text-lg opacity-90">{description}</p>
        {action}
      </div>
    </section>
  );
};

export default CallToAction;
