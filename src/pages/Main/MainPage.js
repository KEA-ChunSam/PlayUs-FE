// 최초 사용자 진입 시 메인 페이지. 관심팀 추가 / 관심팀 일정 / 커뮤니티 인기 포스트 / 뉴스 순.
import './MainPage.css';
export default function MainPage() {
    return (
        <div className="main-page">
            <section className="schedule-section">
                <h2>NC 다이노스</h2>
                <div className="today-game">
                    <span>03.13(화)</span>
                    <span>LG vs 두산 10 : 5</span>
                </div>
            </section>

            <section className="popular-posts-section">
                <h2>인기 포스트</h2>
                <ul>
                    <li>게시물 1</li>
                    <li>게시물 2</li>
                    <li>게시물 3</li>
                </ul>
            </section>

            <section className="news-section">
                <h2>우리팀 소식</h2>
                <div className="news-item">관련 기사 또는 카드뷰</div>
            </section>
        </div>
    );
}