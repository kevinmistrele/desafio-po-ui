import {booleanAttribute, Component, computed, forwardRef, input, output, signal} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';

let nextId = 0

@Component({
  selector: 'km-switch',
  styleUrl: './switch.css',
  templateUrl: './switch.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => Switch), multi: true
    }
  ]
})
export class Switch implements ControlValueAccessor {
  readonly disabled = input(false, {transform: booleanAttribute})
  readonly label = input('')
  readonly ariaLabel = input<string>();

  protected readonly buttonId = `km-switch-${nextId++}`;

  readonly checkedChange = output<boolean>();
  protected readonly checked = signal(false);

  private onChange: (checked: boolean) => void = () => {};
  protected onTouched: () => void = () => {};

  private readonly disabledByForm = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.disabledByForm());

  protected toggle() {
    const checked = !this.checked()
    this.checked.set(checked)
    this.onChange(checked)
    this.checkedChange.emit(checked)
  }

  // ControlValueAccessor: o form chama esses metodos
  writeValue(checked: boolean | null) {
    this.checked.set(checked ?? false);
  }

  registerOnChange(onChange: (checked: boolean) => void) {
    this.onChange = onChange;
  }

  registerOnTouched(onTouched: () => void) {
    this.onTouched = onTouched;
  }

  setDisabledState(isDisabled: boolean) {
    this.disabledByForm.set(isDisabled);
  }
}
