/**
 * About Page - Urban Jungle Co.
 */

export const metadata = {
  title: 'About Us - Urban Jungle Co.',
  description: 'Learn about our passion for plants and commitment to bringing nature into your home',
};

export default function AboutPage() {
  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="container">
          <h1>About Urban Jungle Co.</h1>
          <p>Bringing the beauty of nature into your everyday life</p>
        </div>
      </section>

      {/* Story Section */}
      <section className="story-section">
        <div className="container">
          <div className="story-grid">
            <div className="story-image">
              <img 
                src="https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80" 
                alt="Our story"
              />
            </div>
            <div className="story-content">
              <h2>Our Story</h2>
              <p>
                Urban Jungle Co. was founded with a simple mission: to make beautiful, 
                healthy plants accessible to everyone. We believe that every space 
                deserves a touch of nature, and every person deserves the joy that 
                comes from nurturing living things.
              </p>
              <p>
                What started as a small passion project has grown into a thriving 
                community of plant lovers. We carefully curate each plant in our 
                collection, ensuring that only the healthiest and most beautiful 
                specimens make it to your doorstep.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="values-section">
        <div className="container">
          <h2>Our Values</h2>
          <div className="values-grid">
            <div className="value-card">
              <span className="value-icon">🌱</span>
              <h3>Sustainability</h3>
              <p>We're committed to eco-friendly practices, from biodegradable packaging to supporting local growers.</p>
            </div>
            <div className="value-card">
              <span className="value-icon">💚</span>
              <h3>Quality</h3>
              <p>Every plant is hand-selected and inspected to ensure it meets our high standards of health and beauty.</p>
            </div>
            <div className="value-card">
              <span className="value-icon">🤝</span>
              <h3>Community</h3>
              <p>We're building a community of plant lovers who share our passion for bringing nature indoors.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="team-section">
        <div className="container">
          <h2>Meet Our Team</h2>
          <div className="team-grid">
            <div className="team-member">
              <div className="member-image" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&q=80)' }} />
              <h4>Sarah Green</h4>
              <p>Founder & CEO</p>
            </div>
            <div className="team-member">
              <div className="member-image" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80)' }} />
              <h4>Michael Bloom</h4>
              <p>Head of Curation</p>
            </div>
            <div className="team-member">
              <div className="member-image" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&q=80)' }} />
              <h4>Emily Fern</h4>
              <p>Plant Care Expert</p>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .about-page {
          min-height: 100vh;
        }

        .about-hero {
          background: linear-gradient(135deg, rgba(74, 124, 89, 0.1) 0%, #f8f7f4 100%);
          padding: 100px 24px;
          text-align: center;
        }

        .about-hero h1 {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(2.5rem, 5vw, 4rem);
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 16px;
        }

        .about-hero p {
          font-size: 1.25rem;
          color: #666;
          margin: 0;
        }

        .container {
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 24px;
        }

        .story-section {
          padding: 100px 24px;
          background: #fff;
        }

        .story-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: center;
        }

        .story-image img {
          width: 100%;
          border-radius: 8px;
        }

        .story-content h2 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2.5rem;
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 24px;
        }

        .story-content p {
          font-size: 1.1rem;
          line-height: 1.8;
          color: #666;
          margin-bottom: 20px;
        }

        .values-section {
          padding: 100px 24px;
          background: #f8f7f4;
          text-align: center;
        }

        .values-section h2 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2.5rem;
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 60px;
        }

        .values-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 40px;
        }

        .value-card {
          background: #fff;
          padding: 40px 32px;
          border-radius: 8px;
        }

        .value-icon {
          font-size: 3rem;
          display: block;
          margin-bottom: 20px;
        }

        .value-card h3 {
          font-family: 'Jost', sans-serif;
          font-size: 1.25rem;
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 16px;
        }

        .value-card p {
          font-size: 1rem;
          line-height: 1.7;
          color: #666;
          margin: 0;
        }

        .team-section {
          padding: 100px 24px;
          background: #fff;
          text-align: center;
        }

        .team-section h2 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2.5rem;
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 60px;
        }

        .team-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 40px;
          max-width: 900px;
          margin: 0 auto;
        }

        .team-member {
          text-align: center;
        }

        .member-image {
          width: 160px;
          height: 160px;
          border-radius: 50%;
          background-size: cover;
          background-position: center;
          margin: 0 auto 20px;
        }

        .team-member h4 {
          font-family: 'Jost', sans-serif;
          font-size: 1.125rem;
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 8px;
        }

        .team-member p {
          font-size: 14px;
          color: #4a7c59;
          margin: 0;
        }

        @media (max-width: 1024px) {
          .story-grid,
          .values-grid,
          .team-grid {
            grid-template-columns: 1fr;
          }

          .story-grid {
            gap: 40px;
          }
        }
      `}</style>
    </div>
  );
}

