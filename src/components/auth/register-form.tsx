"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";

const registerSchema = z.object({
  email: z.string().email("Please provide a valid email"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(32, "Username must be at most 32 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, and underscores are allowed"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(64, "Password must be less than 64 characters"),
  displayName: z.string().max(64, "Display name must be 64 characters or less").optional(),
  bio: z.string().max(512, "Bio must be 512 characters or less").optional(),
  expertise: z.string().max(128, "Expertise must be 128 characters or less").optional(),
});

type RegisterSchema = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    reset,
  } = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      username: "",
      password: "",
      displayName: "",
      bio: "",
      expertise: "",
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState<string | null>(null);

  const onSubmit = handleSubmit(async (values) => {
    setIsSubmitting(true);
    setFormMessage(null);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        const errorMessage =
          data?.error ?? "We couldn't create your account. Please try again.";
        setFormMessage(errorMessage);

        if (response.status === 409) {
          if (errorMessage.toLowerCase().includes("username")) {
            setError("username", { message: errorMessage });
          }
          if (errorMessage.toLowerCase().includes("email")) {
            setError("email", { message: errorMessage });
          }
        }

        return;
      }

      reset();
      router.push("/login?registered=1");
    } catch (error) {
      console.error("Failed to register", error);
      setFormMessage("Something went wrong while creating your account.");
      return;
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <div className="w-full max-w-2xl space-y-8">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold text-neutral-900">Create an account</h1>
        <p className="text-sm text-neutral-600">
          Set up your credentials and start contributing on signQA.
        </p>
      </div>

      <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1 sm:col-span-2">
          <label htmlFor="email" className="block text-sm font-medium text-neutral-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            disabled={isSubmitting}
            className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm focus:border-neutral-400 focus:outline-none focus:ring-0 disabled:opacity-60"
            {...register("email")}
          />
          {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
        </div>

        <div className="space-y-1">
          <label htmlFor="username" className="block text-sm font-medium text-neutral-700">
            Username
          </label>
          <input
            id="username"
            type="text"
            autoComplete="username"
            disabled={isSubmitting}
            className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm focus:border-neutral-400 focus:outline-none focus:ring-0 disabled:opacity-60"
            {...register("username")}
          />
          {errors.username && (
            <p className="text-sm text-red-600">{errors.username.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <label htmlFor="password" className="block text-sm font-medium text-neutral-700">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            disabled={isSubmitting}
            className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm focus:border-neutral-400 focus:outline-none focus:ring-0 disabled:opacity-60"
            {...register("password")}
          />
          {errors.password && (
            <p className="text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <label htmlFor="displayName" className="block text-sm font-medium text-neutral-700">
            Display name (optional)
          </label>
          <input
            id="displayName"
            type="text"
            disabled={isSubmitting}
            className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm focus:border-neutral-400 focus:outline-none focus:ring-0 disabled:opacity-60"
            {...register("displayName")}
          />
          {errors.displayName && (
            <p className="text-sm text-red-600">{errors.displayName.message}</p>
          )}
        </div>

        <div className="space-y-1 sm:col-span-2">
          <label htmlFor="bio" className="block text-sm font-medium text-neutral-700">
            Bio (optional)
          </label>
          <textarea
            id="bio"
            rows={4}
            disabled={isSubmitting}
            className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm focus:border-neutral-400 focus:outline-none focus:ring-0 disabled:opacity-60"
            {...register("bio")}
          />
          {errors.bio && <p className="text-sm text-red-600">{errors.bio.message}</p>}
        </div>

        <div className="space-y-1 sm:col-span-2">
          <label htmlFor="expertise" className="block text-sm font-medium text-neutral-700">
            Expertise (optional)
          </label>
          <input
            id="expertise"
            type="text"
            disabled={isSubmitting}
            className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm focus:border-neutral-400 focus:outline-none focus:ring-0 disabled:opacity-60"
            {...register("expertise")}
          />
          {errors.expertise && (
            <p className="text-sm text-red-600">{errors.expertise.message}</p>
          )}
        </div>

        {formMessage && (
          <p className="sm:col-span-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {formMessage}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="sm:col-span-2 w-full rounded-full bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-800 disabled:opacity-60"
        >
          {isSubmitting ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p className="text-center text-sm text-neutral-600">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-neutral-900 underline-offset-4 hover:underline"
        >
          Log in
        </Link>
      </p>
    </div>
  );
}
