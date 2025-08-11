import { IMemberRepository } from "@/member/domain/IMemberRepository";
import { Member } from "../domain/Member";
import { MemberId } from "../domain/MemberId";
import * as bcrypt from "bcrypt";
import { MemberDto, MemberSignInDTO, MemberSignUpDto } from "@/member/web/dto";

export class MemberService {
  constructor(private readonly memberRepository: IMemberRepository) {}

  //회원가입
  public async signup(props: MemberSignUpDto): Promise<MemberDto> {
    //존재하는 멤버인지 확인
    const existingMember = await this.memberRepository.findByLoginId(
      props.loginId
    );
    if (existingMember) {
      throw new Error("이미 존재하는 아이디입니다");
    }
    //비밀번호 해싱 이건 재사용해야 할듯.

    const member = await Member.create({
      loginId: props.loginId,
      nickname: props.nickname,
      password: props.password,
    });

    //Repository에 저장
    await this.memberRepository.save(member);

    return MemberDto.fromDomain(member);
  }

  public async signin(props: MemberSignInDTO): Promise<MemberDto> {
    const existingMember = await this.memberRepository.findByLoginId(
      props.loginId
    );
    if (!existingMember) {
      throw new Error("존재하지 않는 아이디입니다");
    }

    const password = props.password;
    const hashedPassword = existingMember.password;

    const isPasswordMatch = await bcrypt.compare(password, hashedPassword);

    //해시된 비밀번호들 비교
    if (!isPasswordMatch) {
      throw new Error("비밀번호가 일치하지 않습니다.");
    }

    return MemberDto.fromDomain(existingMember);
  }

  public async getMemberProfile(memberId: MemberId): Promise<MemberDto | null> {
    const member = await this.memberRepository.findById(memberId);

    if (!member) {
      throw new Error("Member not found");
    }

    return MemberDto.fromDomain(member);
  }
}
