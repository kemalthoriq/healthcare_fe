"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CircleAlert, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fetchMe, login, meQueryKey, safeNextPath } from "@/lib/api/auth";
import { isApiError } from "@/lib/api/client";

const schema = z.object({
  email: z.string().trim().min(1, "Email wajib diisi.").pipe(z.email("Format email belum sesuai.")),
  password: z.string().min(1, "Password wajib diisi."),
});

type LoginValues = z.infer<typeof schema>;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const next = safeNextPath(searchParams.get("next"));

  const meQuery = useQuery({ queryKey: meQueryKey, queryFn: fetchMe, retry: false });

  useEffect(() => {
    if (meQuery.isSuccess) {
      router.replace(next);
    }
  }, [meQuery.isSuccess, next, router]);

  const form = useForm<LoginValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });
  const errors = form.formState.errors;

  const mutation = useMutation({
    mutationFn: (values: LoginValues) => login(values.email, values.password),
    onSuccess: (user) => {
      queryClient.setQueryData(meQueryKey, user);
      router.replace(next);
    },
  });

  const errorMessage = mutation.error
    ? isApiError(mutation.error)
      ? mutation.error.message
      : "Login belum berhasil. Silakan coba lagi."
    : null;

  return (
    <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))} noValidate className="space-y-5">
      {errorMessage && (
        <Alert variant="destructive">
          <CircleAlert aria-hidden="true" strokeWidth={1.75} />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="username"
          autoFocus
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "email-error" : undefined}
          {...form.register("email")}
        />
        {errors.email && (
          <p id="email-error" className="text-sm text-danger">
            {errors.email.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          aria-invalid={!!errors.password}
          aria-describedby={errors.password ? "password-error" : undefined}
          {...form.register("password")}
        />
        {errors.password && (
          <p id="password-error" className="text-sm text-danger">
            {errors.password.message}
          </p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={mutation.isPending || mutation.isSuccess}>
        {(mutation.isPending || mutation.isSuccess) && <Loader2 aria-hidden="true" className="animate-spin" />}
        Masuk
      </Button>
    </form>
  );
}
