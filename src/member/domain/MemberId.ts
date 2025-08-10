import { DomainError } from "@/common/domain/DomainError";

export type MemberId = string & { readonly __brand: "MemberId" };


export function MemberId(value: string): MemberId {
  // UUID v4 간단 검증
  const uuidV4Regex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (!uuidV4Regex.test(value)) {
    throw new DomainError(
      "MEMBER_ID_INVALID",
      "MemberId 형식이 유효하지 않습니다."
    );
  }

  return value as MemberId;
}


/**
 * Brand는 표식임. MemberId라는 식 작성
 */