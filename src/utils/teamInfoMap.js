export const teamInfoMap = [
    {id: 1, teamId: 'NC Dinos', name: 'NC', logo: `${process.env.PUBLIC_URL}/Logo/TeamLogo/emblem_NC.png`},
    {id: 2, teamId: 'Samsung Lions', name: '삼성', logo: `${process.env.PUBLIC_URL}/Logo/TeamLogo/emblem_SS.png`},
    {id: 3, teamId: 'Doosan Bears', name: '두산', logo: `${process.env.PUBLIC_URL}/Logo/TeamLogo/emblem_OB.png`},
    {id: 4, teamId: 'Hanwha Eagles', name: '한화', logo: `${process.env.PUBLIC_URL}/Logo/TeamLogo/emblem_HH.png`},
    {id: 5, teamId: 'Kia Tigers', name: 'KIA', logo: `${process.env.PUBLIC_URL}/Logo/TeamLogo/emblem_HT.png`},
    {id: 6, teamId: 'KT Wiz', name: 'KT', logo: `${process.env.PUBLIC_URL}/Logo/TeamLogo/emblem_KT.png`},
    {id: 7, teamId: 'Lotte Giants', name: '롯데', logo: `${process.env.PUBLIC_URL}/Logo/TeamLogo/emblem_LT.png`},
    {id: 8, teamId: 'LG Twins', name: 'LG', logo: `${process.env.PUBLIC_URL}/Logo/TeamLogo/emblem_LG.png`},
    {id: 9, teamId: 'SSG Landers', name: 'SSG', logo: `${process.env.PUBLIC_URL}/Logo/TeamLogo/emblem_SK.png`},
    {id: 10, teamId: 'Kiwoom Heroes', name: '키움', logo: `${process.env.PUBLIC_URL}/Logo/TeamLogo/emblem_WO.png`},
];

export const teamInfoMapCommunity = [
    {id: 1, teamId: 'NC_DINOS', name: 'NC', logo: `${process.env.PUBLIC_URL}/Logo/TeamLogo/emblem_NC.png`},
    {id: 2, teamId: 'Samsung_LIONS', name: '삼성', logo: `${process.env.PUBLIC_URL}/Logo/TeamLogo/emblem_SS.png`},
    {id: 3, teamId: 'DOOSAN_BEARS', name: '두산', logo: `${process.env.PUBLIC_URL}/Logo/TeamLogo/emblem_OB.png`},
    {id: 4, teamId: 'HANWHA_EAGLES', name: '한화', logo: `${process.env.PUBLIC_URL}/Logo/TeamLogo/emblem_HH.png`},
    {id: 5, teamId: 'KIA_TIGERS', name: 'KIA', logo: `${process.env.PUBLIC_URL}/Logo/TeamLogo/emblem_HT.png`},
    {id: 6, teamId: 'KT_WIZ', name: 'KT', logo: `${process.env.PUBLIC_URL}/Logo/TeamLogo/emblem_KT.png`},
    {id: 7, teamId: 'LOTTE_GIANTS', name: '롯데', logo: `${process.env.PUBLIC_URL}/Logo/TeamLogo/emblem_LT.png`},
    {id: 8, teamId: 'LG_TWINS', name: 'LG', logo: `${process.env.PUBLIC_URL}/Logo/TeamLogo/emblem_LG.png`},
    {id: 9, teamId: 'SSG_LANDERS', name: 'SSG', logo: `${process.env.PUBLIC_URL}/Logo/TeamLogo/emblem_SK.png`},
    {id: 10, teamId: 'KIWOOM_HEROES', name: '키움', logo: `${process.env.PUBLIC_URL}/Logo/TeamLogo/emblem_WO.png`},
];

export const getTeamTagFromKoreanName = (koreanName) => {
    const team = teamInfoMapCommunity.find(t => koreanName.includes(t.name));
    return team ? team.teamId : null;
};

export const teamMap = {
    '한화 이글스': 'HANWHA_EAGLES',
    '기아 타이거즈': 'KIA_TIGERS',
    '두산 베어스': 'DOOSAN_BEARS',
    'LG 트윈스': 'LG_TWINS',
    '롯데 자이언츠': 'LOTTE_GIANTS',
    '삼성 라이온즈': 'SAMSUNG_LIONS',
    'SSG 랜더스': 'SSG_LANDERS',
    'NC 다이노스': 'NC_DINOS',
    '키움 히어로즈': 'KIWOOM_HEROES',
    'KT 위즈': 'KT_WIZ'
};

export const kbo_teams = [
    '한화 이글스', '기아 타이거즈', '두산 베어스', 'LG 트윈스', '롯데 자이언츠',
    '삼성 라이온즈', 'SSG 랜더스', 'NC 다이노스', '키움 히어로즈', 'KT 위즈'
];