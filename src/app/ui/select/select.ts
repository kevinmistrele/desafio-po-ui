import {
  booleanAttribute,
  Component,
  computed,
  effect,
  ElementRef,
  forwardRef,
  input,
  linkedSignal,
  signal,
  viewChildren
} from '@angular/core';
import {SelectOption} from './select-options';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';

let nextId = 0;

@Component({
  selector: 'km-select',
  styleUrl: './select.css',
  templateUrl: './select.html',
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => Select), multi: true },
  ],
})
export class Select<T> implements ControlValueAccessor {

  readonly id = `km-select-${nextId++}`;

  readonly disabled = input(false, { transform: booleanAttribute });

  // disabled pode vir do input ou do form
  private readonly disabledByForm = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.disabledByForm());

  readonly options = input.required<readonly SelectOption<T>[]>();
  readonly placeholder = input('Choose an option');
  readonly label = input('');

  // null = nada selecionado (mostra o placeholder)
  protected readonly value = signal<T | null>(null);
  protected readonly isOpen = signal(false);
  // opcao destacada no select, volta pra -1 quando as options mudam
  protected readonly activeIndex = linkedSignal({ source: this.options, computation: () => -1 });


  protected readonly selectedIndex = computed(() =>
    this.options().findIndex((option) => option.value === this.value()),
  );
  protected readonly selectedLabel = computed(() => this.options()[this.selectedIndex()]?.label);

  // aria-activedescendant: leitor de tela fala da a opcao ativa sem tirar o foco do campo
  protected readonly activeOptionId = computed(() =>
    this.isOpen() && this.activeIndex() !== -1 ? this.optionId(this.activeIndex()) : null,
  );
  private readonly optionElements = viewChildren<ElementRef<HTMLElement>>('optionElement');

  private onChange: (value: T | null) => void = () => {};
  private onTouched: () => void = () => {};

  protected optionId(index: number): string {
    return `${this.id}-option-${index}`;
  }

  constructor() {
    // mantem a opcao ativa e visivel quando a lista rola
    effect(() => {
      const activeElement = this.optionElements()[this.activeIndex()];
      activeElement?.nativeElement.scrollIntoView({ block: 'nearest' });
    });
  }

  // ControlValueAccessor: o form chama esses metodoqs

  writeValue(value: T | null): void {
    this.value.set(value);
  }

  registerOnChange(onChange: (value: T | null) => void): void {
    this.onChange = onChange;
  }

  registerOnTouched(onTouched: () => void): void {
    this.onTouched = onTouched;
  }


  protected toggle() {
    if(this.isOpen()) {
      this.close();
    } else {
      this.open();
    }
  }

  private open(index = this.initialActiveIndex()): void {
    if (this.isDisabled()) {
      return;
    }
    this.isOpen.set(true);
    this.activeIndex.set(index);
  }


  private close() {
    this.isOpen.set(false);
  }

  protected selectOption(index: number): void {
    const option = this.options()[index];
    if (!option || option.disabled) {
      return;
    }
    this.value.set(option.value);
    this.onChange(option.value);

    this.close();
  }

  protected activate(index: number): void {
    if (index !== -1 && !this.options()[index]?.disabled) {
      this.activeIndex.set(index);
    }
  }

  // ao abrir: a selecionada ou a primeiro que estiver desabilitado
  private initialActiveIndex(): number {
    const selectedIndex = this.selectedIndex();
    return selectedIndex !== -1 ? selectedIndex : this.findEnabledIndex(0, 1);
  }

  private findEnabledIndex(start: number, step: 1 | -1): number {
    const options = this.options();
    for (let index = start; index >= 0 && index < options.length; index += step) {
      if (!options[index].disabled) {
        return index;
      }
    }
    return -1;
  }

  protected onBlur(): void {
    this.close();
    this.onTouched();
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (this.isDisabled()) {
      return;
    }
    if (this.isOpen()) {
      this.handleOpenListKey(event);
    } else {
      this.handleClosedListKey(event);
    }
  }

  private handleClosedListKey(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowUp':
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.open();
        break;
      case 'Home':
        event.preventDefault();
        this.open(this.findEnabledIndex(0, 1));
        break;
      case 'End':
        event.preventDefault();
        this.open(this.findEnabledIndex(this.options().length - 1, -1));
        break;
    }
  }

  private handleOpenListKey(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.moveActive(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.moveActive(-1);
        break;
      case 'Home':
        event.preventDefault();
        this.activate(this.findEnabledIndex(0, 1));
        break;
      case 'End':
        event.preventDefault();
        this.activate(this.findEnabledIndex(this.options().length - 1, -1));
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.selectOption(this.activeIndex());
        break;
      case 'Escape':
        event.preventDefault();
        this.close();
        break;
      case 'Tab':
        this.selectOption(this.activeIndex());
        this.close();
        break;
    }
  }

  private moveActive(step: 1 | -1): void {
    this.activate(this.findEnabledIndex(this.activeIndex() + step, step));
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabledByForm.set(isDisabled);
  }

}
