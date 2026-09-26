import { Component, signal } from '@angular/core';
import {Switch} from './ui/switch/switch';
import {Select} from './ui/select/select';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';

interface Page {
  id: 'switch' | 'select';
  label: string;
}

@Component({
  selector: 'km-root',
  imports: [Switch, Select, FormsModule, ReactiveFormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly pages: readonly Page[] = [
    { id: 'switch', label: 'Switch' },
    { id: 'select', label: 'Select' },
  ];
  protected readonly activePage = signal(this.pages[0]);

  protected readonly value = signal(false)
  protected readonly control = new FormControl(false);

}
