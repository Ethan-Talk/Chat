import { MemberId } from "@/member/domain/MemberId";

export class PresenceService {
  private onlineUsers = new Map<MemberId, string>();

  public addUser(memberId: MemberId, socketId: string): void {
    this.onlineUsers.set(memberId, socketId);
    console.log("Online Users: ", this.onlineUsers.keys());
  }

  public removeUser(memberId: MemberId): void {
    this.onlineUsers.delete(memberId);
    console.log("Online Users:", this.onlineUsers.keys());
  }

  public isUserOnline(memberId: MemberId): boolean {
    return this.onlineUsers.has(memberId);
  }
}
