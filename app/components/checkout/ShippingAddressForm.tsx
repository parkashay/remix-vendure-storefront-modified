import { ArrowPathIcon } from '@heroicons/react/24/outline';
import {
  useFetcher,
  useOutletContext,
  useSearchParams,
} from '@remix-run/react';
import { withZod } from '@remix-validated-form/with-zod';
import { useEffect } from 'react';
import { ValidatedForm } from 'remix-validated-form';
import { AvailableCountriesQuery } from '~/generated/graphql';
import {
  ActiveOrderFetcherReturnType,
  CHECKOUT_STEPS,
  OutletContext,
} from '~/types';
import { ShippingAdressFormSchema } from '~/utils/validation';
import { Button } from '../Button';
import { Input } from '../Input';
import { Select } from '../Select';

interface Props {
  availableCountries: AvailableCountriesQuery['availableCountries'];
}
export function ShippingAddressForm({ availableCountries }: Props) {
  const { activeOrder } = useOutletContext<OutletContext>();

  const address = activeOrder?.shippingAddress;

  const [_, setSearchParams] = useSearchParams();

  const fetcher = useFetcher<ActiveOrderFetcherReturnType>();
  const isSubmitting = fetcher.state === 'submitting';

  useEffect(() => {
    if (fetcher.data && !fetcher.data?.errorMessage) {
      setSearchParams(
        { step: CHECKOUT_STEPS.SHIPPING },
        { preventScrollReset: true },
      );
    }
  }, [fetcher.data]);

  return (
    <ValidatedForm
      validator={withZod(ShippingAdressFormSchema)}
      className="sm:grid sm:grid-cols-2 gap-3"
      fetcher={fetcher}
      method="post"
      action="/api/active-order"
    >
      <input type="hidden" name="action" value="setCheckoutShipping" />
      <Input
        name="fullName"
        label="Full Name"
        autoComplete="shipping name"
        defaultValue={address?.fullName || ''}
        required
      />

      <Select
        name="countryCode"
        label="Country"
        defaultValue={address?.countryCode ?? availableCountries[0].code}
      >
        {availableCountries?.map((c) => (
          <option value={c.code} key={c.id}>
            {c.name}
          </option>
        ))}
      </Select>

      <Input
        name="city"
        label="City"
        autoComplete="address-level2"
        defaultValue={address?.city ?? ''}
        required
      />
      <Input
        name="company"
        label="Company"
        defaultValue={address?.company ?? ''}
        autoComplete="organization"
      />

      <Input
        name="phoneNumber"
        label="Phone Number"
        autoComplete="tel"
        defaultValue={address?.phoneNumber ?? ''}
      />

      <Input
        name="streetLine1"
        label="Address"
        autoComplete="address-line1"
        defaultValue={address?.streetLine1 ?? ''}
      />

      <Input
        name="province"
        label="Province"
        autoComplete="address-level1"
        required
        defaultValue={address?.province ?? ''}
      />

      <Input
        name="postalCode"
        label="Postal Code"
        autoComplete="postal-code"
        defaultValue={address?.postalCode ?? ''}
      />

      <Button className="my-3 col-span-2" disabled={isSubmitting}>
        Proceed To Shipping
        {isSubmitting && <ArrowPathIcon className="w-5 h-5 animate-spin" />}
      </Button>
    </ValidatedForm>
  );
}
