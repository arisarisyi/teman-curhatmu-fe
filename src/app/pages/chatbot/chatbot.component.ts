import { Component } from '@angular/core';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { MessageBoxComponent } from '../../components/message-box/message-box.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-chatbot',
  imports: [SidebarComponent, MessageBoxComponent, RouterModule],
  templateUrl: './chatbot.component.html',
  styleUrl: './chatbot.css',
})
export class ChatbotComponent {}
