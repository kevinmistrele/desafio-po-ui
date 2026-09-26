import { Component, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Select } from '../../../ui/select/select';
import { SelectOption } from '../../../ui/select/select-options';
import { Switch } from '../../../ui/switch/switch';
import { StyleEditor } from '../shared/style-editor';

const INITIAL_OPTIONS: SelectOption[] = [
  { value: '1', label: 'Option 1' },
  { value: '2', label: 'Option 2' },
  { value: '3', label: 'Option 3' },
  { value: '4', label: 'Option 4', disabled: true },
  { value: '5', label: 'Option 5' },
  { value: '6', label: 'Option 6' },
];

const INITIAL_STYLE: Record<string, string> = {
  '--color': '#4a5c60',
  '--background': '#fbfbfb',
  '--text-color': '#1d2426',
  '--text-color-empty': '#b6bdbf',
  '--color-hover': '#5b1c7d',
  '--background-hover': '#f2eaf6',
  '--color-focused': '#753399',
  '--outline-color-focused': '#260538',
  '--color-error': '#be3e37',
};

const SECTIONS = [
  { id: 'general', label: 'Geral' },
  { id: 'options', label: 'Opções' },
  { id: 'style', label: 'Estilo' },
] as const;
type Section = (typeof SECTIONS)[number]['id'];

@Component({
  selector: 'km-select-playground',
  imports: [FormsModule, ReactiveFormsModule, Select, Switch, StyleEditor],
  templateUrl: './select-playground.html',
  styleUrl: '../playground.css',
})
export class SelectPlayground {
  protected readonly sections = SECTIONS;
  protected readonly activeSection = signal<Section>('general');

  protected readonly options = signal<SelectOption[]>(INITIAL_OPTIONS);
  protected readonly label = signal('Selecione uma opção');
  protected readonly placeholder = signal('Choose an option');
  protected readonly disabled = signal(false);
  protected readonly required = signal(true);
  protected readonly styleValues = signal(INITIAL_STYLE);

  protected readonly templateValue = signal<string | null>(null);
  protected readonly control = new FormControl<string | null>(null, Validators.required);

  protected setDisabled(disabled: boolean): void {
    this.disabled.set(disabled);
    if (disabled) {
      this.control.disable();
    } else {
      this.control.enable();
    }
  }

  protected setRequired(required: boolean): void {
    this.required.set(required);
    this.control.setValidators(required ? Validators.required : null);
    this.control.updateValueAndValidity();
  }

  protected updateOption(index: number, changes: Partial<SelectOption>): void {
    this.options.update((options) =>
      options.map((option, i) => (i === index ? { ...option, ...changes } : option)),
    );
  }

  protected addOption(): void {
    const number = this.options().length + 1;
    this.options.update((options) => [
      ...options,
      { value: `${number}`, label: `Option ${number}` },
    ]);
  }

  protected removeOption(index: number): void {
    this.options.update((options) => options.filter((_, i) => i !== index));
  }

  protected selectFirstEnabled(): void {
    const value = this.options().find((option) => !option.disabled)?.value ?? null;
    this.templateValue.set(value);
    this.control.setValue(value);
  }

  protected clearValues(): void {
    this.templateValue.set(null);
    this.control.reset();
  }
}
