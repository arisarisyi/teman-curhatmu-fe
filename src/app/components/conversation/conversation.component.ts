import {
  Component,
  inject,
  OnDestroy,
  OnInit,
  signal,
  WritableSignal,
  effect,
} from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faFaceSmile, faUserTie } from '@fortawesome/free-solid-svg-icons';
import { ChatMessage, ChatService } from '../../services/chat.service';
import { HttpClient } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { io, Socket } from 'socket.io-client';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { environment } from '../../../environments/environment';

interface ApiResponse {
  data: {
    data: ChatMessage[];
    meta: {
      page: number;
      limit: number;
      totalCount: number;
      totalPages: number;
    };
  };
  statusCode: number;
  status: boolean;
  message: string;
}

@Component({
  selector: 'app-conversation',
  imports: [FontAwesomeModule],
  templateUrl: './conversation.component.html',
  styleUrl: './conversation.css',
})
export class ConversationComponent implements OnInit, OnDestroy {
  private http = inject(HttpClient);
  private cookieService = inject(CookieService);
  private newMessageSub!: Subscription;

  // Signals
  messages: WritableSignal<ChatMessage[]> = signal([]);
  isLoading: WritableSignal<boolean> = signal(false);
  currentPage = signal(1);
  hasMore = signal(true);
  baseUrl = environment.baseUrl;
  // WebSocket
  private socket!: Socket;

  uuid: string | null = null;
  // Icons
  faFaceSmile = faFaceSmile;
  faUserTie = faUserTie;

  constructor(private route: ActivatedRoute, private chatService: ChatService) {
    effect(() => {
      if (this.messages().length > 0) {
        this.scrollToBottom();
      }
    });
  }

  ngOnInit() {
    // Langganan perubahan parameter route
    this.route.paramMap.subscribe((params) => {
      const newUuid = params.get('uuid');
      if (newUuid !== this.uuid) {
        // Jika ada perubahan uuid, lakukan reset dan inisialisasi ulang
        this.uuid = newUuid;

        // Jika sudah ada koneksi websocket, disconnect terlebih dahulu
        if (this.socket) {
          this.socket.disconnect();
        }

        // Reset state untuk pesan dan pagination
        this.messages.set([]);
        this.currentPage.set(1);
        this.hasMore.set(true);

        // Inisialisasi ulang websocket dan muat pesan baru
        this.initWebSocket();
        this.loadMessages();
      }
    });

    // Subscribe untuk menerima pesan baru dari ChatService
    this.newMessageSub = this.chatService.newMessage$.subscribe((message) => {
      console.log(message);

      if (message) {
        const exists = this.messages().some(
          (m) =>
            m._id === message._id ||
            (m.sender === message.sender && m.message === message.message)
        );
        if (!exists) {
          this.messages.update((old) => [...old, message]);
          this.scrollToBottom();
        }
      }
    });
  }

  private getAccessToken() {
    return this.cookieService.get('access_token');
  }

  private loadMessages() {
    if (!this.hasMore() || this.isLoading()) return;

    this.isLoading.set(true);

    const params = {
      page: this.currentPage(),
      limit: 10,
      sortBy: 'createdAt:desc',
    };

    this.http
      .get<ApiResponse>(
        `${this.baseUrl}/chatbot/chat-history?topicId=${this.uuid}`,
        {
          params,
          headers: {
            Authorization: `Bearer ${this.getAccessToken()}`,
          },
        }
      )
      .subscribe({
        next: (response) => {
          console.log(response);
          const newMessages = response.data.data; // Array pesan dari API
          console.log('Messages from API:', newMessages);

          // Filter pesan baru yang belum ada (cek berdasarkan sender dan message)
          const dedupedMessages = newMessages.filter((apiMsg) => {
            return !this.messages().some(
              (existingMsg) =>
                existingMsg.sender === apiMsg.sender &&
                existingMsg.message === apiMsg.message
            );
          });

          // Gabungkan pesan baru yang sudah didedup dengan pesan yang sudah ada
          this.messages.update((old) => [...dedupedMessages, ...old]);

          this.hasMore.set(
            response.data.meta.page < response.data.meta.totalPages
          );
          this.isLoading.set(false);
          this.currentPage.update((p) => p + 1);
        },

        error: () => this.isLoading.set(false),
      });
  }

  private initWebSocket() {
    const token = this.getAccessToken();

    // Sesuaikan dengan namespace di NestJS
    this.socket = io(`${this.baseUrl}/chat`, {
      query: {
        topicId: this.uuid,
        token: token,
      },
      transports: ['websocket'], // Optional: force WebSocket transport
      auth: {
        token: token, // Alternatif jika ingin menggunakan auth
      },
    });

    // Event listeners
    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    this.socket.on('chatMessage', (message: ChatMessage) => {
      // this.messages.update((old) => [...old, message]);
      this.displayAssistantMessageWithTyping(message);
    });

    this.socket.on('connect_error', (err) => {
      console.error('Connection error:', err.message);
    });
  }

  private displayAssistantMessageWithTyping(message: ChatMessage) {
    const newMessage: ChatMessage = { ...message, message: '' };
    this.messages.update((old) => [...old, newMessage]);

    let index = 0;
    const fullText = message.message;
    const typingSpeed = 12; // ms per karakter

    const interval = setInterval(() => {
      if (index < fullText.length) {
        newMessage.message += fullText.charAt(index);
        index++;
      } else {
        clearInterval(interval);
      }
    }, typingSpeed);
  }

  private scrollToBottom() {
    setTimeout(() => {
      const container = document.querySelector('.conversation-view');
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }, 0);
  }

  onScroll(event: Event) {
    const container = event.target as HTMLElement;
    if (container.scrollTop < 100 && !this.isLoading()) {
      this.loadMessages();
    }
  }

  ngOnDestroy() {
    if (this.socket) {
      this.socket.disconnect();
    }
    if (this.newMessageSub) {
      this.newMessageSub.unsubscribe();
    }
  }
}
