import * as Sentry from "@sentry/react";
import { useEffect } from "react";

function TestErrorComponent() {
    useEffect(() => {
        try {
            // 강제로 에러 발생
            throw new Error("🤯 Sentry 테스트용 예외입니다!");
        } catch (error) {
            // Sentry에 예외 수동 전송
            Sentry.captureException(error);
        }
    }, []);

    return <div>Sentry 테스트 중... 콘솔을 확인하세요!</div>;
}

export default TestErrorComponent;
