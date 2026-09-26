import { Component, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Switch } from '../../../ui/switch/switch';
import { StyleEditor } from '../shared/style-editor';

const INITIAL_STYLE: Record<string, string> = {
  '--color-unchecked': '#ffffff',
  '--border-color': '#4a5c60',
  '--track-unchecked': '#dadedf',
  '--color-checked': '#753399',
  '--track-checked': '#bd94d1',
  '--color-unchecked-hover': '#f2eaf6',
  '--color-checked-hover': '#5b1c7d',
  '--outline-color-focused': '#260538',
};

const SECTIONS = [
  { id: 'general', label: 'Geral' },
  { id: 'style', label: 'Estilo' },
] as const;
type Section = (typeof SECTIONS)[number]['id'];

@Component({
  selector: 'km-switch-playground',
  imports: [FormsModule, ReactiveFormsModule, Switch, StyleEditor],
  templateUrl: './switch-playground.html',
  styleUrl: '../playground.css',
})
export class SwitchPlayground {
  protected readonly sections = SECTIONS;
  protected readonly activeSection = signal<Section>('general');

  protected readonly label = signal('Receber notificações');
  protected readonly disabled = signal(false);
  protected readonly styleValues = signal(INITIAL_STYLE);

  protected readonly templateValue = signal(false);
  protected readonly lastEvent = signal<boolean | null>(null);
  protected readonly control = new FormControl(false, { nonNullable: true });

  protected setDisabled(disabled: boolean): void {
    this.disabled.set(disabled);
    if (disabled) {
      this.control.disable();
    } else {
      this.control.enable();
    }
  }

  protected setValue(checked: boolean): void {
    this.templateValue.set(checked);
    this.control.setValue(checked);
  }
}
