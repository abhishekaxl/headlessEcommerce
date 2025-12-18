/**
 * Account Dashboard
 * Customer account overview page (requires authentication)
 */

import { getApolloClient } from '@/lib/apollo/client';
import { GET_CUSTOMER } from '@/lib/apollo/queries';
import { redirect } from 'next/navigation';
import { AccountDashboard } from '@/components/account/AccountDashboard';

export default async function AccountPage() {
  const client = getApolloClient();
  const { data } = await client.query({
    query: GET_CUSTOMER,
    fetchPolicy: 'no-cache',
  });
  const customer = data?.customer || null;

  if (!customer) {
    redirect('/login');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Account</h1>
      
      <AccountDashboard customer={customer} />
    </div>
  );
}



