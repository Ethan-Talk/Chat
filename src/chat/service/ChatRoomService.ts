import { IMemberRepository } from "@/member/domain/IMemberRepository";
import { ChatRoom } from "../domain/ChatRoom";
import { IChatRoomRepository } from "../domain/IChatRoomRepository";
import { ChatRoomCreateRequestDTO, ChatRoomDto } from "../web/dto/ChatRoom.dto";
import { Member } from "@/member/domain/Member";
import { MemberId } from "@/member/domain/MemberId";
import { toChatRoomDto } from "../web/Mapper/ChatRoom.mapper";

export class ChatRoomService {
  constructor(
    private readonly chatRoomRepository: IChatRoomRepository,
    private readonly memberRepository: IMemberRepository
  ) {}

  public async createChatRoom(
    creatorId: MemberId,
    props: ChatRoomCreateRequestDTO
  ): Promise<ChatRoomDto> {
    //이미 채팅방이 존재하는지 확인...? 근데 어떻게? 같은 채팅방의 기준이 있나?

    const allMemberIds = [
      creatorId,
      ...props.memberIds.map((id) => MemberId(id)),
    ];

    //이런 식의 검증이 효과적,효율적인 방법일까?
    const members = await this.memberRepository.findManyByIds(allMemberIds);
    if (members.length !== allMemberIds.length) {
      throw new Error("존재하지 않는 멤버가 포함되어 있습니다.");
    }

    const chatRoom = ChatRoom.create({
      name: props.name,
      type: props.type,
    });

    const createdRoom = await this.chatRoomRepository.create(
      chatRoom,
      allMemberIds
    );

    //DTO 변환해서 마무리
    return toChatRoomDto(createdRoom);
  }
}
