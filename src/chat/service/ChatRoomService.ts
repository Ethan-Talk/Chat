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
  //자신의 채팅방 조회에만 사용됨으로 멤버가 유효한지에 대한 것은 판단하지 않겠음
  public async findChatRoomsByMemberId(
    memberId: MemberId
  ): Promise<ChatRoomDto[]> {
    const chatRooms = await this.chatRoomRepository.findByAllByMemberId(
      memberId
    );

    return chatRooms.map(toChatRoomDto);
  }
}
