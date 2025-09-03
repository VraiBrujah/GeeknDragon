import { ZodTypeAny } from 'zod';
import {
  FormProvider,
  useForm,
  useFormContext,
  type FieldValues,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';

export interface FormWidgetProps<T extends FieldValues> {
  schema: ZodTypeAny;
  defaultValues?: T;
  onSubmit: (data: T) => void;
  children: React.ReactNode;
}

export function FormField({
  name,
  label,
  type = 'text',
}: {
  name: string;
  label: string;
  type?: string;
}) {
  const {
    register,
    formState: { errors, dirtyFields, touchedFields },
  } = useFormContext();
  const error = (errors as any)[name]?.message as string | undefined;
  const dirty = !!(dirtyFields as any)[name];
  const touched = !!(touchedFields as any)[name];
  return (
    <div data-dirty={dirty} data-touched={touched}>
      <label htmlFor={name}>{label}</label>
      <input id={name} type={type} {...register(name)} />
      {error && <span role="alert">{error}</span>}
    </div>
  );
}

export default function FormWidget<T extends FieldValues>({
  schema,
  defaultValues,
  onSubmit,
  children,
}: FormWidgetProps<T>) {
  const methods = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: 'onBlur',
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>{children}</form>
    </FormProvider>
  );
}
