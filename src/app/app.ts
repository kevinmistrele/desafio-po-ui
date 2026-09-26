import { Component, signal } from '@angular/core';
import { SelectPlayground } from './features/playground/select/select-playground';
import { SwitchPlayground } from './features/playground/switch/switch-playground';

interface Page {
  id: 'switch' | 'select';
  label: string;
}

@Component({
  selector: 'km-root',
  imports: [SwitchPlayground, SelectPlayground],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly pages: readonly Page[] = [
    { id: 'switch', label: 'Switch' },
    { id: 'select', label: 'Select' },
  ];
  protected readonly activePage = signal(this.pages[0]);
}
