import * as Sentry from "@sentry/react";

function BuggyComponent() {
    // 렌더링 중 에러 발생!
    throw new Error("🔥 렌더링 중에 발생한 에러입니다!");
}

function App() {
    return (
        // <Sentry.ErrorBoundary fallback={<p>문제가 발생했어요! 🧯</p>} showDialog>
        //     <div>
        //         <h1>앱 메인 화면</h1>
        //         <BuggyComponent />
        //     </div>
        // </Sentry.ErrorBoundary>
            <p>Hello</p>
    );
}

export default App;
