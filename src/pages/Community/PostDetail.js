import React, {useEffect, useRef, useState} from 'react';
import {useLocation, useNavigate, useParams} from 'react-router-dom';
import styles from './PostDetail.module.css';
import CasterbotButton from "../../components/CasterbotButton/CasterbotButton";
import CasterbotModal from "../Chatbot/CasterbotModal";

// 게시글 샘플 데이터 (실제로는 API에서 가져와야 함)
const samplePosts = [
    {id: 1, title: "비와서 경기 종료", time: "18:36", author: "이플립스", content: "오늘 야구 경기 정말 재미있었습니다."},
    {id: 2, title: "좋은 야구", time: "18:20", author: "류현진", content: "좋은 경기였습니다."},
    {id: 3, title: "이번 경기 대박", time: "18:12", author: "닭강정", content: "대박 경기였습니다."},
    {id: 4, title: "비와서 경기 종료", time: "18:36", author: "오미나", content: "비가 와서 경기가 취소되었습니다."},
    {id: 5, title: "시범경기 이대로 끝나면 3위", time: "18:32", author: "김철룡", content: "시범경기 결과입니다."},
    {id: 6, title: "시범경기 이대로 끝나면 3위", time: "18:32", author: "김현호", content: "시범경기 결과입니다."},
];

const PostDetail = () => {
    const {postId} = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [showPostMenu, setShowPostMenu] = useState(false); // 게시글 삼점바
    const [showCommentMenu, setShowCommentMenu] = useState(null); // 댓글 삼점바(댓글 id)
    const [showReplyMenu, setShowReplyMenu] = useState(null); // 대댓글 삼점바(댓글id_대댓글id)
    const [comment, setComment] = useState("");
    const [comments, setComments] = useState([]);
    const [replyTo, setReplyTo] = useState(null); // 대댓글 대상
    const commentInputRef = useRef(null); // 입력창 참조
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editingContent, setEditingContent] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState('');
    const [editedTitle, setEditedTitle] = useState('');
    const [isCommentEditing, setIsCommentEditing] = useState(false);
    const [editedComment, setEditedComment] = useState('');
    const [currentUser, setCurrentUser] = useState(null); // 현재 로그인한 사용자
    const [showMenu, setShowMenu] = useState(false);
    const [showCasterbot, setShowCasterbot] = useState(false);

    const teamLogoMap = {
        hanwha: 'HH',
        lg: 'LG',
        kt: 'KT',
        ssg: 'SK',
        nc: 'NC',
        doosan: 'OB',
        kia: 'HT',
        samsung: 'SS',
        lotte: 'LT',
        kiwoom: 'WO'
    };

    // localStorage의 communityPosts에서만 찾기 (샘플 데이터 제외)
    let saved = [];
    try {
        saved = JSON.parse(localStorage.getItem('communityPosts') ?? '[]');
    } catch (error) {
        console.error('게시물 데이터를 불러오는 중 오류가 발생했습니다:', error);
        saved = [];
    }
    const post = saved.find(p => String(p.id) === String(postId));

    // 댓글 불러오기
    useEffect(() => {
        let savedComments = [];
        try {
            savedComments = JSON.parse(localStorage.getItem(`comments_${postId}`) ?? '[]');
        } catch (error) {
            console.error('댓글 데이터를 불러오는 중 오류가 발생했습니다:', error);
            savedComments = [];
        }
        setComments(savedComments);
    }, [postId]);

    useEffect(() => {
        // localStorage에서 현재 로그인한 사용자 정보 가져오기
        let user = null;
        try {
            const userData = localStorage.getItem('user') ?? 'null';
            user = JSON.parse(userData);
            if (user === null || typeof user !== 'object') {
                user = null;
            }
        } catch (error) {
            console.error('사용자 정보를 불러오는 중 오류가 발생했습니다:', error);
            user = null;
        }
        setCurrentUser(user);
    }, []);

    // 댓글 저장
    const saveComments = (newComments) => {
        setComments(newComments);
        try {
            localStorage.setItem(`comments_${postId}`, JSON.stringify(newComments));
        } catch (error) {
            console.error('댓글 저장 중 오류가 발생했습니다:', error);
        }
    };

    // 답글쓰기 버튼 클릭 시
    const handleReplyClick = (commentId) => {
        setReplyTo(commentId);
        // 입력창에 포커스
        setTimeout(() => {
            commentInputRef.current?.focus();
        }, 0);
    };

    // 댓글/답글 등록
    const handleAddComment = () => {
        if (!comment.trim()) return;
        const user = JSON.parse(localStorage.getItem('user'));
        const author = user?.nickname || user?.name || '익명';

        if (replyTo) {
            // 답글 등록
            const newComments = comments.map(c => {
                if (c.id === replyTo) {
                    return {
                        ...c,
                        replies: [...(c.replies || []), {
                            id: Date.now(),
                            content: comment,
                            author,
                            time: new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})
                        }]
                    };
                }
                return c;
            });
            saveComments(newComments);
            setReplyTo(null); // 답글 모드 해제
        } else {
            // 일반 댓글 등록
            const newComment = {
                id: Date.now(),
                content: comment,
                author,
                time: new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}),
                replies: [],
            };
            const newComments = [...comments, newComment];
            saveComments(newComments);
        }
        setComment("");
    };

    // 댓글 수정/삭제/대댓글 관련
    const handleEditComment = (id, content) => {
        setEditingCommentId(id);
        setEditingContent(content);
        setShowCommentMenu(null); // 삼점바 닫기
    };

    const handleSaveCommentEdit = (id) => {
        const newComments = comments.map(c => c.id === id ? {...c, content: editingContent} : c);
        saveComments(newComments);
        setEditingCommentId(null);
        setEditingContent("");
    };

    const handleDeleteComment = (id) => {
        const newComments = comments.filter(c => c.id !== id);
        saveComments(newComments);
    };
    const handleEditReply = (parentId, replyId, content) => {
        setEditingCommentId(`${parentId}_${replyId}`);
        setEditingContent(content);
        setShowReplyMenu(null); // 삼점바 닫기
    };
    const handleSaveEditReply = (parentId, replyId) => {
        const newComments = comments.map(c => {
            if (c.id === parentId) {
                return {
                    ...c,
                    replies: c.replies.map(r => r.id === replyId ? {...r, content: editingContent} : r)
                };
            }
            return c;
        });
        saveComments(newComments);
        setEditingCommentId(null);
        setEditingContent("");
    };
    const handleDeleteReply = (parentId, replyId) => {
        const newComments = comments.map(c => {
            if (c.id === parentId) {
                return {
                    ...c,
                    replies: c.replies.filter(r => r.id !== replyId)
                };
            }
            return c;
        });
        saveComments(newComments);
    };

    // 게시글 작성자 확인 함수
    const isAuthor = (author) => {
        if (!currentUser) return false;
        return author === currentUser.nickname || author === currentUser.name;
    };

    if (!post) {
        return <div>게시글을 찾을 수 없습니다.</div>;
    }

    const handleEdit = () => {
        navigate('/community/write', {
            state: {
                post: post,
                isEditing: true
            }
        });
        setShowMenu(false);
    };

    const handleDelete = () => {
        // localStorage에서 삭제 (샘플 데이터가 아닌 localStorage 데이터만)
        const prev = JSON.parse(localStorage.getItem('communityPosts')) || [];
        const updated = prev.filter(p => String(p.id) !== String(post.id));
        localStorage.setItem('communityPosts', JSON.stringify(updated));
        setShowPostMenu(false); // 메뉴 닫기
        navigate('/community');
    };

    const handleBack = () => {
        navigate('/community', {state: {team: post.team}});
    };

    const toggleMenu = () => {
        setShowMenu(!showMenu);
    };

    return (
        <div className={styles.detailWrapper}>
            {/* 상단바 */}
            <div className={styles.topBar}>
                <button className={styles.backBtn} onClick={handleBack}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M16 5L9 12L16 19" stroke="#111" strokeWidth="2.2" strokeLinecap="round"
                              strokeLinejoin="round"/>
                    </svg>
                </button>
                <img src={`${process.env.PUBLIC_URL}/Logo/TeamLogo/emblem_${teamLogoMap[post.team] || 'HH'}.png`}
                     alt="팀로고" className={styles.teamLogo}/>
                <span className={styles.teamName}>{post.teamName || '한화 이글스'}</span>
            </div>
            {/* 게시글 카드 */}
            <div className={styles.card}>
                <div className={styles.titleRow}>
                    <h2 className={styles.title}>{post.title}</h2>
                    <div className={styles.profileBox}>
                        <img className={styles.profileImg} src={`${process.env.PUBLIC_URL}/profile/user2.jpg`}
                             alt="프로필"/>
                        <span className={styles.profileName}>{post.author}</span>
                        {isAuthor && (
                            <div className={styles.menuWrapper}>
                                <button className={styles.menuButton} onClick={toggleMenu}>⋮</button>
                                {showMenu && (
                                    <div className={styles.menuPopup}>
                                        <div className={styles.menuItem} onClick={handleEdit}>수정하기</div>
                                        <div className={`${styles.menuItem} ${styles.delete}`}
                                             onClick={handleDelete}>삭제하기
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                {post.image && (
                    <div className={styles.imageWrapper}>
                        <img src={post.image} alt="게시글 이미지" className={styles.postImage}/>
                    </div>
                )}
                <p className={styles.body}>{post.content}</p>
            </div>
            {/* 댓글 영역 */}
            <div className={styles.commentSection}>
                <div className={styles.commentList}>
                    {comments.map((c) => (
                        <div key={c.id} className={styles.commentItem}>
                            <div className={styles.commentTop}>
                                <div className={styles.commentProfile}>
                                    <img className={styles.commentProfileImg}
                                         src={`${process.env.PUBLIC_URL}/profile/user2.jpg`} alt="프로필"/>
                                    <span className={styles.commentAuthor}>{c.author}</span>
                                </div>
                                <div className={styles.commentRight}>
                                    <span className={styles.commentTime}>{c.time}</span>
                                    {isAuthor(c.author) && (
                                        <div className={styles.menuWrapper}>
                                            <button
                                                onClick={() => setShowCommentMenu(showCommentMenu === c.id ? null : c.id)}
                                                className={styles.menuButton}>⋮
                                            </button>
                                            {showCommentMenu === c.id && (
                                                <div className={styles.menuPopup}>
                                                    <div className={styles.menuItem}
                                                         onClick={() => handleEditComment(c.id, c.content)}>수정하기
                                                    </div>
                                                    <div className={styles.menuItem}
                                                         onClick={() => handleDeleteComment(c.id)}>삭제하기
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                            {editingCommentId === c.id ? (
                                <div className={styles.editBox}>
                                    <input value={editingContent} onChange={e => setEditingContent(e.target.value)}/>
                                    <button onClick={() => handleSaveCommentEdit(c.id)}>저장</button>
                                </div>
                            ) : (
                                <div className={styles.commentContent}>{c.content}</div>
                            )}
                            {/* 답글쓰기 버튼 */}
                            <div className={styles.replyWriteRow}>
                                <button className={styles.replyBtn} onClick={() => handleReplyClick(c.id)}>답글쓰기</button>
                            </div>
                            {/* 대댓글 */}
                            <div className={styles.replySection}>
                                {c.replies && c.replies.map(r => (
                                    <div key={r.id} className={styles.replyItem}>
                                        <div className={styles.replyRow}>
                                            <div className={styles.commentProfile}>
                                                <img className={styles.commentProfileImg}
                                                     src={`${process.env.PUBLIC_URL}/exImage.png`} alt="프로필"/>
                                                <span className={styles.commentAuthor}>{r.author}</span>
                                            </div>
                                            <div className={styles.replyRight}>
                                                <span className={styles.commentTime}>{r.time}</span>
                                                {isAuthor(r.author) && (
                                                    <div className={styles.menuWrapper}>
                                                        <button
                                                            onClick={() => setShowReplyMenu(showReplyMenu === `${c.id}_${r.id}` ? null : `${c.id}_${r.id}`)}
                                                            className={styles.menuButton}>⋮
                                                        </button>
                                                        {showReplyMenu === `${c.id}_${r.id}` && (
                                                            <div className={styles.menuPopup}>
                                                                <div className={styles.menuItem}
                                                                     onClick={() => handleEditReply(c.id, r.id, r.content)}>수정하기
                                                                </div>
                                                                <div className={styles.menuItem}
                                                                     onClick={() => handleDeleteReply(c.id, r.id)}>삭제하기
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        {editingCommentId === `${c.id}_${r.id}` ? (
                                            <div className={styles.editBox}>
                                                <input value={editingContent}
                                                       onChange={e => setEditingContent(e.target.value)}/>
                                                <button onClick={() => handleSaveEditReply(c.id, r.id)}>저장</button>
                                            </div>
                                        ) : (
                                            <div className={styles.commentContent}>{r.content}</div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
                {/* 댓글 입력창 */}
                <div className={styles.commentInputBox}>
                    <input
                        ref={commentInputRef}
                        className={styles.commentInput}
                        value={comment}
                        onChange={e => setComment(e.target.value)}
                        placeholder={replyTo ? "답글을 입력하세요" : "댓글을 남겨보세요"}
                    />
                    <button className={styles.sendBtn} onClick={handleAddComment}>
                        <img src={`${process.env.PUBLIC_URL}/Button/paperplane.png`} alt="전송" width={24}/>
                    </button>
                </div>
            </div>
            <CasterbotButton onClick={() => setShowCasterbot(true)}/>

            {showCasterbot && (
                <CasterbotModal onClose={() => setShowCasterbot(false)}/>
            )}
        </div>
    );
};

export default PostDetail; 