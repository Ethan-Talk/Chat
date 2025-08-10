import { IMemberRepository } from "@/member/domain/IMemberRepository";
import { PrismaClient, Member as PrismaMember } from "@prisma/client";
import { MemberId } from "../domain/MemberId";
import { Member } from "../domain/Member";

export class PrismaMemberRepository implements IMemberRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(member: Member): Promise<Member> {
    const prismaMember = await this.prisma.member.upsert({
      where: { id: member.id }, // 이 id로 데이터를 찾아서
      update: {
        // 만약 데이터가 있다면, 이 내용으로 수정하고
        nickname: member.nickname,
      },
      create: {
        // 만약 데이터가 없다면, 이 내용으로 새로 만든다
        id: member.id,
        loginId: member.loginId,
        nickname: member.nickname,
        password: member.password, // Member 클래스의 get password()가 호출돼요
      },
    });

    return Member.fromPersistence(prismaMember);
  }

  async findById(id: MemberId): Promise<Member | null> {
    const prismaMember = await this.prisma.member.findUnique({
      where: { id: id },
    });

    if (!prismaMember) {
      return null;
    }

    return Member.fromPersistence(prismaMember);
  }

  async findByLoginId(loginId: string) : Promise<Member | null> {
    const prismaMember = await this.prisma.member.findUnique({
        where: { loginId: loginId},
    });

    if (!prismaMember) {
        return null;
    }

    return Member.fromPersistence(prismaMember);
  }

  async deleteById(id : MemberId) : Promise<void> {
    await this.prisma.member.delete({
        where: {id: id},
    });
  }
}
