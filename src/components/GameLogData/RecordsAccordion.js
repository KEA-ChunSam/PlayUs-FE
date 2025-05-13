// AI 시뮬레이션 시 선수 기록을 나타내는 드롭다운 컴포넌트
import styles from './RecordsSection.module.css';

function RecordsAccordion({title, isOpen, toggleOpen, children}) {
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleOpen();
        }
    };

    return (
        <div
            className={`${styles.accordionBlock} ${isOpen ? styles.accordionOpen : ''}`}
            onClick={toggleOpen}
            role="button"
            aria-expanded={isOpen}
            tabIndex={0}
            onKeyDown={handleKeyDown}
        >
            <div className={styles.recordToggle}>{title}</div>
            <div
                className={styles.accordionContent}
                style={{
                    maxHeight: isOpen ? '800px' : '0px',
                    overflow: 'hidden',
                    transition: 'max-height 0.4s ease'
                }}
            >
                {children}
            </div>
        </div>
    );
}

export default RecordsAccordion;