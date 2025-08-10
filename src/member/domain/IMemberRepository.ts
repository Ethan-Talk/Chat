import { IMember } from "@/member/domain/Member";
import {MemberId} from "@/member/domain/MemberId";

export interface IMemberRepository {
    save(member: IMember) : Promise<IMember>;
    findById(id : MemberId) : Promise<IMember | null>;
    findByLoginId(loginId: string) : Promise<IMember | null>;
    deleteById(id: MemberId) : Promise<void>;

}