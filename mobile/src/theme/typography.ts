// mobile/src/theme/typography.ts

import { StyleSheet } from 'react-native';
import { sizes } from './sizes';

export const typography = StyleSheet.create({
  // Headings
  h1: {
    fontSize: sizes.fontSize['4xl'],
    fontWeight: '700',
    lineHeight: sizes.lineHeight.tight,
    letterSpacing: -0.5,
  },
  
  h2: {
    fontSize: sizes.fontSize['3xl'],
    fontWeight: '700',
    lineHeight: sizes.lineHeight.tight,
    letterSpacing: -0.25,
  },
  
  h3: {
    fontSize: sizes.fontSize['2xl'],
    fontWeight: '600',
    lineHeight: sizes.lineHeight.tight,
  },
  
  h4: {
    fontSize: sizes.fontSize.xl,
    fontWeight: '600',
    lineHeight: sizes.lineHeight.normal,
  },
  
  // Body text
  bodyLarge: {
    fontSize: sizes.fontSize.md,
    fontWeight: '400',
    lineHeight: sizes.lineHeight.relaxed,
  },
  
  body: {
    fontSize: sizes.fontSize.base,
    fontWeight: '400',
    lineHeight: sizes.lineHeight.normal,
  },
  
  bodySmall: {
    fontSize: sizes.fontSize.sm,
    fontWeight: '400',
    lineHeight: sizes.lineHeight.normal,
  },
  
  // Labels & captions
  label: {
    fontSize: sizes.fontSize.sm,
    fontWeight: '500',
    lineHeight: sizes.lineHeight.normal,
  },
  
  caption: {
    fontSize: sizes.fontSize.xs,
    fontWeight: '400',
    lineHeight: sizes.lineHeight.tight,
  },
  
  // Buttons
  buttonLarge: {
    fontSize: sizes.fontSize.md,
    fontWeight: '600',
    lineHeight: sizes.lineHeight.normal,
  },
  
  buttonSmall: {
    fontSize: sizes.fontSize.sm,
    fontWeight: '600',
    lineHeight: sizes.lineHeight.normal,
  },
});
