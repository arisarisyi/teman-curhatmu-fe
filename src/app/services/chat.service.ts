// chat.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

export interface ChatMessage {
  _id: string;
  topic: string;
  user: string;
  sender: 'user' | 'bot';
  message: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private baseUrl = 'http://localhost:3000';

  // Subject untuk pesan baru
  private newMessageSubject = new BehaviorSubject<ChatMessage | null>(null);
  newMessage$ = this.newMessageSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Method untuk menyiarkan pesan baru
  addMessage(message: ChatMessage) {
    this.newMessageSubject.next(message);
  }
}
