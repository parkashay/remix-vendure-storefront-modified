import { XCircleIcon } from '@heroicons/react/24/outline';
import { Form, useActionData } from '@remix-run/react';
import { DataFunctionArgs, json, redirect } from '@remix-run/server-runtime';
import { Button } from '~/components/Button';
import { ErrorCode, ErrorResult } from '~/generated/graphql';
import { requestPasswordReset } from '~/providers/account/account';

export async function action({ params, request }: DataFunctionArgs) {
  const body = await request.formData();
  const email = body.get('email');
  if (typeof email === 'string') {
    const result = await requestPasswordReset(email);
    if (result?.__typename === 'Success') {
      return redirect('/forgot-password/success');
    } else {
      const requestResetError: ErrorResult = {
        errorCode: result?.errorCode as ErrorCode,
        message: result?.message as string,
      };
      return json(requestResetError, {
        status: 401,
      });
    }
  }
}

export default function forgotPasswordPage() {
  const actionData = useActionData<ErrorResult>();

  return (
    <>
      <div className="flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-2xl text-gray-900">
            Forgot Password
          </h2>
        </div>
        <div className="mt-4 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white pt-3 pb-8 px-4 shadow sm:rounded-lg sm:px-10">
            <Form className="space-y-6" method="post">
              <div>
                <label
                  htmlFor="email"
                  className="block font-medium text-primary"
                >
                  Email Address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>
              </div>

              {actionData && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <XCircleIcon
                        className="h-5 w-5 text-red-400"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700 mt-2">
                        {actionData.message}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              <div>
                <Button
                  type="submit"
                  className="w-full flex items-center justify-center"
                >
                  Send Reset Link
                </Button>
              </div>
            </Form>
          </div>
        </div>
      </div>
    </>
  );
}
