export const formatNotificationDate = (dateString) => {
    if (!dateString) return "";

    try {
        // "2024.01.15 14:30" 형식을 ISO 형식으로 변환
        let isoString = dateString.replace(/\./g, "-").replace(" ", "T");

        // 초가 없는 경우 추가
        if (!isoString.includes(":", isoString.lastIndexOf(":")+1)) {
            isoString += ":00";
        }

        const dateObj = new Date(isoString);
        return dateObj.toLocaleString("ko-KR", {
            year: "numeric",
            month: "numeric",
            day: "numeric",
            hour: "numeric",
            minute: "numeric"
        });
    } catch (error) {
        console.error("날짜 파싱 오류:", error);
        return dateString; // 파싱 실패 시 원본 반환
    }
};