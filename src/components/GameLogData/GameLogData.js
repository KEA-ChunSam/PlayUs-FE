// 임시 AI 시뮬레이션 dummy data
const GameLogData = [
    {
        inning: "1회초",
        logs: [
            {pitcher: "류현진", batter: "박재현", p: "1 (0-0)", result: "좌익수 방면 1루타"},
            {pitcher: "류현진", batter: "위즈덤", p: "5 (3-1)", result: "좌익수 플라이 아웃"},
            {pitcher: "류현진", batter: "나성범", p: "", result: "1루주자 박재현 : 2루 도루"},
            {pitcher: "류현진", batter: "나성범", p: "5 (2-2)", result: "헛스윙 삼진"},
            {pitcher: "류현진", batter: "최형우", p: "5 (2-2)", result: "투수 땅볼 아웃"}
        ]
    },
    {
        inning: "1회말",
        logs: [
            {pitcher: "올러", batter: "황영묵", p: "7 (2-2)", result: "루킹 삼진"},
            {pitcher: "올러", batter: "안치홍", p: "3 (0-2)", result: "낫아웃 삼진"},
            {pitcher: "올러", batter: "플로리엘", p: "6 (2-2)", result: "유격수 플라이 아웃"}
        ]
    },
    {
        inning: "2회초",
        logs: [
            {pitcher: "류현진", batter: "이우성", p: "6 (3-2)", result: "4구"},
            {pitcher: "류현진", batter: "변우혁", p: "2 (1-0)", result: "유격수 직선타 아웃"},
            {pitcher: "류현진", batter: "서건창", p: "2 (1-0)", result: "2루수 병살타 아웃"}
        ]
    },
    {
        inning: "2회말",
        logs: [
            {pitcher: "올러", batter: "노시환", p: "7 (3-2)", result: "낫아웃 삼진"},
            {pitcher: "올러", batter: "채은성", p: "2 (1-0)", result: "유격수 땅볼 아웃"},
            {pitcher: "올러", batter: "김태연", p: "5 (2-2)", result: "3루수 땅볼 아웃"}
        ]
    },
    {
        inning: "3회초",
        logs: [
            {pitcher: "류현진", batter: "박재현", p: "4 (2-1)", result: "3루수 땅볼 아웃"},
            {pitcher: "류현진", batter: "위즈덤", p: "5 (3-2)", result: "헛스윙 삼진"},
            {pitcher: "류현진", batter: "나성범", p: "3 (1-1)", result: "중견수 플라이 아웃"}
        ]
    },
    {
        inning: "3회말",
        logs: [
            {pitcher: "올러", batter: "문현빈", p: "3 (1-1)", result: "중견수 뜬공 아웃"},
            {pitcher: "올러", batter: "김태연", p: "6 (2-2)", result: "우익수 방면 2루타"},
            {pitcher: "올러", batter: "황영묵", p: "2 (1-0)", result: "유격수 땅볼 아웃"}
        ]
    },
    {
        inning: "4회초",
        logs: [
            {pitcher: "류현진", batter: "최형우", p: "4 (2-1)", result: "중견수 방면 2루타"},
            {pitcher: "류현진", batter: "이우성", p: "2 (0-1)", result: "우익수 플라이 아웃"},
            {pitcher: "류현진", batter: "변우혁", p: "3 (1-1)", result: "포수 파울 플라이 아웃"}
        ]
    },
    {
        inning: "4회말",
        logs: [
            {pitcher: "올러", batter: "안치홍", p: "5 (3-2)", result: "헛스윙 삼진"},
            {pitcher: "올러", batter: "플로리엘", p: "4 (1-2)", result: "우익수 플라이 아웃"},
            {pitcher: "올러", batter: "노시환", p: "6 (2-2)", result: "3루수 땅볼 아웃"}
        ]
    },
    {
        inning: "5회초",
        logs: [
            {pitcher: "류현진", batter: "서건창", p: "2 (1-0)", result: "유격수 땅볼 아웃"},
            {pitcher: "류현진", batter: "박재현", p: "3 (1-1)", result: "포수 파울 플라이 아웃"},
            {pitcher: "류현진", batter: "위즈덤", p: "6 (2-2)", result: "루킹 삼진"}
        ]
    },
    {
        inning: "5회말",
        logs: [
            {pitcher: "올러", batter: "채은성", p: "3 (1-1)", result: "중견수 플라이 아웃"},
            {pitcher: "올러", batter: "김태연", p: "5 (2-2)", result: "헛스윙 삼진"},
            {pitcher: "올러", batter: "문현빈", p: "2 (1-0)", result: "2루수 땅볼 아웃"}
        ]
    },
    {
        inning: "6회초",
        logs: [
            {pitcher: "류현진", batter: "나성범", p: "4 (2-1)", result: "중견수 플라이 아웃"},
            {pitcher: "류현진", batter: "최형우", p: "5 (3-2)", result: "우익수 플라이 아웃"},
            {pitcher: "류현진", batter: "이우성", p: "3 (1-1)", result: "1루수 땅볼 아웃"}
        ]
    },
    {
        inning: "6회말",
        logs: [
            {pitcher: "올러", batter: "황영묵", p: "4 (1-2)", result: "헛스윙 삼진"},
            {pitcher: "올러", batter: "안치홍", p: "3 (1-1)", result: "유격수 땅볼 아웃"},
            {pitcher: "올러", batter: "플로리엘", p: "2 (1-0)", result: "1루수 땅볼 아웃"}
        ]
    },
    {
        inning: "7회초",
        logs: [
            {pitcher: "류현진", batter: "변우혁", p: "2 (0-1)", result: "포수 플라이 아웃"},
            {pitcher: "류현진", batter: "서건창", p: "3 (1-1)", result: "중견수 뜬공 아웃"},
            {pitcher: "류현진", batter: "박재현", p: "4 (2-2)", result: "헛스윙 삼진"}
        ]
    },
    {
        inning: "7회말",
        logs: [
            {pitcher: "올러", batter: "노시환", p: "5 (2-2)", result: "루킹 삼진"},
            {pitcher: "올러", batter: "채은성", p: "2 (1-0)", result: "좌익수 플라이 아웃"},
            {pitcher: "올러", batter: "김태연", p: "3 (1-2)", result: "2루수 땅볼 아웃"}
        ]
    },
    {
        inning: "8회초",
        logs: [
            {pitcher: "류현진", batter: "위즈덤", p: "3 (1-1)", result: "좌익수 플라이 아웃"},
            {pitcher: "류현진", batter: "나성범", p: "4 (2-1)", result: "2루타"},
            {pitcher: "류현진", batter: "최형우", p: "5 (3-2)", result: "1타점 적시타"}
        ]
    },
    {
        inning: "8회말",
        logs: [
            {pitcher: "올러", batter: "문현빈", p: "2 (1-0)", result: "중견수 뜬공 아웃"},
            {pitcher: "올러", batter: "황영묵", p: "4 (1-2)", result: "4구"},
            {pitcher: "올러", batter: "안치홍", p: "3 (1-2)", result: "3루수 땅볼 아웃"}
        ]
    },
    {
        inning: "9회초",
        logs: [
            {pitcher: "류현진", batter: "이우성", p: "4 (2-1)", result: "1루수 땅볼 아웃"},
            {pitcher: "류현진", batter: "변우혁", p: "2 (1-0)", result: "2루수 땅볼 아웃"},
            {pitcher: "류현진", batter: "서건창", p: "3 (1-2)", result: "유격수 직선타 아웃"}
        ]
    },
    {
        inning: "9회말",
        logs: [
            {pitcher: "올러", batter: "플로리엘", p: "5 (2-2)", result: "헛스윙 삼진"},
            {pitcher: "올러", batter: "노시환", p: "4 (1-2)", result: "좌익수 플라이 아웃"},
            {pitcher: "올러", batter: "채은성", p: "3 (1-1)", result: "중견수 뜬공 아웃"}
        ]
    }
];

export default GameLogData;