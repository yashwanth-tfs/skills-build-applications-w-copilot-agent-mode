import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: false
  // UI designed to match reference images using Komodo components
  // See src/assets/images/ for design references
})
export class HomeComponent implements OnInit {
  title = 'test-komodo-app';
  description = 'Welcome to your Angular application';
  
  // Reference images available in assets/images/
  referenceImages = ["ui-design.png"];

  ngOnInit(): void {
    // Component initialization
  }
}
