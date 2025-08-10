import { v4 as uuidv4 } from 'uuid'; 
import { MemberId } from "./MemberId";
import {Member as PrismaMember} from "@prisma/client"

export interface IMember {
    id : MemberId;
    loginId : string;
    nickname : string;
    password : string;

}

export class Member implements IMember {
    
    private constructor(
        public readonly id : MemberId, 
        public readonly loginId : string, 
        public nickname : string, 
        private password_hashed: string
    ) {}

    public static create(props: {
        loginId: string;
        nickname:string;
        password:string;
    }): Member {
        //TODO: memberId 파일에서 처리
        const memberId = MemberId(uuidv4());

        //TODO: 해싱처리
        const hashedPassword = props.password;

        return new Member(
            memberId,
            props.loginId,
            props.nickname,
            hashedPassword
        );
    }

    public get password(): string {
        // 보안을 위해 실제 해시값을 반환하는 대신 경고 메시지를 반환할 수도 있습니다.
        // return "Cannot access password directly";
        return this.password_hashed;
    }

    public static fromPersistence(prismaMember : PrismaMember) : Member {
        const memberId = MemberId(prismaMember.id);
        const loginId = prismaMember.loginId;
        const nickname = prismaMember.nickname;
        const hashedPassword = prismaMember.password;

        return new Member(
            memberId,
            loginId,
            nickname,
            hashedPassword
        )

    }
}