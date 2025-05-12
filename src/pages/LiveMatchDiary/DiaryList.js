import {useEffect, useState} from 'react';
import {useNavigate, useSearchParams} from 'react-router-dom';
import Pagination from '@mui/material/Pagination';
import styles from './DiaryList.module.css';
import dummyDiaries from '../../components/DummyData/dummyDiaries';
import TabNav from "../../components/TabNav/TabNav";

const DiaryList = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const page = parseInt(searchParams.get("page")) || 1;
    const [diaries, setDiaries] = useState([]);
    const PER_PAGE = 6;

    const navigate = useNavigate();
    const tabLabels = ["나의 직관일지"];

    useEffect(() => {
        setDiaries(dummyDiaries);
    }, []);

    const handlePageChange = (_, value) => {
        setSearchParams({page: value});
    };

    function handleBack() {
        navigate('/profile');
    }

    const pagedDiaries = diaries.slice((page - 1) * PER_PAGE, page * PER_PAGE);

    // Navigate to diary detail page
    const handleClickDiary = (id) => {
        navigate(`/diary/${id}`);
    };

    return (
        <div className={styles.container}>
            {/*<h2 className={styles.title}>나의 직관일지</h2>*/}
            <TabNav tabs={tabLabels} onBack={handleBack}/>
            <div className={styles.entryBox}>
            {pagedDiaries.map((entry) => (
                <div
                    key={entry.id}
                    className={styles.entry}
                    onClick={() => handleClickDiary(entry.id)}
                    style={{cursor: 'pointer'}}
                >
                    {entry.image && (
                        <img src={entry.image} alt="thumbnail" className={styles.thumbnail}/>
                    )}
                    <div className={styles.entryContent}>
                        <span className={styles.entryTitle}>{entry.title}</span>
                        <span className={styles.entryDate}>{entry.date}</span>
                        {entry.teamLogo && <img src={entry.teamLogo} alt="logo" className={styles.teamLogo}/>}
                    </div>
                </div>
            ))}
            <div className={styles.paginationWrapper}>
                <Pagination
                    count={Math.ceil(diaries.length / PER_PAGE)}
                    page={page}
                    onChange={handlePageChange}
                    variant="outlined"
                    shape="rounded"
                    sx={{
                        '& .MuiPaginationItem-root': {
                            color: '#784af4',
                            border: '1px solid #784af4',
                            cursor: 'pointer',
                        },
                        '& .Mui-selected': {
                            backgroundColor: '#784af4',
                            color: '#fff',
                            borderColor: '#784af4',
                        },
                        '& .MuiPaginationItem-ellipsis': {
                            border: 'none',
                            color: '#784af4',
                            backgroundColor: 'transparent',
                        },
                    }}
                />
            </div>
            </div>
        </div>
    );
};
export default DiaryList;