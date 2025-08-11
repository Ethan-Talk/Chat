import { Member } from "@/member/domain/Member";
import { MemberId } from "@/member/domain/MemberId";

export interface IMemberRepository {
  save(member: Member): Promise<Member>;
  findById(id: MemberId): Promise<Member | null>;
  findByLoginId(loginId: string): Promise<Member | null>;
  deleteById(id: MemberId): Promise<void>;
}
