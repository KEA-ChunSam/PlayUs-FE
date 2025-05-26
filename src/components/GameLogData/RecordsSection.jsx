// AI 시뮬레이터 양팀 투타 기록 컴포넌트
import React from "react";
import styles from './RecordsSection.module.css';
import RecordsAccordion from "./RecordsAccordion";

function RecordsSection({homeBatters, awayBatters}) {
    const [showHanwhaHit, setShowHanwhaHit] = React.useState(false);
    const [showKtHit, setShowKtHit] = React.useState(false);
    const [showHanhwaPitch, setShowHanhwaPitch] = React.useState(false);
    const [showKtPitch, setShowKtPitch] = React.useState(false);
    return (
        <div className={styles.contents}>
            <RecordsAccordion
                title="타격 기록(한화)"
                isOpen={showHanwhaHit}
                toggleOpen={() => setShowHanwhaHit(v => !v)}
            >
                <table className={styles.recordTable}>
                    <thead>
                    <tr>
                        <th>타순</th>
                        <th>이름</th>
                        <th>Pos.</th>
                        <th>PA</th>
                        <th>AB</th>
                        <th>R</th>
                        <th>H</th>
                        <th>HR</th>
                        <th>RBI</th>
                    </tr>
                    </thead>
                    <tbody>
                    {homeBatters.map((batter, idx) => (
                        <tr key={batter.id}>
                            <td>{Number(batter.id) > 9 ? '대타' : idx + 1}</td>
                            <td>{batter.name}</td>
                            <td>{batter.position}</td>
                            <td>4</td>
                            <td>4</td>
                            <td>{idx % 3 === 0 ? 1 : 0}</td>
                            <td>{idx % 4 === 0 ? 2 : 1}</td>
                            <td>{idx === 3 ? 1 : 0}</td>
                            <td>{idx % 5 === 0 ? 2 : 0}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </RecordsAccordion>
            <RecordsAccordion
                title="타격 기록(KT)"
                isOpen={showKtHit}
                toggleOpen={() => setShowKtHit(v => !v)}
            >
                <table className={styles.recordTable}>
                    <thead>
                    <tr>
                        <th>타순</th>
                        <th>이름</th>
                        <th>Pos.</th>
                        <th>PA</th>
                        <th>AB</th>
                        <th>R</th>
                        <th>H</th>
                        <th>HR</th>
                        <th>RBI</th>
                    </tr>
                    </thead>
                    <tbody>
                    {awayBatters.map((batter, idx) => (
                        <tr key={batter.id}>
                            <td>{Number(batter.id) > 9 ? '대타' : idx + 1}</td>
                            <td>{batter.name}</td>
                            <td>{batter.position}</td>
                            <td>4</td>
                            <td>4</td>
                            <td>{idx % 2 === 0 ? 1 : 0}</td>
                            <td>{idx % 3 === 0 ? 2 : 0}</td>
                            <td>{idx === 2 ? 1 : 0}</td>
                            <td>{idx % 4 === 1 ? 1 : 0}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </RecordsAccordion>
            <RecordsAccordion
                title="투수 기록(한화)"
                isOpen={showHanhwaPitch}
                toggleOpen={() => setShowHanhwaPitch(v => !v)}
            >
                <table className={styles.recordTable}>
                    <thead>
                    <tr>
                        <th>이름</th>
                        <th>IP</th>
                        <th>H</th>
                        <th>R</th>
                        <th>ER</th>
                        <th>BB</th>
                        <th>SO</th>
                        <th>HR</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <td>류현진</td>
                        <td>6.0</td>
                        <td>5</td>
                        <td>2</td>
                        <td>2</td>
                        <td>1</td>
                        <td>7</td>
                        <td>1</td>
                    </tr>
                    </tbody>
                </table>
            </RecordsAccordion>
            <RecordsAccordion
                title="투수 기록(KT)"
                isOpen={showKtPitch}
                toggleOpen={() => setShowKtPitch(v => !v)}
            >
                <table className={styles.recordTable}>
                    <thead>
                    <tr>
                        <th>이름</th>
                        <th>IP</th>
                        <th>H</th>
                        <th>R</th>
                        <th>ER</th>
                        <th>BB</th>
                        <th>SO</th>
                        <th>HR</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <td>쿠에바스</td>
                        <td>5.0</td>
                        <td>7</td>
                        <td>4</td>
                        <td>4</td>
                        <td>2</td>
                        <td>4</td>
                        <td>1</td>
                    </tr>
                    </tbody>
                </table>
            </RecordsAccordion>

        </div>
    );
}

export default RecordsSection;