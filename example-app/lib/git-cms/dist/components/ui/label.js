'use client';
import React from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';
import { cn } from '../../lib/utils';
export const Label = React.forwardRef(({ className, ...props }, ref) => (React.createElement(LabelPrimitive.Root, { ref: ref, className: cn('text-xs font-medium leading-none text-gray-600 peer-disabled:cursor-not-allowed peer-disabled:opacity-70', className), ...props })));
Label.displayName = LabelPrimitive.Root.displayName;
