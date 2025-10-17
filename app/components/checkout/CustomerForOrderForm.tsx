import { ArrowPathIcon } from '@heroicons/react/24/outline';
import {
  useFetcher,
  useOutletContext,
  useSearchParams,
} from '@remix-run/react';
import { withZod } from '@remix-validated-form/with-zod';
import { useEffect } from 'react';
import { ValidatedForm } from 'remix-validated-form';
import {
  ActiveOrderFetcherReturnType,
  CHECKOUT_STEPS,
  OutletContext,
} from '~/types';
import { CustomerForOrderSchema } from '~/utils/validation';
import { Button } from '../Button';
import { Input } from '../Input';

export function CustomerForOrderForm() {
  const { activeOrder } = useOutletContext<OutletContext>();

  const customer = activeOrder?.customer;

  const [_, setSearchParams] = useSearchParams();

  const fetcher = useFetcher<ActiveOrderFetcherReturnType>();

  const isSubmitting = fetcher.state === 'submitting';

  useEffect(() => {
    if (fetcher.data && !fetcher.data?.errorMessage) {
      setSearchParams(
        { step: CHECKOUT_STEPS.ADDRESS },
        { preventScrollReset: true },
      );
    }
  }, [fetcher.data]);

  return (
    <ValidatedForm
      validator={withZod(CustomerForOrderSchema)}
      method="post"
      action="/api/active-order"
      fetcher={fetcher}
    >
      <input type="hidden" name="action" value="setOrderCustomer" />
      <div className="sm:grid sm:grid-cols-2 gap-3">
        <div className="col-span-2">
          <Input
            name="emailAddress"
            label="Email Address"
            autoComplete="email"
            type="email"
            defaultValue={customer?.emailAddress}
          />
        </div>

        <Input
          name="firstName"
          label="First Name"
          autoComplete="given-name"
          defaultValue={customer?.firstName}
          required
        />

        <Input
          name="lastName"
          label="Last Name"
          autoComplete="family-name"
          defaultValue={customer?.lastName}
          required
        />
      </div>
      {fetcher.data?.errorMessage && (
        <p className="italic text-red-500">{fetcher?.data?.errorMessage}</p>
      )}
      <Button className="my-3" disabled={isSubmitting}>
        Proceed To Address{' '}
        {isSubmitting && <ArrowPathIcon className="w-5 h-5 animate-spin" />}
      </Button>
    </ValidatedForm>
  );
}
