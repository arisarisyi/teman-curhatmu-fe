// chat.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, tap } from 'rxjs';

export interface ChatMessage {
  _id: string;
  topic: string;
  user: string;
  sender: 'user' | 'bot';
  message: string;
  createdAt: string;
}

export interface Conversation {
  _id: string;
  title: string;
  createdAt: string;
  // Properti lain sesuai kebutuhan
}

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private baseUrl = 'http://localhost:3000';

  // Subject untuk pesan baru
  private newMessageSubject = new BehaviorSubject<ChatMessage | null>(null);
  newMessage$ = this.newMessageSubject.asObservable();
  // BehaviorSubject untuk menyimpan daftar percakapan
  private conversationsSubject = new BehaviorSubject<Conversation[]>([]);
  conversations$ = this.conversationsSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Method untuk menyiarkan pesan baru
  addMessage(message: ChatMessage) {
    this.newMessageSubject.next(message);
  }

  private getAccessToken(): string | null {
    const match = document.cookie.match(
      new RegExp('(^| )access_token=([^;]+)')
    );
    return match ? match[2] : null;
  }

  fetchConversations() {
    const token = this.getAccessToken();
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    const url = `${this.baseUrl}/chat/topic?sortBy=createdAt&sortOrder=desc`;
    return this.http.get<any>(url, { headers }).pipe(
      tap((response) => {
        if (response.status) {
          // Update BehaviorSubject dengan data percakapan terbaru
          this.conversationsSubject.next(response.data.data);
        }
      })
    );
  }

  deleteConversation(topicId: string) {
    const token = this.getAccessToken();
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    const url = `${this.baseUrl}/chat/${topicId}`;
    return this.http.delete<any>(url, { headers }).pipe(
      tap((response) => {
        if (response.status) {
          // Hapus percakapan dari BehaviorSubject
          const currentConvos = this.conversationsSubject.getValue();
          const updatedConvos = currentConvos.filter(
            (convo) => convo._id !== topicId
          );
          this.conversationsSubject.next(updatedConvos);
        }
      })
    );
  }
}
