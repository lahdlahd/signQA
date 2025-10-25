"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

const loginSchema = z.object({
  identifier: z.string().min(1, "Enter your username or email"),
  password: z.string().min(1, "Enter your password"),
});

type LoginSchema = z.infer<typeof loginSchema>;

interface LoginFormProps {
  allowOAuth?: boolean;
}

export function LoginForm({ allowOAuth = false }: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
  const errorParam = searchParams.get("error");
  const registered = searchParams.get("registered");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState<string | null>(null);
  const [statusVariant, setStatusVariant] = useState<"success" | "error">(
    "success"
  );

  useEffect(() => {
    if (errorParam) {
      setStatusVariant("error");
      setFormMessage("Authentication failed. Please try again.");
      return;
    }

    if (registered) {
      setStatusVariant("success");
      setFormMessage("Account created successfully. You can sign in now.");
      return;
    }

    setFormMessage(null);
  }, [errorParam, registered]);

  const onSubmit = handleSubmit(async (values) => {
    setIsSubmitting(true);
    setFormMessage(null);

    const result = await signIn("credentials", {
      identifier: values.identifier,
      password: values.password,
      redirect: false,
      callbackUrl,
    });

    if (!result || result.error) {
      setStatusVariant("error");
      setFormMessage("Invalid credentials. Please check your details and try again.");
      setError("password", { message: "" });
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
    router.push(result.url ?? callbackUrl);
    router.refresh();
  });

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold text-neutral-900">Log in</h1>
        <p className="text-sm text-neutral-600">
          Use your signQA credentials to access the dashboard.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-1">
          <label htmlFor="identifier" className="block text-sm font-medium text-neutral-700">
            Username or email
          </label>
          <input
            id="identifier"
            type="text"
            autoComplete="username"
            disabled={isSubmitting}
            className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm focus:border-neutral-400 focus:outline-none focus:ring-0 disabled:opacity-60"
            {...register("identifier")}
          />
          {errors.identifier && (
            <p className="text-sm text-red-600">{errors.identifier.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <label htmlFor="password" className="block text-sm font-medium text-neutral-700">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            disabled={isSubmitting}
            className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm focus:border-neutral-400 focus:outline-none focus:ring-0 disabled:opacity-60"
            {...register("password")}
          />
          {errors.password && (
            <p className="text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>

        {formMessage && (
          <p
            className={`rounded-lg px-3 py-2 text-sm ${
              statusVariant === "success"
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {formMessage}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-full bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-800 disabled:opacity-60"
        >
          {isSubmitting ? "Signing in..." : "Continue"}
        </button>
      </form>

      {allowOAuth && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="h-px flex-1 bg-neutral-200" />
            <span className="text-xs uppercase tracking-wide text-neutral-400">
              or continue with
            </span>
            <span className="h-px flex-1 bg-neutral-200" />
          </div>
          <button
            type="button"
            onClick={() => signIn("github", { callbackUrl })}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100"
          >
            <span className="h-2 w-2 rounded-full bg-neutral-900" aria-hidden />
            Continue with GitHub
          </button>
        </div>
      )}
    </div>
  );
}
