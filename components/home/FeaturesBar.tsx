/**
 * Features Bar - Urban Jungle Co.
 */

'use client';

export function FeaturesBar() {
  const features = [
    {
      icon: '🔒',
      title: 'Secure Payment',
      description: 'Elementum feugiat diam',
    },
    {
      icon: '🚚',
      title: 'Free Shipping',
      description: 'For $50 order',
    },
    {
      icon: '📦',
      title: 'Delivered with Care',
      description: 'Lacinia pellentesque leo',
    },
    {
      icon: '⭐',
      title: 'Excellent Service',
      description: 'Blandit gravida viverra',
    },
  ];

  return (
    <section className="features-bar">
      <div className="features-container">
        {features.map((feature, index) => (
          <div key={index} className="feature-item">
            <span className="feature-icon">{feature.icon}</span>
            <div className="feature-text">
              <h5>{feature.title}</h5>
              <p>{feature.description}</p>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .features-bar {
          background: #f8f7f4;
          padding: 40px 24px;
          border-bottom: 1px solid #e8e6e1;
        }

        .features-container {
          max-width: 1280px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 32px;
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .feature-icon {
          font-size: 2rem;
          flex-shrink: 0;
        }

        .feature-text h5 {
          font-family: 'Jost', sans-serif;
          font-size: 1rem;
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 4px;
        }

        .feature-text p {
          font-size: 14px;
          color: #666;
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

          .feature-item {
            justify-content: center;
            text-align: center;
            flex-direction: column;
          }
        }
      `}</style>
    </section>
  );
}

