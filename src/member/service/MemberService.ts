import { IMemberRepository } from "@/member/domain/IMemberRepository";
import { Member } from "../domain/Member";
import * as bcrypt from 'bcrypt'; 
import { MemberDto } from "@/member/web/dto";

export class MemberService {
    constructor(private readonly memberRepository: IMemberRepository) {}

    public async signup(props: {
        loginId: string;
        nickname: string;
        password: string;
    }): Promise<MemberDto> {
        //존재하는 멤버인지 확인
        const existingMember = await this.memberRepository.findByLoginId(props.loginId);
        if (existingMember) {
            throw new Error("이미 존재하는 아이디입니다");
        }
        //비밀번호 해싱
        const saltRounds = 10; //암호화 강도
        const hashedPassword = await bcrypt.hash(props.password, saltRounds);


        const member = Member.create({
            loginId: props.loginId,
            nickname: props.nickname,
            password: hashedPassword
        });

        //Repository에 저장
        await this.memberRepository.save(member);

        return MemberDto.fromDomain(member) ;
    }
}