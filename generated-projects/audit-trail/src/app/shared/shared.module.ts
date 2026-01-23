import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Import Komodo components as needed
// Example: import { KomodoButtonModule } from '@business-app-systems/komodo-ui';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
    // Add Komodo modules here
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
    // Export Komodo modules here
  ]
})
export class SharedModule { }
