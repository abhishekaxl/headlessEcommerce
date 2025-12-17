/**
 * Testimonials Section - Urban Jungle Co.
 */

'use client';

import { useState } from 'react';

const testimonials = [
  {
    id: 1,
    text: "I am absolutely thrilled with the service I received from their company! They were attentive, responsive, and genuinely cared about meeting my needs. I highly recommend them.",
    author: "Sarah M.",
    role: "Happy Customer",
  },
  {
    id: 2,
    text: "I am absolutely thrilled with the service I received from their company! They were attentive, responsive, and genuinely cared about meeting my needs. I highly recommend them.",
    author: "Michael R.",
    role: "Loyal Customer",
  },
  {
    id: 3,
    text: "Their team exceeded our expectations. Their creative approach and attention to detail brought our vision to life. Highly recommended!",
    author: "Emily J.",
    role: "Interior Designer",
  },
];

export function TestimonialsSection() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className="testimonials-section">
      <div className="container">
        <div className="section-header">
          <h2>What Our Customers Say</h2>
          <p>Discover the reasons why people loves us and become your go-to partner.</p>
        </div>

        <div className="testimonials-slider">
          <div className="testimonials-track" style={{ transform: `translateX(-${activeIndex * 100}%)` }}>
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="testimonial-card">
                <div className="quote-icon">&ldquo;</div>
                <p className="testimonial-text">{testimonial.text}</p>
                <div className="testimonial-author">
                  <div className="author-avatar">
                    {testimonial.author.charAt(0)}
                  </div>
                  <div className="author-info">
                    <span className="author-name">{testimonial.author}</span>
                    <span className="author-role">{testimonial.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="slider-dots">
          {testimonials.map((_, index) => (
            <button
              key={index}
              className={`dot ${index === activeIndex ? 'active' : ''}`}
              onClick={() => setActiveIndex(index)}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        .testimonials-section {
          padding: 100px 24px;
          background: #fff;
        }

        .container {
          max-width: 900px;
          margin: 0 auto;
        }

        .section-header {
          text-align: center;
          margin-bottom: 60px;
        }

        .section-header h2 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2.5rem;
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 16px;
        }

        .section-header p {
          font-size: 1.1rem;
          color: #666;
          margin: 0;
        }

        .testimonials-slider {
          overflow: hidden;
        }

        .testimonials-track {
          display: flex;
          transition: transform 0.5s ease;
        }

        .testimonial-card {
          flex: 0 0 100%;
          padding: 40px;
          text-align: center;
        }

        .quote-icon {
          font-family: 'Cormorant Garamond', serif;
          font-size: 5rem;
          color: #4a7c59;
          line-height: 1;
          margin-bottom: 20px;
        }

        .testimonial-text {
          font-size: 1.25rem;
          line-height: 1.8;
          color: #333;
          font-style: italic;
          margin-bottom: 32px;
        }

        .testimonial-author {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
        }

        .author-avatar {
          width: 50px;
          height: 50px;
          background: #4a7c59;
          color: #fff;
          font-size: 1.25rem;
          font-weight: 600;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .author-info {
          display: flex;
          flex-direction: column;
          text-align: left;
        }

        .author-name {
          font-weight: 600;
          color: #1a1a1a;
        }

        .author-role {
          font-size: 14px;
          color: #666;
        }

        .slider-dots {
          display: flex;
          justify-content: center;
          gap: 12px;
          margin-top: 40px;
        }

        .dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #e8e6e1;
          border: none;
          cursor: pointer;
          transition: all 0.3s;
        }

        .dot.active {
          background: #4a7c59;
          transform: scale(1.2);
        }

        .dot:hover {
          background: #4a7c59;
        }

        @media (max-width: 768px) {
          .testimonials-section {
            padding: 60px 24px;
          }

          .section-header h2 {
            font-size: 2rem;
          }

          .testimonial-card {
            padding: 20px;
          }

          .testimonial-text {
            font-size: 1.1rem;
          }
        }
      `}</style>
    </section>
  );
}

