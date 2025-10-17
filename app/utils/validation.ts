import { z } from 'zod';
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

export const ShippingAdressFormSchema = z.object({
  fullName: z.string().min(1, { message: 'Full name is required' }),
  countryCode: z.string().min(1, { message: 'Country is required' }),
  province: z.string().optional(),
  city: z.string().min(1, { message: 'City is required' }),
  streetLine1: z.string().min(1, { message: 'Street line 1 is required' }),
  streetLine2: z.string().optional(),
  postalCode: z.string().optional(),
  company: z.string().optional(),
  phoneNumber: z.string().optional(),
});
