import { CheckCircleIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';

interface Props {
  index: number;
  title: string;
  complete: boolean;
  subtitle?: string;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}

export function CheckoutStepWrapper({
  index,
  title,
  subtitle,
  complete,
  onClick,
  children,
  className,
}: Props) {
  return (
    <div
      role="button"
      tabIndex={index}
      onClick={onClick}
      className={clsx(
        'relative border p-2 md:p-4 rounded border-primary-300 hover:bg-primary-100',
        className,
      )}
    >
      {complete ? (
        <CheckCircleIcon className="size-4 absolute top-2 right-2 text-primary-500" />
      ) : null}
      <div className="flex items-center gap-2 md:gap-6 mb-3">
        <div className="w-12 aspect-square flex items-center justify-center text-xl bg-primary-100 rounded-full text-primary-500">
          {index}
        </div>
        <div className="space-y-2">
          <div className="text-primary-500 text-xl">{title}</div>
          <div>{subtitle}</div>
        </div>
      </div>
      {children}
    </div>
  );
}
