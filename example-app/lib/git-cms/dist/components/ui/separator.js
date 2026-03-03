'use client';
import React from 'react';
import * as SeparatorPrimitive from '@radix-ui/react-separator';
import { cn } from '../../lib/utils';
export const Separator = React.forwardRef(({ className, orientation = 'horizontal', decorative = true, ...props }, ref) => (React.createElement(SeparatorPrimitive.Root, { ref: ref, decorative: decorative, orientation: orientation, className: cn('shrink-0 bg-gray-200', orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px', className), ...props })));
Separator.displayName = SeparatorPrimitive.Root.displayName;
