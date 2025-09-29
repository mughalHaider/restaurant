// components/ui/Select.tsx
"use client";

import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function Select({
  value,
  onValueChange,
  options,
  placeholder = "Select an option",
  disabled = false,
  className = "",
}: SelectProps) {
  return (
    <SelectPrimitive.Root value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectPrimitive.Trigger
        className={`inline-flex items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${className}`}
      >
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon>
          <ChevronDown className="w-4 h-4 ml-2" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          className="overflow-hidden bg-white rounded-lg shadow-lg border border-gray-200 z-50"
          position="popper"
          sideOffset={5}
          style={{ width: 'var(--radix-select-trigger-width)' }}
        >
          <SelectPrimitive.Viewport className="p-1">
            {options.map((option) => (
              <SelectPrimitive.Item
                key={option.value}
                value={option.value}
                className="relative flex items-center px-8 py-2 text-sm text-gray-900 rounded cursor-pointer hover:bg-amber-50 focus:bg-amber-50 outline-none select-none data-[disabled]:opacity-50 data-[disabled]:pointer-events-none"
              >
                <SelectPrimitive.ItemIndicator className="absolute left-2 inline-flex items-center">
                  <Check className="w-4 h-4 text-amber-600" />
                </SelectPrimitive.ItemIndicator>
                <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}