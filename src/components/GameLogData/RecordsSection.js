// AI 시뮬레이터 양팀 투타 기록 컴포넌트
import React from "react";
import styles from './RecordsSection.module.css';

function RecordsSection({ homeBatters, awayBatters }) {
    const [showHanwhaHit, setShowHanwhaHit] = React.useState(false);
    const [showKtHit, setShowKtHit] = React.useState(false);
    const [showHanwhaPitch, setShowHanwhaPitch] = React.useState(false);
    const [showKtPitch, setShowKtPitch] = React.useState(false);
    return (
        <div className={styles.contents}>
            <div
                className={`${styles.accordionBlock} ${showHanwhaHit ? styles.accordionOpen : ''}`}
                onClick={() => setShowHanwhaHit(v => !v)}
                role="button"
                aria-expanded={showHanwhaHit}
                tabIndex={0}
            >
                <div className={styles.recordToggle}>
                    타격 기록(한화)
                </div>
                <div
                    className={styles.accordionContent}
                    style={{ maxHeight: showHanwhaHit ? '800px' : '0px', overflow: 'hidden', transition: 'max-height 0.4s ease' }}
                >
                    <table className={styles.recordTable}>
                        <thead>
                        <tr><th>타순</th><th>이름</th><th>Pos.</th><th>PA</th><th>AB</th><th>R</th><th>H</th><th>HR</th><th>RBI</th></tr>
                        </thead>
                        <tbody>
                          {homeBatters.map((batter, idx) => (
                            <tr key={batter.id}>
                              <td>{Number(batter.id) > 9 ? '대타' : idx + 1}</td>
                              <td>{batter.name}</td>
                              <td>{batter.position}</td>
                              <td>4</td><td>4</td><td>{idx % 3 === 0 ? 1 : 0}</td><td>{idx % 4 === 0 ? 2 : 1}</td><td>{idx === 3 ? 1 : 0}</td><td>{idx % 5 === 0 ? 2 : 0}</td>
                            </tr>
                          ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div
                className={`${styles.accordionBlock} ${showKtHit ? styles.accordionOpen : ''}`}
                onClick={() => setShowKtHit(v => !v)}
                role="button"
                aria-expanded={showKtHit}
                tabIndex={0}
            >
                <div className={styles.recordToggle}>
                    타격 기록(KT)
                </div>
                <div
                    className={styles.accordionContent}
                    style={{ maxHeight: showKtHit ? '800px' : '0px', overflow: 'hidden', transition: 'max-height 0.4s ease' }}
                >
                    <table className={styles.recordTable}>
                        <thead>
                        <tr><th>타순</th><th>이름</th><th>Pos.</th><th>PA</th><th>AB</th><th>R</th><th>H</th><th>HR</th><th>RBI</th></tr>
                        </thead>
                        <tbody>
                          {awayBatters.map((batter, idx) => (
                            <tr key={batter.id}>
                              <td>{Number(batter.id) > 9 ? '대타' : idx + 1}</td>
                              <td>{batter.name}</td>
                              <td>{batter.position}</td>
                              <td>4</td><td>4</td><td>{idx % 2 === 0 ? 1 : 0}</td><td>{idx % 3 === 0 ? 2 : 0}</td><td>{idx === 2 ? 1 : 0}</td><td>{idx % 4 === 1 ? 1 : 0}</td>
                            </tr>
                          ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div
                className={`${styles.accordionBlock} ${showHanwhaPitch ? styles.accordionOpen : ''}`}
                onClick={() => setShowHanwhaPitch(v => !v)}
                role="button"
                aria-expanded={showHanwhaPitch}
                tabIndex={0}
            >
                <div className={styles.recordToggle}>
                    투수 기록(한화)
                </div>
                <div
                    className={styles.accordionContent}
                    style={{ maxHeight: showHanwhaPitch ? '800px' : '0px', overflow: 'hidden', transition: 'max-height 0.4s ease' }}
                >
                    <table className={styles.recordTable}>
                        <thead>
                        <tr><th>이름</th><th>IP</th><th>H</th><th>R</th><th>ER</th><th>BB</th><th>SO</th><th>HR</th></tr>
                        </thead>
                        <tbody>
                        <tr><td>류현진</td><td>6.0</td><td>5</td><td>2</td><td>2</td><td>1</td><td>7</td><td>1</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div
                className={`${styles.accordionBlock} ${showKtPitch ? styles.accordionOpen : ''}`}
                onClick={() => setShowKtPitch(v => !v)}
                role="button"
                aria-expanded={showKtPitch}
                tabIndex={0}
            >
                <div className={styles.recordToggle}>
                    투수 기록(KT)
                </div>
                <div
                    className={styles.accordionContent}
                    style={{ maxHeight: showKtPitch ? '800px' : '0px', overflow: 'hidden', transition: 'max-height 0.4s ease' }}
                >
                    <table className={styles.recordTable}>
                        <thead>
                        <tr><th>이름</th><th>IP</th><th>H</th><th>R</th><th>ER</th><th>BB</th><th>SO</th><th>HR</th></tr>
                        </thead>
                        <tbody>
                        <tr><td>쿠에바스</td><td>5.0</td><td>7</td><td>4</td><td>4</td><td>2</td><td>4</td><td>1</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
export default RecordsSection;