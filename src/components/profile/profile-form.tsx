"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";

const profileSchema = z.object({
  displayName: z
    .string()
    .min(2, "Display name must be at least 2 characters")
    .max(64, "Display name must be 64 characters or less"),
  bio: z.string().max(512, "Bio must be 512 characters or less").optional(),
  expertise: z
    .string()
    .max(128, "Expertise must be 128 characters or less")
    .optional(),
});

type ProfileSchema = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  initialData: {
    displayName: string;
    bio: string | null;
    expertise: string | null;
  };
}

export function ProfileForm({ initialData }: ProfileFormProps) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ProfileSchema>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: initialData.displayName,
      bio: initialData.bio ?? "",
      expertise: initialData.expertise ?? "",
    },
  });

  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusVariant, setStatusVariant] = useState<"success" | "error">("success");

  const onSubmit = handleSubmit(async (values) => {
    setStatusMessage(null);

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setStatusVariant("error");
        setStatusMessage(data?.error ?? "Unable to update profile. Please try again.");
        return;
      }

      const updated = await response.json();
      reset({
        displayName: updated.displayName ?? "",
        bio: updated.bio ?? "",
        expertise: updated.expertise ?? "",
      });
      setStatusVariant("success");
      setStatusMessage("Profile updated successfully.");
      router.refresh();
    } catch (error) {
      console.error("Failed to update profile", error);
      setStatusVariant("error");
      setStatusMessage("Something went wrong. Please try again later.");
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="space-y-1">
        <label htmlFor="displayName" className="block text-sm font-medium text-neutral-700">
          Display name
        </label>
        <input
          id="displayName"
          type="text"
          autoComplete="name"
          className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm focus:border-neutral-400 focus:outline-none focus:ring-0 disabled:opacity-60"
          disabled={isSubmitting}
          {...register("displayName")}
        />
        {errors.displayName && (
          <p className="text-sm text-red-600">{errors.displayName.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor="bio" className="block text-sm font-medium text-neutral-700">
          Bio
        </label>
        <textarea
          id="bio"
          rows={5}
          className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm focus:border-neutral-400 focus:outline-none focus:ring-0 disabled:opacity-60"
          disabled={isSubmitting}
          {...register("bio")}
        />
        {errors.bio && <p className="text-sm text-red-600">{errors.bio.message}</p>}
      </div>

      <div className="space-y-1">
        <label htmlFor="expertise" className="block text-sm font-medium text-neutral-700">
          Expertise
        </label>
        <input
          id="expertise"
          type="text"
          className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm focus:border-neutral-400 focus:outline-none focus:ring-0 disabled:opacity-60"
          disabled={isSubmitting}
          {...register("expertise")}
        />
        {errors.expertise && (
          <p className="text-sm text-red-600">{errors.expertise.message}</p>
        )}
      </div>

      {statusMessage && (
        <p
          className={`rounded-lg px-3 py-2 text-sm ${
            statusVariant === "success"
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {statusMessage}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-full bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-800 disabled:opacity-60"
      >
        {isSubmitting ? "Saving..." : "Save changes"}
      </button>
    </form>
  );
}
