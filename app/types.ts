import { useActiveOrder } from '~/utils/use-active-order';
import { CreateAddressInput, OrderDetailFragment } from '~/generated/graphql';

export type OutletContext = ReturnType<typeof useActiveOrder>;

export type ShippingFormData = CreateAddressInput;

export const CHECKOUT_STEPS = {
  CUSTOMER: 'customer',
  ADDRESS: 'address',
  SHIPPING: 'shipping',
} as const;

export type StepTypes = (typeof CHECKOUT_STEPS)[keyof typeof CHECKOUT_STEPS];

export type ActiveOrderFetcherReturnType = {
  activeOrder: OrderDetailFragment;
  errorMessage: string;
};
