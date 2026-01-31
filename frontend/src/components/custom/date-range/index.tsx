import { HStack, Icon, Input, type InputProps } from '@chakra-ui/react';
import { type FieldValues, type Path, useFormContext, type UseFormRegister } from 'react-hook-form';
import { PiArrowRight } from 'react-icons/pi';

type DateRangeProps<T extends FieldValues> = {
  startName: Path<T>;
  endName: Path<T>;
  type?: 'date' | 'month';
  register?: UseFormRegister<T>;
  disabledStart?: boolean;
  disabledEnd?: boolean;
} & Omit<InputProps, 'type'>;

export function DateRange<T extends FieldValues>({
  startName,
  endName,
  type = 'date',
  register,
  disabledStart,
  disabledEnd,
  ...rest
}: DateRangeProps<T>) {
  const { register: ctxRegister } = useFormContext<T>();
  register = register ?? ctxRegister;

  return (
    <HStack w="full">
      <Input
        type={type}
        flex="1"
        cursor="text"
        disabled={disabledStart}
        {...register(startName)}
        {...rest}
      />
      <Icon>
        <PiArrowRight />
      </Icon>
      <Input
        type={type}
        flex="1"
        cursor="text"
        disabled={disabledEnd}
        {...register(endName)}
        {...rest}
      />
    </HStack>
  );
}
