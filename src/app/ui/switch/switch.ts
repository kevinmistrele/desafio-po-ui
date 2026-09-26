import {booleanAttribute, Component, computed, forwardRef, input, output, signal} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';

// id unico por instancia, usado no <label for>
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
  // booleanAttribute: faz <km-switch disabled> virar true porque se não tiver, vira uma string vazia
  readonly disabled = input(false, {transform: booleanAttribute})
  readonly label = input('')
  // usado quando nao tem label visivel, deve ser usado para ser acessivel
  readonly ariaLabel = input<string>();

  protected readonly buttonId = `km-switch-${nextId++}`;

  readonly checkedChange = output<boolean>();
  protected readonly checked = signal(false);

  private onChange: (checked: boolean) => void = () => {};
  protected onTouched: () => void = () => {};

  // disabled pode vir do input ou do form
  private readonly disabledByForm = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.disabledByForm());

  // atualiza o valor, avisa o form e emite o evento
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
