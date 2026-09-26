export interface SelectOption<T = string> {
  value: T;
  label: string;
  disabled?: boolean;
}
