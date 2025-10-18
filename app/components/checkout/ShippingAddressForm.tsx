import {
  ArrowLeftIcon,
  ArrowPathIcon,
  PencilIcon,
} from '@heroicons/react/24/outline';
import { useFetcher, useSearchParams } from '@remix-run/react';
import { withZod } from '@remix-validated-form/with-zod';
import { useEffect, useState } from 'react';
import { ValidatedForm } from 'remix-validated-form';
import {
  ActiveCustomerAddressesQuery,
  AvailableCountriesQuery,
  OrderDetailFragment,
} from '~/generated/graphql';
import { ActiveOrderFetcherReturnType, CHECKOUT_STEPS } from '~/types';
import {
  REQUIRED_SHIPPING_ADDRESS_FIELDS,
  ShippingAdressFormSchema,
} from '~/utils/validation';
import { Button } from '../Button';
import { Input } from '../Input';
import { Select } from '../Select';
import { ShippingAddressSelector } from './ShippingAddressSelector';

interface Props {
  addresses: NonNullable<
    ActiveCustomerAddressesQuery['activeCustomer']
  >['addresses'];
  availableCountries: AvailableCountriesQuery['availableCountries'];
  activeOrder?: OrderDetailFragment;
}
export function ShippingAddressForm({
  addresses,
  availableCountries,
  activeOrder,
}: Props) {
  const address = activeOrder?.shippingAddress;

  const [selectedAddressIndex, setSelectedAddressIndex] = useState(() => {
    if (address && addresses) {
      const matchedIndex = addresses.findIndex(
        (a) =>
          a.fullName === address.fullName &&
          a.country.code === address.countryCode &&
          a.city === address.city &&
          a.streetLine1 &&
          address.streetLine1,
      );
      return Math.max(matchedIndex, 0);
    }
    return 0;
  });

  const [willAddSeparateShippingAddress, setWillAddSeparateShippingAddress] =
    useState(false);

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

  const handleSubmitSelectedAddress = () => {
    if (selectedAddressIndex !== null) {
      const selectedAddress = addresses?.[selectedAddressIndex];
      if (selectedAddress) {
        const formData = new FormData();
        formData.append('action', 'setCheckoutShipping');
        formData.append('countryCode', selectedAddress.country.code);
        Object.keys(selectedAddress).forEach((key) => {
          formData.append(key, (selectedAddress as any)[key]);
        });

        fetcher.submit(formData, {
          method: 'post',
          action: '/api/active-order',
        });
      }
    }
  };

  if (addresses && addresses?.length > 0 && !willAddSeparateShippingAddress) {
    return (
      <div className="relative">
        <ShippingAddressSelector
          addresses={addresses}
          onChange={setSelectedAddressIndex}
          selectedAddressIndex={selectedAddressIndex}
        />
        <Button
          className="my-3 col-span-2"
          disabled={isSubmitting}
          onClick={handleSubmitSelectedAddress}
        >
          Proceed To Shipping
          {isSubmitting && <ArrowPathIcon className="w-5 h-5 animate-spin" />}
        </Button>
        <Button
          className="absolute right-0 bottom-0 !rounded-full aspect-square w-8 !p-0"
          title="Enter address manually"
          onClick={() => setWillAddSeparateShippingAddress(true)}
        >
          <PencilIcon className="size-4" />
        </Button>
      </div>
    );
  }

  return (
    <ValidatedForm
      validator={withZod(ShippingAdressFormSchema)}
      className="relative sm:grid sm:grid-cols-2 gap-3"
      fetcher={fetcher}
      method="post"
      action="/api/active-order"
    >
      {addresses && addresses?.length > 0 ? (
        <Button
          className="col-span-2 w-fit bg-white border border-primary-500 hover:!bg-primary-100"
          onClick={() => setWillAddSeparateShippingAddress(false)}
        >
          <ArrowLeftIcon className="size-4 text-primary-500" />
        </Button>
      ) : null}
      <input type="hidden" name="action" value="setCheckoutShipping" />
      <Input
        name="fullName"
        label="Full Name"
        autoComplete="shipping name"
        defaultValue={
          address?.fullName ||
          `${activeOrder?.customer?.firstName} ${activeOrder?.customer?.lastName}` ||
          ''
        }
        required={REQUIRED_SHIPPING_ADDRESS_FIELDS.includes('fullName')}
      />

      <Input
        name="company"
        label="Company"
        defaultValue={address?.company ?? ''}
        autoComplete="organization"
        required={REQUIRED_SHIPPING_ADDRESS_FIELDS.includes('company')}
      />

      <Select
        name="countryCode"
        label="Country"
        defaultValue={address?.countryCode ?? availableCountries[0].code}
        required={REQUIRED_SHIPPING_ADDRESS_FIELDS.includes('countryCode')}
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
        required={REQUIRED_SHIPPING_ADDRESS_FIELDS.includes('city')}
      />

      <Input
        name="phoneNumber"
        label="Phone Number"
        autoComplete="tel"
        defaultValue={address?.phoneNumber ?? ''}
        required={REQUIRED_SHIPPING_ADDRESS_FIELDS.includes('phoneNumber')}
      />

      <Input
        name="streetLine1"
        label="Address"
        autoComplete="address-line1"
        defaultValue={address?.streetLine1 ?? ''}
        required={REQUIRED_SHIPPING_ADDRESS_FIELDS.includes('streetLine1')}
      />

      <Input
        name="province"
        label="Province"
        autoComplete="address-level1"
        defaultValue={address?.province ?? ''}
        required={REQUIRED_SHIPPING_ADDRESS_FIELDS.includes('province')}
      />

      <Input
        name="postalCode"
        label="Postal Code"
        autoComplete="postal-code"
        defaultValue={address?.postalCode ?? ''}
        required={REQUIRED_SHIPPING_ADDRESS_FIELDS.includes('postalCode')}
      />

      {fetcher?.data?.errorMessage ? (
        <p className="italic text-red-500">{fetcher?.data?.errorMessage}</p>
      ) : null}

      <Button className="my-3 col-span-2" disabled={isSubmitting}>
        Proceed To Shipping
        {isSubmitting && <ArrowPathIcon className="w-5 h-5 animate-spin" />}
      </Button>
    </ValidatedForm>
  );
}
