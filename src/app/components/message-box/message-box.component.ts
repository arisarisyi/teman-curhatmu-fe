import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { CookieService } from 'ngx-cookie-service';
import { ChatMessage, ChatService } from '../../services/chat.service';

@Component({
  selector: 'app-message-box',
  imports: [FontAwesomeModule],
  templateUrl: './message-box.component.html',
  styleUrl: './message-box.css',
})
export class MessageBoxComponent {
  @ViewChild('message') messageTextarea!: ElementRef<HTMLTextAreaElement>;
  faPaperPlane = faPaperPlane;
  private cookieService = inject(CookieService);

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private chatService: ChatService
  ) {}

  private getAccessToken() {
    return this.cookieService.get('access_token');
  }

  sendMessage(): void {
    const userMessage = this.messageTextarea.nativeElement.value.trim();
    if (!userMessage) return; // jangan proses jika pesan kosong

    // Ambil topicId dari child route, jika ada
    let topicId: string | null = null;
    if (this.route.snapshot.firstChild) {
      topicId = this.route.snapshot.firstChild.paramMap.get('uuid');
    }

    // Buat objek pesan untuk user
    const newUserMessage: ChatMessage = {
      _id: new Date().getTime().toString(), // ID sementara
      topic: topicId || '',
      user: 'user-id', // sesuaikan dengan identitas user
      sender: 'user',
      message: userMessage,
      createdAt: new Date().toISOString(),
    };

    // Tambahkan pesan ke shared service agar ConversationComponent langsung update
    this.chatService.addMessage(newUserMessage);

    const payload = {
      topicId: topicId || '', // jika tidak ada, kirim string kosong
      userMessage: userMessage,
    };

    this.http
      .post<any>('http://localhost:3000/chatbot', payload, {
        headers: {
          Authorization: `Bearer ${this.getAccessToken()}`,
        },
      })
      .subscribe({
        next: (response) => {
          // Misal responsenya mengembalikan properti topicId
          const newTopicId = response.topicId || response.data?.topicId;
          // Jika awalnya tidak ada topicId, navigasi ke URL chat dengan topicId baru
          if (!topicId && newTopicId) {
            this.router.navigate(['/chat', newTopicId]);
          }

          this.chatService.fetchConversations().subscribe();
          // Opsional: reset textarea setelah berhasil mengirim pesan
          this.messageTextarea.nativeElement.value = '';
        },
        error: (error) => {
          console.error('Error sending message:', error);
        },
      });
  }

  resizeTextarea(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    // Reset tinggi ke "auto" agar scrollHeight bisa dihitung ulang
    textarea.style.height = 'auto';
    let height = textarea.scrollHeight + 2;
    if (height > 200) {
      height = 200;
    }
    textarea.style.height = height + 'px';
  }
}
