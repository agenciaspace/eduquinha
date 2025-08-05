/**
 * Utility function to merge class names conditionally
 * Simple alternative to clsx/classnames
 */
export function cn(...classes) {
  return classes
    .filter(Boolean)
    .join(' ')
    .trim()
}