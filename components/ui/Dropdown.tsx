'use client';

import { useState, useRef, useEffect } from 'react';

interface DropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: 'left' | 'right';
  className?: string;
}

export default function Dropdown({ trigger, children, align = 'right', className = '' }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const alignmentClass = align === 'right' ? 'right-0' : 'left-0';

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>

      {isOpen && (
        <div
          className={`absolute ${alignmentClass} mt-2 w-56 backdrop-blur-md rounded-lg shadow-2xl border py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200`}
          style={{
            backgroundColor: 'rgb(var(--bg-primary) / 0.95)',
            borderColor: 'rgb(var(--border-color))'
          }}
        >
          <div onClick={() => setIsOpen(false)}>{children}</div>
        </div>
      )}
    </div>
  );
}

// Dropdown Item component
interface DropdownItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  icon?: React.ReactNode;
  variant?: 'default' | 'danger';
  disabled?: boolean;
}

export function DropdownItem({
  children,
  onClick,
  icon,
  variant = 'default',
  disabled = false,
}: DropdownItemProps) {
  const defaultStyle = {};
  const dangerStyle = {
    color: 'rgb(var(--danger-600))'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full flex items-center gap-3 px-4 py-2 text-sm text-left transition-colors ${
        disabled ? 'opacity-50 cursor-not-allowed' : variant === 'default' ? 'text-theme-text-primary hover:bg-theme-bg-secondary' : ''
      }`}
      style={variant === 'danger' ? dangerStyle : defaultStyle}
      onMouseEnter={(e) => {
        if (!disabled && variant === 'danger') {
          e.currentTarget.style.backgroundColor = 'rgb(var(--danger-600) / 0.1)';
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && variant === 'danger') {
          e.currentTarget.style.backgroundColor = 'transparent';
        }
      }}
    >
      {icon && <span className="w-5 h-5 flex-shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
}

// Dropdown Divider component
export function DropdownDivider() {
  return <div className="my-1 border-t border-theme-border" />;
}

// Dropdown Label component
export function DropdownLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-4 py-2 text-xs font-semibold text-theme-text-secondary uppercase tracking-wider">
      {children}
    </div>
  );
}
