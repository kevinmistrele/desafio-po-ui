import { Component, computed, model } from '@angular/core';

@Component({
  selector: 'km-style-editor',
  template: `
    @for (variable of variables(); track variable.name) {
      <label class="color-field">
        <input
          #colorInput
          type="color"
          [value]="variable.value"
          (input)="setVariable(variable.name, colorInput.value)"
        />
        <code>{{ variable.name }}</code>
      </label>
    }
  `,
  styles: `
    :host {
      display: grid;
      gap: 0.5rem;
    }

    .color-field {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.8125rem;
      cursor: pointer;
    }

    input {
      width: 2rem;
      height: 2rem;
      padding: 0;
      border: 1px solid var(--color-neutral-light-30);
      border-radius: 4px;
      cursor: pointer;
    }

    input:focus-visible {
      outline: 3px solid var(--color-action-focus);
      outline-offset: 2px;
    }
  `,
})
export class StyleEditor {
  readonly values = model.required<Record<string, string>>();

  protected readonly variables = computed(() =>
    Object.entries(this.values()).map(([name, value]) => ({ name, value })),
  );

  protected setVariable(name: string, value: string): void {
    this.values.update((values) => ({ ...values, [name]: value }));
  }
}
