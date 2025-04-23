export function classNames(...className: (string | boolean)[]) {
  return className.filter(Boolean).join(" ");
}
