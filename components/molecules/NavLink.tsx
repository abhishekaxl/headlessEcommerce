'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  activeClassName?: string;
}

export const NavLink: React.FC<NavLinkProps> = ({
  href,
  children,
  className = '',
  activeClassName = 'active',
}) => {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className={`nav-link ${className} ${isActive ? activeClassName : ''}`}
    >
      {children}
      <style jsx>{`
        .nav-link {
          font-family: 'Jost', sans-serif;
          font-size: 15px;
          font-weight: 500;
          color: #333;
          text-decoration: none;
          transition: color 0.2s;
        }
        .nav-link:hover,
        .nav-link.active {
          color: #4a7c59;
        }
      `}</style>
    </Link>
  );
};

export default NavLink;

