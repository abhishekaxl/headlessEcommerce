/**
 * Checkout Form Component
 * Complete single-page checkout with shipping, billing, and payment
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Cart, Address } from '@/lib/graphql/types';
import { useCart, useSetShippingAddress, useSetBillingAddress, useSetShippingMethod, useSetPaymentMethod, usePlaceOrder } from '@/lib/apollo/hooks';

type CheckoutStep = 'shipping' | 'billing' | 'payment' | 'review';

interface ShippingMethod {
  code: string;
  title: string;
  price: number;
  carrier: string;
}

const SHIPPING_METHODS: ShippingMethod[] = [
  { code: 'flatrate_flatrate', title: 'Flat Rate', price: 5.00, carrier: 'Standard Shipping' },
  { code: 'freeshipping_freeshipping', title: 'Free Shipping', price: 0, carrier: 'Free Shipping' },
  { code: 'tablerate_bestway', title: 'Express', price: 15.00, carrier: 'Express Delivery (2-3 days)' },
];

export function CheckoutForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('shipping');
  const [error, setError] = useState('');
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [email, setEmail] = useState<string>('');
  
  // Apollo hooks
  const { cart, loading: cartLoading } = useCart();
  const { setShippingAddress: setShippingAddressMutation, loading: shippingLoading } = useSetShippingAddress();
  const { setBillingAddress: setBillingAddressMutation, loading: billingLoading } = useSetBillingAddress();
  const { setShippingMethod: setShippingMethodMutation, loading: shippingMethodLoading } = useSetShippingMethod();
  const { setPaymentMethod: setPaymentMethodMutation, loading: paymentMethodLoading } = useSetPaymentMethod();
  const { placeOrder: placeOrderMutation, loading: placeOrderLoading } = usePlaceOrder();
  
  const loading = cartLoading || shippingLoading || billingLoading || shippingMethodLoading || paymentMethodLoading || placeOrderLoading;

  // Magento-aligned checkout data (with fallback to dummy methods)
  const [availableShippingMethods, setAvailableShippingMethods] = useState<
    Array<{ code: string; name: string; description?: string | null; cost: { amount: number; currency: string; formatted: string } }>
  >([]);
  const [availablePaymentMethods, setAvailablePaymentMethods] = useState<
    Array<{ code: string; title: string; name: string; available: boolean }>
  >([]);

  const [shippingAddress, setShippingAddress] = useState<Address>({
    firstName: '',
    lastName: '',
    street1: '',
    street2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'US',
    phone: '',
  });

  const [billingAddress, setBillingAddress] = useState<Address>({
    firstName: '',
    lastName: '',
    street1: '',
    street2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'US',
    phone: '',
  });

  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [selectedShipping, setSelectedShipping] = useState<string>('flatrate_flatrate');
  const [paymentMethod, setPaymentMethod] = useState<string>('checkmo');

  // Use cart from Apollo hook
  useEffect(() => {
    if (cart) {
      setCart(cart);
      // TODO: Fetch checkout data (shipping/payment methods) separately if needed
      // For now, use default methods
      setAvailableShippingMethods(SHIPPING_METHODS.map(m => ({
        code: m.code,
        name: m.title,
        description: m.carrier,
        cost: { amount: m.price, currency: 'USD', formatted: `$${m.price.toFixed(2)}` }
      })));
      setAvailablePaymentMethods([
        { code: 'checkmo', title: 'Check / Money Order', name: 'Check / Money Order', available: true },
        { code: 'banktransfer', title: 'Bank Transfer', name: 'Bank Transfer', available: true },
      ]);
    }
  }, [cart]);

  const handleShippingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (!email.trim()) {
        setError('Email is required');
        return;
      }

      await setShippingAddressMutation(shippingAddress);
      
      if (sameAsShipping) {
        setBillingAddress({ ...shippingAddress });
      }

      // Magento flow: after shipping address, set shipping method
      await setShippingMethodMutation(selectedShipping);

      setCurrentStep('billing');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save shipping address';
      setError(msg);
    }
  };

  const handleBillingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const address = sameAsShipping ? shippingAddress : billingAddress;
      await setBillingAddressMutation(address);
      setCurrentStep('payment');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save billing address';
      setError(msg);
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await setPaymentMethodMutation(paymentMethod);
      setCurrentStep('review');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to set payment method';
      setError(msg);
    }
  };

  const handlePlaceOrder = async () => {
    setError('');

    try {
      const order = await placeOrderMutation(true);
      if (order && 'orderNumber' in order) {
        setOrderNumber(String(order.orderNumber));
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to place order';
      setError(msg);
    }
  };

  const steps = [
    { id: 'shipping', label: 'Shipping' },
    { id: 'billing', label: 'Billing' },
    { id: 'payment', label: 'Payment' },
    { id: 'review', label: 'Review' },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

  const shippingOptions: ShippingMethod[] =
    availableShippingMethods.length > 0
      ? availableShippingMethods.map((m) => ({
          code: m.code,
          title: m.name,
          price: m.cost.amount,
          carrier: m.description || m.name,
        }))
      : SHIPPING_METHODS;

  const paymentOptions: Array<{ code: string; title: string }> =
    availablePaymentMethods.length > 0
      ? availablePaymentMethods.map((m) => ({ code: m.code, title: m.title }))
      : [
          { code: 'checkmo', title: 'Check / Money Order' },
          { code: 'cashondelivery', title: 'Cash on Delivery' },
        ];

  // Order confirmation
  if (orderNumber) {
    return (
      <div className="order-confirmation">
        <div className="confirmation-content">
          <div className="success-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1>Order Confirmed!</h1>
          <p className="message">Thank you for your order</p>
          <div className="order-number">Order #{orderNumber}</div>
          <p className="sub-message">
            We&apos;ve sent a confirmation email with your order details.
          </p>
          <div className="actions">
            <button
              onClick={() => router.push('/account/orders')}
              className="btn btn-primary"
            >
              View Order
            </button>
            <button
              onClick={() => router.push('/')}
              className="btn btn-outline"
            >
              Continue Shopping
            </button>
          </div>
        </div>

        <style jsx>{`
          .order-confirmation {
            max-width: 800px;
            margin: 0 auto;
            padding: 80px 24px;
            text-align: center;
          }
          .confirmation-content {
            background: var(--white);
            padding: 48px;
            border-radius: 12px;
            box-shadow: var(--shadow-sm);
          }
          .success-icon {
            width: 80px;
            height: 80px;
            background-color: var(--primary-light);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 24px;
            color: var(--white);
          }
          .success-icon svg {
            width: 40px;
            height: 40px;
          }
          h1 {
            font-size: 2.5rem;
            color: var(--primary);
            margin-bottom: 16px;
          }
          .message {
            font-size: 1.25rem;
            color: var(--dark-gray);
            margin-bottom: 24px;
          }
          .order-number {
            font-family: var(--font-heading);
            font-size: 1.5rem;
            font-weight: 600;
            color: var(--black);
            background: var(--cream);
            display: inline-block;
            padding: 12px 24px;
            border-radius: 4px;
            margin-bottom: 24px;
          }
          .sub-message {
            color: var(--gray);
            margin-bottom: 40px;
          }
          .actions {
            display: flex;
            gap: 16px;
            justify-content: center;
          }
          .btn {
            min-width: 180px;
          }
          @media (max-width: 640px) {
            .confirmation-content {
              padding: 32px 20px;
            }
            .actions {
              flex-direction: column;
            }
            .btn {
              width: 100%;
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                index <= currentStepIndex
                  ? 'bg-purple-600 border-purple-600 text-white'
                  : 'border-gray-300 text-gray-400'
              }`}>
                {index < currentStepIndex ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <span className={`ml-2 hidden sm:inline font-medium ${
                index <= currentStepIndex ? 'text-gray-900' : 'text-gray-400'
              }`}>
                {step.label}
              </span>
              {index < steps.length - 1 && (
                <div className={`w-12 sm:w-24 h-0.5 mx-2 ${
                  index < currentStepIndex ? 'bg-purple-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2">
          {/* Shipping Step */}
          {currentStep === 'shipping' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Shipping Address</h2>
              <form onSubmit={handleShippingSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                    <input
                      type="text"
                      required
                      value={shippingAddress.firstName}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, firstName: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                    <input
                      type="text"
                      required
                      value={shippingAddress.lastName}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, lastName: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Street Address *</label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.street1}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, street1: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Apt, Suite, etc. (optional)</label>
                  <input
                    type="text"
                    value={shippingAddress.street2 || ''}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, street2: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                    <input
                      type="text"
                      required
                      value={shippingAddress.city}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                    <input
                      type="text"
                      required
                      value={shippingAddress.state}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code *</label>
                    <input
                      type="text"
                      required
                      value={shippingAddress.postalCode}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                  <input
                    type="tel"
                    required
                    value={shippingAddress.phone || ''}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="pt-4">
                  <h3 className="font-medium text-gray-900 mb-3">Shipping Method</h3>
                  <div className="space-y-2">
                    {shippingOptions.map((method) => (
                      <label
                        key={method.code}
                        className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all ${
                          selectedShipping === method.code
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center">
                          <input
                            type="radio"
                            name="shipping"
                            value={method.code}
                            checked={selectedShipping === method.code}
                            onChange={(e) => setSelectedShipping(e.target.value)}
                            className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                          />
                          <div className="ml-3">
                            <p className="font-medium text-gray-900">{method.title}</p>
                            <p className="text-sm text-gray-500">{method.carrier}</p>
                          </div>
                        </div>
                        <span className="font-semibold text-gray-900">
                          {method.price === 0 ? 'Free' : `$${method.price.toFixed(2)}`}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Saving...' : 'Continue to Billing'}
                </button>
              </form>
            </div>
          )}

          {/* Billing Step */}
          {currentStep === 'billing' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Billing Address</h2>
              <form onSubmit={handleBillingSubmit} className="space-y-4">
                <label className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    checked={sameAsShipping}
                    onChange={(e) => setSameAsShipping(e.target.checked)}
                    className="w-4 h-4 text-purple-600 focus:ring-purple-500 rounded"
                  />
                  <span className="ml-2 text-gray-700">Same as shipping address</span>
                </label>

                {!sameAsShipping && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                        <input
                          type="text"
                          required
                          value={billingAddress.firstName}
                          onChange={(e) => setBillingAddress({ ...billingAddress, firstName: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                        <input
                          type="text"
                          required
                          value={billingAddress.lastName}
                          onChange={(e) => setBillingAddress({ ...billingAddress, lastName: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Street Address *</label>
                      <input
                        type="text"
                        required
                        value={billingAddress.street1}
                        onChange={(e) => setBillingAddress({ ...billingAddress, street1: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                        <input
                          type="text"
                          required
                          value={billingAddress.city}
                          onChange={(e) => setBillingAddress({ ...billingAddress, city: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                        <input
                          type="text"
                          required
                          value={billingAddress.state}
                          onChange={(e) => setBillingAddress({ ...billingAddress, state: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code *</label>
                        <input
                          type="text"
                          required
                          value={billingAddress.postalCode}
                          onChange={(e) => setBillingAddress({ ...billingAddress, postalCode: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setCurrentStep('shipping')}
                    className="flex-1 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
                  >
                    {loading ? 'Saving...' : 'Continue to Payment'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Payment Step */}
          {currentStep === 'payment' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Payment Method</h2>
              <form onSubmit={handlePaymentSubmit} className="space-y-4">
                <div className="space-y-2">
                  {paymentOptions.map((pm) => (
                    <label
                      key={pm.code}
                      className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
                        paymentMethod === pm.code
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={pm.code}
                        checked={paymentMethod === pm.code}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                      />
                      <div className="ml-3">
                        <p className="font-medium text-gray-900">{pm.title}</p>
                        <p className="text-sm text-gray-500">Pay using {pm.title}</p>
                      </div>
                    </label>
                  ))}
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setCurrentStep('billing')}
                    className="flex-1 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
                  >
                    {loading ? 'Processing...' : 'Review Order'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Review Step */}
          {currentStep === 'review' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Review Your Order</h2>
              
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Shipping Address</h3>
                    <div className="text-sm text-gray-600">
                      <p>{shippingAddress.firstName} {shippingAddress.lastName}</p>
                      <p>{shippingAddress.street1}</p>
                      {shippingAddress.street2 && <p>{shippingAddress.street2}</p>}
                      <p>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}</p>
                      <p>{shippingAddress.phone}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Billing Address</h3>
                    <div className="text-sm text-gray-600">
                      {sameAsShipping ? (
                        <p className="text-gray-500">Same as shipping</p>
                      ) : (
                        <>
                          <p>{billingAddress.firstName} {billingAddress.lastName}</p>
                          <p>{billingAddress.street1}</p>
                          <p>{billingAddress.city}, {billingAddress.state} {billingAddress.postalCode}</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-medium text-gray-900 mb-2">Shipping Method</h3>
                  <p className="text-sm text-gray-600">
                    {shippingOptions.find(m => m.code === selectedShipping)?.title} - 
                    {shippingOptions.find(m => m.code === selectedShipping)?.carrier}
                  </p>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-medium text-gray-900 mb-2">Payment Method</h3>
                  <p className="text-sm text-gray-600">
                    {paymentOptions.find((p) => p.code === paymentMethod)?.title || paymentMethod}
                  </p>
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => setCurrentStep('payment')}
                  className="flex-1 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handlePlaceOrder}
                  disabled={loading}
                  className="flex-1 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Placing Order...' : 'Place Order'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-4">
            <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>
            
            {cart?.items?.length ? (
              <>
                <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                  {cart.items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="product-image-container">
                        {item.product.images?.[0] ? (
                          <img
                            src={item.product.images[0].url}
                            alt={item.product.name}
                            className="product-image"
                          />
                        ) : (
                          <div className="product-placeholder">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{item.product.name}</p>
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                        <p className="text-sm font-medium text-gray-900">{item.rowTotal.formatted}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-900">{cart.subtotal.formatted}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="text-gray-900">
                      {shippingOptions.find(m => m.code === selectedShipping)?.price === 0
                        ? 'Free'
                        : `$${shippingOptions.find(m => m.code === selectedShipping)?.price.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold pt-2 border-t">
                    <span className="text-gray-900">Total</span>
                    <span className="text-gray-900">{cart.total.formatted}</span>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-gray-500 text-sm">Loading cart...</p>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .product-image-container {
          width: 64px;
          height: 64px;
          background-color: #f3f4f6;
          border-radius: 0.5rem;
          overflow: hidden;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .product-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .product-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #9ca3af;
        }
      `}</style>
    </div>
  );
}
