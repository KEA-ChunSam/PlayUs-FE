import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import styles from './DiaryList.module.css';
import dummyDiaries from '../../components/DummyData/dummyDiaries';

const DiaryList = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const page = parseInt(searchParams.get("page")) || 1;
    const [diaries, setDiaries] = useState([]);
    const PER_PAGE = 6;

    useEffect(() => {
        setDiaries(dummyDiaries);
    }, []);

    const handlePageChange = (_, value) => {
        setSearchParams({ page: value });
    };

    const pagedDiaries = diaries.slice((page - 1) * PER_PAGE, page * PER_PAGE);

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>나의 직관일지</h2>
            {pagedDiaries.map((entry) => (
                <div key={entry.id} className={styles.entry}>
                    {entry.image && (
                        <img src={entry.image} alt="thumbnail" className={styles.thumbnail} />
                    )}
                    <div className={styles.entryContent}>
                        <span className={styles.entryTitle}>{entry.title}</span>
                        <span className={styles.entryDate}>{entry.date}</span>
                        {entry.teamLogo && <img src={entry.teamLogo} alt="logo" className={styles.teamLogo} />}
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
                        },
                        '& .Mui-selected': {
                            backgroundColor: '#784af4',
                            color: '#784af4',
                            borderColor: '#784af4',
                        },
                        '& .MuiPaginationItem-ellipsis': {
                            border: 'none',
                            color: '#784af4',
                            backgroundColor: '#784af4',
                        },
                    }}
                />
            </div>
        </div>
    );
};
export default DiaryList;