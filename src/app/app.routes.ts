import { Routes } from '@angular/router';
import { ChatbotComponent } from './pages/chatbot/chatbot.component';
import { authGuard } from './guards/auth.guard';
import { WelcomeScreenComponent } from './components/welcome-screen/welcome-screen.component';
import { ConversationComponent } from './components/conversation/conversation.component';

export const routes: Routes = [
  {
    path: 'auth',
    loadComponent: () =>
      import('./pages/auth/auth.component').then((m) => m.AuthComponent),
  },
  {
    path: '',
    component: ChatbotComponent,
    canActivate: [authGuard],
    children: [
      { path: '', component: WelcomeScreenComponent },
      {
        path: 'chat/:uuid',
        component: ConversationComponent,
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
