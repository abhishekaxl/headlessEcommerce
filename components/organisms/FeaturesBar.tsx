'use client';

import React from 'react';

const features = [
  {
    icon: 'M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0',
    title: 'Free Shipping',
    description: 'On orders over $50',
  },
  {
    icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
    title: 'Secure Payment',
    description: '100% secure checkout',
  },
  {
    icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
    title: 'Easy Returns',
    description: '30-day return policy',
  },
  {
    icon: 'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z',
    title: '24/7 Support',
    description: "We're here to help",
  },
];

export const FeaturesBar: React.FC = () => {
  return (
    <>
      <section className="features-bar">
        <div className="features-container">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d={feature.icon} />
                </svg>
              </div>
              <div className="feature-content">
                <h4 className="feature-title">{feature.title}</h4>
                <p className="feature-desc">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <style jsx>{`
        .features-bar {
          background: var(--off-white);
          padding: 48px 24px;
        }

        .features-container {
          max-width: var(--container-max);
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 32px;
        }

        .feature-card {
          display: flex;
          align-items: flex-start;
          gap: 16px;
        }

        .feature-icon {
          flex-shrink: 0;
          width: 56px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--white);
          border-radius: 50%;
          color: var(--primary);
        }

        .feature-content {
          flex: 1;
        }

        .feature-title {
          font-family: var(--font-body);
          font-size: 1rem;
          font-weight: 600;
          color: var(--black);
          margin-bottom: 4px;
        }

        .feature-desc {
          font-size: 14px;
          color: var(--dark-gray);
          margin: 0;
        }

        @media (max-width: 1024px) {
          .features-container {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 640px) {
          .features-container {
            grid-template-columns: 1fr;
          }

          .feature-card {
            text-align: center;
            flex-direction: column;
            align-items: center;
          }
        }
      `}</style>
    </>
  );
};

export default FeaturesBar;
