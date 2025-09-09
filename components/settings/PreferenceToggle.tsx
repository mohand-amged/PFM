'use client';

import { useState, useTransition, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { togglePreference } from '@/app/actions/preferences';

interface PreferenceToggleProps {
  preference: string;
  currentValue: boolean;
  label: string;
  description?: string;
  disabled?: boolean;
  onPreferenceChange?: (preference: string, newValue: boolean) => void;
}

export default function PreferenceToggle({ 
  preference, 
  currentValue, 
  label, 
  description, 
  disabled = false,
  onPreferenceChange 
}: PreferenceToggleProps) {
  const [isChecked, setIsChecked] = useState(currentValue);
  const [isPending, startTransition] = useTransition();

  // Sync local state when prop changes
  useEffect(() => {
    setIsChecked(currentValue);
  }, [currentValue]);

  const handleToggle = () => {
    if (disabled) return;

    const newValue = !isChecked;
    setIsChecked(newValue);
    
    // Immediately update parent state for UI responsiveness
    onPreferenceChange?.(preference, newValue);

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append('preference', preference);
        formData.append('currentValue', currentValue.toString());
        
        await togglePreference(formData);
        console.log(`${label} ${newValue ? 'enabled' : 'disabled'}`);
      } catch (error) {
        // Revert both local and parent state if there's an error
        setIsChecked(currentValue);
        onPreferenceChange?.(preference, currentValue);
        console.error('Error updating preference:', error);
      }
    });
  };

  return (
    <div className={`flex items-center justify-between p-3 border rounded-lg transition-all duration-200 ${
      disabled 
        ? 'border-muted bg-muted/30 opacity-50' 
        : 'border-border bg-background hover:bg-muted/20'
    }`}>
      <div className="flex-1">
        <span className="text-sm font-medium text-foreground">{label}</span>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        {disabled ? (
          <span className="text-xs text-muted-foreground">Coming Soon</span>
        ) : (
          <Switch
            checked={isChecked}
            onCheckedChange={handleToggle}
            disabled={isPending}
            className="transition-opacity"
            style={{ opacity: isPending ? 0.5 : 1 }}
          />
        )}
      </div>
    </div>
  );
}
