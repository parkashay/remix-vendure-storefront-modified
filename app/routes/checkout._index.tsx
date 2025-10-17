import {
  useLoaderData,
  useNavigate,
  useOutletContext,
  useSearchParams,
} from '@remix-run/react';
import { json, LoaderFunctionArgs } from '@remix-run/server-runtime';
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
import { CHECKOUT_STEPS, OutletContext, StepTypes } from '~/types';

export async function loader({ request }: LoaderFunctionArgs) {
  const { availableCountries } = await getAvailableCountries({ request });
  const { eligibleShippingMethods } = await getEligibleShippingMethods({
    request,
  });
  return json({ availableCountries, eligibleShippingMethods });
}

export default function CheckoutShipping() {
  const { availableCountries, eligibleShippingMethods } =
    useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();

  const navigate = useNavigate();

  const currentStep: StepTypes =
    (searchParams.get('step') as StepTypes) || CHECKOUT_STEPS.CUSTOMER;

  const { activeOrder, activeOrderFetcher } = useOutletContext<OutletContext>();

  const requiredShippingFields: (keyof Partial<
    NonNullable<OrderDetailFragment['shippingAddress']>
  >)[] = ['fullName', 'countryCode', 'streetLine1', 'province'];

  const isCustomerFormComplete = Boolean(activeOrder?.customer);
  const isShippingAddressFormComplete = (() => {
    const shippingAddress = activeOrder?.shippingAddress;
    if (!shippingAddress) {
      return false;
    }

    for (const field of requiredShippingFields) {
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
    if (
      activeOrder?.shippingAddress?.streetLine1 &&
      activeOrder?.shippingAddress?.province
    ) {
      return `${activeOrder?.shippingAddress?.streetLine1}, ${activeOrder?.shippingAddress?.province}`;
    }
    return null;
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
          if (currentStep !== CHECKOUT_STEPS.CUSTOMER) {
            goBackToSpecificStep(CHECKOUT_STEPS.CUSTOMER);
          }
        }}
        complete={isCustomerFormComplete}
      >
        {currentStep === CHECKOUT_STEPS.CUSTOMER && <CustomerForOrderForm />}
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
      >
        {currentStep === CHECKOUT_STEPS.ADDRESS && (
          <ShippingAddressForm availableCountries={availableCountries} />
        )}
      </CheckoutStepWrapper>

      <CheckoutStepWrapper
        index={2}
        title="Shipping Address"
        subtitle={shippingMethodSummary || ''}
        onClick={() => {
          if (currentStep !== CHECKOUT_STEPS.SHIPPING) {
            setSearchParams({ step: CHECKOUT_STEPS.SHIPPING });
          }
        }}
        complete={selectedShippingMethod}
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

      <Button
        onClick={() => {
          navigate('/checkout/payment');
        }}
        className="mt-3 w-full"
        disabled={!canProceedToPayment}
      >
        Proceed To Payment
      </Button>
    </div>
  );
}
