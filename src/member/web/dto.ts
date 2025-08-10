import { MemberId } from "@/member/domain/MemberId";
import { Member } from "@/member/domain/Member";
import { IsString, IsNotEmpty } from "class-validator";


export class MemberDto {
    readonly id: MemberId;
    readonly loginId: string;
    readonly nickname : string;

    private constructor(props: {
        id: MemberId;
        loginId: string;
        nickname: string;
    }) {
        this.id = props.id;
        this.loginId = props.loginId;
        this.nickname = props.nickname;
    }

    public static fromDomain(member: Member): MemberDto {
        return new MemberDto( {
            id: member.id,
            loginId: member.loginId,
            nickname : member.nickname
        })
    }
}

export class MemberSignUpDto {
  @IsString()  
  @IsNotEmpty()
  readonly loginId!: string;

  @IsString()  
  @IsNotEmpty()
  readonly nickname!: string;

  @IsString()  
  @IsNotEmpty()
  readonly password!: string;
}