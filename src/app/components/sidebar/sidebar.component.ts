import { Component, OnInit } from '@angular/core';
import {
  faChevronLeft,
  faPlus,
  faMessage,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ChatService, Conversation } from '../../services/chat.service';

@Component({
  selector: 'app-sidebar',
  imports: [FontAwesomeModule],
  template: `
    <nav id="sidebar" [class.hidden]="isSidebarHidden">
      <div class="sidebar-controls">
        <button class="new-chat" (click)="newChatOnClick()">
          <fa-icon [icon]="faPlus" style="margin-right: 13px;"></fa-icon> New
          Chat
        </button>
        <button class="hide-sidebar" (click)="toggleSidebar()">
          <fa-icon [icon]="faChevronLeft"></fa-icon>
        </button>
      </div>
      <ul class="conversations">
        @for (group of groupedConversations; track $index) {
        <ng-container>
          <li class="grouping">{{ group.groupName }}</li>
          @for (conversation of group.items; track $index) {
          <li>
            <div class="fade"></div>
            <button (click)="topicOnClick(conversation._id)">
              <fa-icon [icon]="faMessage" style="margin-right: 13px;"></fa-icon>
              {{ conversation.title }}
            </button>
            <div class="edit-buttons">
              <button>E</button>
              <button (click)="onDelete(conversation._id)">X</button>
            </div>
          </li>

          }
        </ng-container>

        }
      </ul>
      <div class="user-menu">
        <button>
          <i class="user-icon">u</i>
          alarisyi
          <i class="dots"></i>
        </button>
      </div>
    </nav>
  `,
  styles: `
  #sidebar{
    position: relative;
    left: 0;
    background: #202123;
    width:260px;
    height:100%;
    padding: 8px;
    box-sizing:border-box;
    display:flex;
    flex-direction:column;
    gap:8px;
    font-size:1em;
    font-family:sans-serif;
    transition: left 0.2s ease-in-out;
  }

.sidebar-controls button {
    padding: 12px 13px 12px 13px;
}

  .sidebar-controls{
    display:flex;
    gap:10px;
  }

#sidebar.hidden {
    left: -260px;
    margin-right: -260px;
}

#sidebar.hidden .hide-sidebar {
    left: 60px;
    transform: rotate(180deg);
    padding: 15px 13px 11px 13px;
}


  .hide-sidebar {
    position: relative;
    top: 0;
    transition: left 0.2s ease-in-out;
}

  button{
    display:block;
    background:inherit;
    border:1px solid #4d4d4f;
    border-radius: 8px;
    color: #fff;
    padding: 12px;
    box-sizing: border-box;
    text-align:left;
  }

  button:hover{
    background: #2b2c2f;
    cursor:pointer;
  }

  .new-chat{
    flex:1;
  }

  .conversations,
  .conversations li{
    list-style:none;
    list-style-type:none;
    padding:0;
    margin:0;
  }

  .conversations li.active > button{
    background:#343541;
  }

  .conversations{
    height:85%;
    overflow-y:auto;
  }

  .conversations li{
    position:relative;
  }

  .conversations li > button{
    width:100%;
    border:none;
    white-space: nowrap;
    overflow:hidden;
  }

  .conversations >li:hover .edit-buttons{
    display:flex;
  }

  .conversations li.active .fade {
    background: liniear-gradient(90deg, rgba(52,53,65,0) 0%,rgba(52,53,65,1) 50%,rgba(43,44,47,1) 100%)
  }

  .conversations li:hover .fade {
    background: liniear-gradient(90deg, rgba(43,44,47,0) 0%,rgba(43,44,47,1) 50%,rgba(43,44,47,1) 100%)
  }

  .edit-buttons{
    display:none;
    position:absolute;
    right:8px;
    top:0;
  }

  .edit-buttons button{
    border:none;
    padding:0;
    margin:13px 5px 13px 5px;
  }

  .fade{
    position:absolute;
    right:0;
    top:0;
    width:40px;
    height:100%;
    border-radius:5px;
    background: transparent;
    background: linear-gradient(90deg, rgba(32,33,35,1) 0%, rgba(32,33,35,0) 50%, rgba(32,33,35,0) 100%);
  }
  
  .conversations li.grouping{
    color:#8e8ea0;
    font-size:0.7em;
    font-weight:bold;
    padding-left:13px;
    margin-top:15px;
    margin-bottom:15px;
  }

  i.user-icon{
    padding:8px;
    color:#fff;
    background:grey;
    display:inline-block;
    text-align:center;
    width:15px;
    border-radius:3px;
    margin-right:7px;
  }

  .user-menu button{
    width:100%;
    border:none;
  }

  .user-menu{
    border-top: 1px solid #4d4d4f
  }

  /* Untuk Chrome, Edge, Safari */
::-webkit-scrollbar {
  width: 8px; /* Lebar scrollbar */
}

::-webkit-scrollbar-track {
  background: transparent; /* Track transparan */
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2); /* Thumb putih semi-transparan */
  border-radius: 10px;
}

/* Saat di-hover */
::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.4);
}

/* Untuk Firefox */
* {
  scrollbar-width: thin; /* Scrollbar tipis */
  scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
}


  `,
})
export class SidebarComponent implements OnInit {
  faChevronLeft = faChevronLeft;
  faPlus = faPlus;
  faMessage = faMessage;
  groupedConversations: any[] = [];
  isSidebarHidden = false;
  private convoSub!: Subscription;

  constructor(private router: Router, private chatService: ChatService) {}

  ngOnInit(): void {
    // Subscribe ke observable percakapan agar Sidebar ter-update secara dinamis
    this.convoSub = this.chatService.conversations$.subscribe(
      (convos: Conversation[]) => {
        this.groupedConversations = this.groupConversations(convos);
      }
    );
    // Panggil fetchConversations() saat inisialisasi
    this.chatService.fetchConversations().subscribe();
    if (window.innerWidth < 768) {
      this.isSidebarHidden = true;
    }
  }

  ngOnDestroy(): void {
    if (this.convoSub) {
      this.convoSub.unsubscribe();
    }
  }

  newChatOnClick() {
    // Navigasi ke root untuk membuat percakapan baru
    this.router.navigate(['/']);
  }

  onDelete(topicId: string) {
    // Panggil API delete melalui ChatService
    this.chatService.deleteConversation(topicId).subscribe({
      next: () => {
        console.log('Conversation deleted successfully');
        // Sidebar akan ter-update secara otomatis karena BehaviorSubject diperbarui
      },
      error: (err) => {
        console.error('Error deleting conversation:', err);
      },
    });
  }

  private groupConversations(conversations: Conversation[]): any[] {
    const groups = new Map<string, Conversation[]>();

    conversations.forEach((convo) => {
      const groupName = this.getGroupName(convo.createdAt);
      if (!groups.has(groupName)) {
        groups.set(groupName, []);
      }
      groups.get(groupName)?.push(convo);
    });

    return Array.from(groups.entries()).map(([groupName, items]) => ({
      groupName,
      items,
    }));
  }

  private getGroupName(dateString: string): string {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const timeDiff = today.getTime() - date.getTime();
    const diffDays = Math.floor(timeDiff / (1000 * 3600 * 24));

    if (this.isSameDate(date, today)) return 'Today';
    if (this.isSameDate(date, yesterday)) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays} days ago`;

    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }

  private isSameDate(d1: Date, d2: Date): boolean {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  }

  toggleSidebar(): void {
    this.isSidebarHidden = !this.isSidebarHidden;
  }

  topicOnClick(id: string) {
    this.router.navigate([`/chat/${id}`]);
  }
}
