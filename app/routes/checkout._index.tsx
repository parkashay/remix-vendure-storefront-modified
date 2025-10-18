import {
  useLoaderData,
  useNavigate,
  useOutletContext,
  useSearchParams,
} from '@remix-run/react';
import { LoaderFunctionArgs, redirect } from '@remix-run/server-runtime';
import { Button } from '~/components/Button';
import { CheckoutStepWrapper } from '~/components/checkout/CheckoutStepsWrapper';
import { CustomerForOrderForm } from '~/components/checkout/CustomerForOrderForm';
import { ShippingAddressForm } from '~/components/checkout/ShippingAddressForm';
import { ShippingMethodSelector } from '~/components/checkout/ShippingMethodSelector';
import { OrderDetailFragment } from '~/generated/graphql';
import {
  getAvailableCountries,
  getEligibleShippingMethods,
} from '~/providers/checkout/checkout';
import { getActiveCustomerAddresses } from '~/providers/customer/customer';
import { getActiveOrder } from '~/providers/orders/order';
import { CHECKOUT_STEPS, OutletContext, StepTypes } from '~/types';
import { REQUIRED_SHIPPING_ADDRESS_FIELDS } from '~/utils/validation';

export async function loader({ request }: LoaderFunctionArgs) {
  const availableCountriesPromise = getAvailableCountries({ request });
  const eligibleShippingMethodsPromise = getEligibleShippingMethods({
    request,
  });
  const activeCustomerPromise = getActiveCustomerAddresses({ request });

  const activeOrderPromise = getActiveOrder({ request });

  const [
    activeOrder,
    { availableCountries },
    { eligibleShippingMethods },
    { activeCustomer },
  ] = await Promise.all([
    activeOrderPromise,
    availableCountriesPromise,
    eligibleShippingMethodsPromise,
    activeCustomerPromise,
  ]);

  if (!activeOrder) {
    return redirect('/');
  }

  return {
    availableCountries,
    eligibleShippingMethods,
    activeCustomer,
    activeOrder,
  };
}

export default function CheckoutShipping() {
  const {
    availableCountries,
    eligibleShippingMethods,
    activeOrder,
    activeCustomer,
  } = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();

  const navigate = useNavigate();

  const shippingAddress = activeOrder?.shippingAddress;
  const isSignedIn = Boolean(activeCustomer?.id);

  function getCurrentStep() {
    const step = searchParams.get('step') as StepTypes;
    if (step) {
      return step;
    }
    if (isSignedIn) {
      return CHECKOUT_STEPS.ADDRESS;
    }
    return CHECKOUT_STEPS.CUSTOMER;
  }
  const currentStep: StepTypes = getCurrentStep();

  const { activeOrderFetcher } = useOutletContext<OutletContext>();

  const isCustomerFormComplete = Boolean(activeOrder?.customer);
  const isShippingAddressFormComplete = (() => {
    if (!shippingAddress) {
      return false;
    }

    for (const field of REQUIRED_SHIPPING_ADDRESS_FIELDS) {
      if (!shippingAddress[field]) {
        return false;
      }
    }

    return true;
  })();

  const selectedShippingMethod = Boolean(
    activeOrder?.shippingLines[0]?.shippingMethod,
  );

  const canProceedToPayment = Boolean(
    isCustomerFormComplete &&
      isShippingAddressFormComplete &&
      selectedShippingMethod,
  );

  const customerInfoSummary = (() => {
    if (activeOrder?.customer) {
      return `${activeOrder?.customer?.firstName} ${activeOrder?.customer?.lastName}`;
    }
    return null;
  })();

  const shippingAddressSummary = (() => {
    const summaryArray: string[] = [];
    if (shippingAddress?.streetLine1) {
      summaryArray.push(shippingAddress?.streetLine1);
    }
    if (shippingAddress?.city) {
      summaryArray.push(shippingAddress?.city);
    }
    if (shippingAddress?.province) {
      summaryArray.push(shippingAddress?.province);
    }
    if (shippingAddress?.countryCode) {
      summaryArray.push(shippingAddress?.countryCode);
    }

    return summaryArray.join(', ');
  })();

  const shippingMethodSummary = (() => {
    if (activeOrder?.shippingLines[0]?.shippingMethod) {
      return activeOrder?.shippingLines[0]?.shippingMethod?.name;
    }
  })();

  const goBackToSpecificStep = (step: StepTypes) => {
    window.location.href = `/checkout?step=${step}`;
  };

  const submitSelectedShippingMethod = (shippingMethodId?: string) => {
    if (shippingMethodId) {
      activeOrderFetcher.submit(
        {
          action: 'setShippingMethod',
          shippingMethodId: shippingMethodId,
        },
        {
          method: 'post',
          action: '/api/active-order',
        },
      );
    }
  };

  return (
    <div className="space-y-3">
      <CheckoutStepWrapper
        index={1}
        title="Customer Information"
        subtitle={customerInfoSummary || ''}
        onClick={() => {
          if (currentStep !== CHECKOUT_STEPS.CUSTOMER && !isSignedIn) {
            goBackToSpecificStep(CHECKOUT_STEPS.CUSTOMER);
          }
        }}
        complete={isCustomerFormComplete}
        disabled={isSignedIn}
      >
        {currentStep === CHECKOUT_STEPS.CUSTOMER && !isSignedIn && (
          <CustomerForOrderForm
            activeOrder={activeOrder as OrderDetailFragment}
            activeCustomer={activeCustomer}
          />
        )}
        {isSignedIn && (
          <span className="absolute right-2 bottom-2 px-2 py-1 bg-primary-100 text-primary-500 rounded-lg text-sm border border-primary-300">
            Signed In
          </span>
        )}
      </CheckoutStepWrapper>

      <CheckoutStepWrapper
        index={2}
        title="Shipping Address"
        subtitle={shippingAddressSummary || ''}
        onClick={() => {
          if (currentStep !== CHECKOUT_STEPS.ADDRESS) {
            goBackToSpecificStep(CHECKOUT_STEPS.ADDRESS);
          }
        }}
        complete={isShippingAddressFormComplete}
        disabled={
          !isCustomerFormComplete || currentStep === CHECKOUT_STEPS.ADDRESS
        }
      >
        {currentStep === CHECKOUT_STEPS.ADDRESS && (
          <ShippingAddressForm
            activeOrder={activeOrder as OrderDetailFragment}
            availableCountries={availableCountries}
            addresses={activeCustomer?.addresses}
          />
        )}
      </CheckoutStepWrapper>

      <CheckoutStepWrapper
        index={2}
        title="Delivery Method"
        subtitle={shippingMethodSummary || ''}
        onClick={() => {
          if (currentStep !== CHECKOUT_STEPS.SHIPPING) {
            setSearchParams({ step: CHECKOUT_STEPS.SHIPPING });
          }
        }}
        complete={selectedShippingMethod}
        disabled={
          !isShippingAddressFormComplete ||
          currentStep === CHECKOUT_STEPS.SHIPPING
        }
      >
        {currentStep === CHECKOUT_STEPS.SHIPPING && (
          <ShippingMethodSelector
            eligibleShippingMethods={eligibleShippingMethods}
            currencyCode={activeOrder?.currencyCode}
            shippingMethodId={
              activeOrder?.shippingLines[0]?.shippingMethod.id ?? ''
            }
            onChange={submitSelectedShippingMethod}
          />
        )}
      </CheckoutStepWrapper>

      {currentStep === CHECKOUT_STEPS.SHIPPING && (
        <Button
          onClick={() => {
            navigate('/checkout/payment');
          }}
          className="mt-3 w-full"
          disabled={!canProceedToPayment}
        >
          Proceed To Payment
        </Button>
      )}
    </div>
  );
}
