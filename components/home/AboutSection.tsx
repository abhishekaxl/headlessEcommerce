/**
 * About Section - Urban Jungle Co.
 */

'use client';

export function AboutSection() {
  return (
    <section className="about-section">
      <div className="container">
        <div className="about-grid">
          <div className="about-image">
            <img 
              src="https://images.unsplash.com/photo-1463936575829-25148e1db1b8?w=600&q=80" 
              alt="Plants collection"
            />
          </div>
          <div className="about-content">
            <h2>Your Premier Destination for All Green.</h2>
            <p>
              At Urban Jungle Co., we believe in the transformative power of plants. 
              Whether you&apos;re a seasoned gardener or just starting your green journey, 
              our curated selection of plants will inspire and enrich your living space.
            </p>
            
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-number">98%</span>
                <span className="stat-label">Customer Satisfaction</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">103K</span>
                <span className="stat-label">Plants Sold</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .about-section {
          padding: 100px 24px;
          background: #fff;
        }

        .container {
          max-width: 1280px;
          margin: 0 auto;
        }

        .about-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: center;
        }

        .about-image img {
          width: 100%;
          border-radius: 8px;
        }

        .about-content h2 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2.5rem;
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 24px;
          line-height: 1.2;
        }

        .about-content p {
          font-size: 1.1rem;
          line-height: 1.8;
          color: #666;
          margin-bottom: 40px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 32px;
        }

        .stat-item {
          text-align: center;
          padding: 24px;
          background: #f8f7f4;
          border-radius: 8px;
        }

        .stat-number {
          display: block;
          font-family: 'Cormorant Garamond', serif;
          font-size: 3rem;
          font-weight: 700;
          color: #4a7c59;
          margin-bottom: 8px;
        }

        .stat-label {
          font-size: 14px;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        @media (max-width: 1024px) {
          .about-grid {
            grid-template-columns: 1fr;
            gap: 40px;
          }

          .about-content h2 {
            font-size: 2rem;
          }
        }
      `}</style>
    </section>
  );
}

