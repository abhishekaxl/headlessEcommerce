/**
 * Account Dashboard Component
 * Customer account overview
 */

import { Customer } from '@/lib/graphql/types';
import Link from 'next/link';

interface AccountDashboardProps {
  customer: Customer;
}

export function AccountDashboard({ customer }: AccountDashboardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Account Info */}
      <div className="md:col-span-2">
        <h2 className="text-2xl font-semibold mb-4">Account Information</h2>
        <div className="border rounded-lg p-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-600">Name</label>
              <p className="font-medium">{customer.fullName}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Email</label>
              <p className="font-medium">{customer.email}</p>
            </div>
            {customer.phone && (
              <div>
                <label className="text-sm text-gray-600">Phone</label>
                <p className="font-medium">{customer.phone}</p>
              </div>
            )}
          </div>
          <Link
            href="/account/profile"
            className="mt-6 inline-block text-blue-600 hover:text-blue-800"
          >
            Edit Profile →
          </Link>
        </div>
      </div>

      {/* Quick Links */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Quick Links</h2>
        <div className="space-y-2">
          <Link
            href="/account/orders"
            className="block p-4 border rounded-lg hover:bg-gray-50"
          >
            Order History
          </Link>
          <Link
            href="/account/addresses"
            className="block p-4 border rounded-lg hover:bg-gray-50"
          >
            Address Book
          </Link>
          <Link
            href="/account/profile"
            className="block p-4 border rounded-lg hover:bg-gray-50"
          >
            Profile Settings
          </Link>
        </div>
      </div>
    </div>
  );
}

