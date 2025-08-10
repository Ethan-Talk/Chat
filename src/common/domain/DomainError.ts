export class DomainError extends Error {
    readonly code: string;

    constructor(code: string, message: string) {
        super(message);
        this.code = code; 

        this.name = this.constructor.name;//class 이름 문자열열

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}
/**
 * TODO: ServiceCode 타입 작성
 * 파일이름은 class 이름과 동일하게 하기위해 대문자로 시작함.
 * 보통 named export 방식사용
 * 
 */