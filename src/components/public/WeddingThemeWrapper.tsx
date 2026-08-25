import React from 'react';
import { useWedding } from '../../context/WeddingContext';

interface WeddingThemeWrapperProps {
  children: React.ReactNode;
}

export const WeddingThemeWrapper: React.FC<WeddingThemeWrapperProps> = ({ children }) => {
  const { currentWeddingTheme } = useWedding();

  const isCustomThemeActive = Boolean(currentWeddingTheme && currentWeddingTheme.enabled);

  // Generate CSS variable inline styles
  const themeStyles = React.useMemo(() => {
    if (!isCustomThemeActive) return {};

    return {
      '--wedding-primary': currentWeddingTheme.primary,
      '--wedding-primary-hover': currentWeddingTheme.primaryHover || currentWeddingTheme.primary,
      '--wedding-primary-fg': currentWeddingTheme.primaryForeground,
      '--wedding-secondary': currentWeddingTheme.secondary,
      '--wedding-secondary-hover': currentWeddingTheme.secondaryHover || currentWeddingTheme.secondary,
      '--wedding-secondary-fg': currentWeddingTheme.secondaryForeground,
      '--wedding-accent': currentWeddingTheme.accent,
      '--wedding-accent-fg': currentWeddingTheme.accentForeground,
      '--wedding-bg-soft': currentWeddingTheme.bgSoft,
      '--wedding-bg-card': currentWeddingTheme.bgCard,
      '--wedding-text-main': currentWeddingTheme.textMain,
      '--wedding-text-muted': currentWeddingTheme.textMuted,
      '--wedding-border': currentWeddingTheme.borderSoft,
    } as React.CSSProperties;
  }, [currentWeddingTheme, isCustomThemeActive]);

  return (
    <div 
      id="wedding-public-theme-container"
      className={`wedding-theme-scope ${isCustomThemeActive ? 'wedding-theme-applied' : ''}`}
      style={themeStyles}
    >
      {isCustomThemeActive && (
        <style>{`
          .wedding-theme-applied .theme-primary-bg {
            background-color: var(--wedding-primary) !important;
            color: var(--wedding-primary-fg) !important;
          }
          .wedding-theme-applied .theme-primary-bg:hover {
            background-color: var(--wedding-primary-hover) !important;
          }
          .wedding-theme-applied .theme-primary-text {
            color: var(--wedding-primary) !important;
          }
          .wedding-theme-applied .theme-primary-border {
            border-color: var(--wedding-primary) !important;
          }
          .wedding-theme-applied .theme-secondary-bg {
            background-color: var(--wedding-secondary) !important;
            color: var(--wedding-secondary-fg) !important;
          }
          .wedding-theme-applied .theme-secondary-text {
            color: var(--wedding-secondary) !important;
          }
          .wedding-theme-applied .theme-accent-bg {
            background-color: var(--wedding-accent) !important;
            color: var(--wedding-accent-fg) !important;
          }
          .wedding-theme-applied .theme-accent-text {
            color: var(--wedding-accent) !important;
          }
          .wedding-theme-applied .theme-soft-bg {
            background-color: var(--wedding-bg-soft) !important;
          }
          .wedding-theme-applied .theme-badge {
            background-color: color-mix(in srgb, var(--wedding-primary) 12%, transparent) !important;
            color: var(--wedding-primary) !important;
          }
          .wedding-theme-applied .theme-badge-secondary {
            background-color: color-mix(in srgb, var(--wedding-secondary) 15%, transparent) !important;
            color: var(--wedding-secondary) !important;
          }
          .wedding-theme-applied .theme-button-primary {
            background-color: var(--wedding-primary) !important;
            color: var(--wedding-primary-fg) !important;
            box-shadow: 0 4px 14px 0 color-mix(in srgb, var(--wedding-primary) 30%, transparent) !important;
          }
          .wedding-theme-applied .theme-button-primary:hover {
            background-color: var(--wedding-primary-hover) !important;
          }
          .wedding-theme-applied .theme-card-highlight {
            border-color: color-mix(in srgb, var(--wedding-primary) 25%, #E8DCCF) !important;
          }
        `}</style>
      )}
      {children}
    </div>
  );
};
