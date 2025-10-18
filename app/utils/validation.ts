import { z } from 'zod';
import { OrderDetailFragment } from '~/generated/graphql';
import { ShippingFormData } from '~/types';

export function shippingFormDataIsValid(
  data: FormData | Record<string, string>,
): boolean {
  const shippingFormData = (
    data instanceof FormData ? Object.fromEntries<any>(data.entries()) : data
  ) as ShippingFormData;
  return !!(
    shippingFormData.streetLine1 &&
    shippingFormData.city &&
    shippingFormData.countryCode &&
    shippingFormData.postalCode
  );
}

export function replaceEmptyString(input: string | undefined | null) {
  if (!input || input.trim().length == 0) {
    return '-';
  }
  return input;
}

export const CustomerForOrderSchema = z.object({
  emailAddress: z.string().email({ message: 'Email is invalid' }),
  firstName: z.string().min(1, { message: 'First name is required' }),
  lastName: z.string().min(1, { message: 'Last name is required' }),
});

export const REQUIRED_SHIPPING_ADDRESS_FIELDS: (keyof Partial<
  NonNullable<OrderDetailFragment['shippingAddress']>
>)[] = [
  'fullName',
  'countryCode',
  'streetLine1',
  'province',
  'city',
  'phoneNumber',
  'postalCode',
];

export const ShippingAdressFormSchema = z.object({
  fullName: REQUIRED_SHIPPING_ADDRESS_FIELDS.includes('fullName')
    ? z.string().min(1, { message: 'Full name is required' })
    : z.string().optional(),

  countryCode: REQUIRED_SHIPPING_ADDRESS_FIELDS.includes('countryCode')
    ? z.string().min(1, { message: 'Country code is required' })
    : z.string().optional(),

  province: REQUIRED_SHIPPING_ADDRESS_FIELDS.includes('province')
    ? z.string().min(1, { message: 'Province is required' })
    : z.string().optional(),

  city: REQUIRED_SHIPPING_ADDRESS_FIELDS.includes('city')
    ? z.string().min(1, { message: 'City is required' })
    : z.string().optional(),

  streetLine1: REQUIRED_SHIPPING_ADDRESS_FIELDS.includes('streetLine1')
    ? z.string().min(1, { message: 'Street line 1 is required' })
    : z.string().optional(),

  phoneNumber: REQUIRED_SHIPPING_ADDRESS_FIELDS.includes('phoneNumber')
    ? z.string().min(9, { message: 'Invalid Phone Number' })
    : z.string().optional(),

  postalCode: REQUIRED_SHIPPING_ADDRESS_FIELDS.includes('postalCode')
    ? z.string().min(1, { message: 'Postal code is required' })
    : z.string().optional(),

  streetLine2: REQUIRED_SHIPPING_ADDRESS_FIELDS.includes('streetLine2')
    ? z.string().min(1, { message: 'Street line 2 is required' })
    : z.string().optional(),

  company: REQUIRED_SHIPPING_ADDRESS_FIELDS.includes('company')
    ? z.string().min(1, { message: 'Company is required' })
    : z.string().optional(),
});
