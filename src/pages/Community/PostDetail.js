import React, {useEffect, useRef, useState} from 'react';
import {useLocation, useNavigate, useParams} from 'react-router-dom';
import styles from './PostDetail.module.css';
import axios from 'axios';
import Modal from '../../components/Modal/Modal';
import CasterbotButton from "../../components/CasterbotButton/CasterbotButton";
import CasterbotModal from "../Chatbot/CasterbotModal";
import { teamInfoMapCommunity } from '../../utils/teamInfoMap';
import { useAuth } from '../../utils/AuthContext';

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
  const { postId, team } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [post, setPost] = useState(null);
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
  const [showMenu, setShowMenu] = useState(false);
    const [showCasterbot, setShowCasterbot] = useState(false);
  const [showAbsModal, setShowAbsModal] = useState(false);
  const [profanityMessage, setProfanityMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editCommentText, setEditCommentText] = useState('');
  const { user: currentUser } = useAuth();

  const getWriterId = () => {
    if (post?._writerId) return String(post._writerId);
    if (post?.writerId) return String(post.writerId);
    const match = post?.writerNickname && post.writerNickname.match(/^User#(\d+)$/);
    return match ? match[1] : undefined;
  };

  const isAuthor = () =>
    currentUser?.id && getWriterId() && String(currentUser.id) === String(getWriterId());
  console.log('내 userId:', currentUser?.id);
  console.log('게시글 작성자 writerId:', getWriterId());
  console.log('isAuthor:', isAuthor());

  const checkProfanity = async (text) => {
    try {
      const response = await axios.post(
          `${process.env.REACT_APP_AI_API_BASE}/detect`,
        { sentence: text },
        { headers: { 'Content-Type': 'application/json' } }
      );

      let result = response.data?.result || response.data;

      if (typeof result === 'string') {
        result = result
          .replace(/```json\n/, '')
          .replace(/`{3,}[\s\S]*$/, '')
          .trim();

        result = JSON.parse(result);
      }

      const isCurse = result && (String(result.isCurse || result.is_curse).toLowerCase() === 'true');
      return {
        isCurse,
        words: result.words || [],
      };
    } catch (error) {
      console.error('비속어 감지 실패:', error);
      return { isCurse: false, words: [] };
    }
  };

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

    // 게시글 불러오기 + 닉네임 보정
    useEffect(() => {
        const teamParam = team || post?.team;
        if (!teamParam || !postId) return;
        const fetchPost = async () => {
            try {
                const res = await axios.get(
                    `${process.env.REACT_APP_LOCAL_BACKEND_COMMUNITY_URI}/post/${teamParam}/${postId}`,
                    { withCredentials: true }
                );
                let postData = { ...res.data, id: res.data.postId || res.data.id };
                // User#숫자면 id 추출해서 별도 필드에 저장하고, 닉네임은 실제 닉네임으로 덮어쓰기
                const match = postData.writerNickname && postData.writerNickname.match(/^User#(\d+)$/);
                if (match) {
                    const writerId = match[1];
                    postData._writerId = writerId;
                    try {
                        const userRes = await axios.get(
                            `${process.env.REACT_APP_LOCAL_BACKEND_URI}/user/profile/${writerId}`,
                            { withCredentials: true }
                        );
                        postData.writerNickname = userRes.data.nickname;
                    } catch (e) {
                        console.error('프로필 API 실패:', e);
                    }
                } else if (postData.writerId) {
                    postData._writerId = postData.writerId;
                }
                setPost(postData);
                console.log('최종 postData:', postData);
            } catch (error) {
                console.error('Error fetching post:', error);
                alert('게시글을 불러오는 중 오류가 발생했습니다.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchPost();
    }, [postId, team]);

    // 답글쓰기 버튼 클릭 시
    const handleReplyClick = (commentId) => {
        setReplyTo(commentId);
        setTimeout(() => {
            commentInputRef.current?.focus();
        }, 0);
    };

    // 작성자 닉네임 표시 함수
    const getWriterNickname = () => {
        if (!post?.writerNickname) return '';
        if (post.writerNickname.startsWith('User#')) {
            return currentUser?.nickname || post.writerNickname;
        }
        return post.writerNickname;
    };

    // 댓글 작성자 확인 함수
    const isCommentAuthor = (authorId) => {
        if (!currentUser?.id || !authorId) return false;
        return authorId === currentUser.id;
    };

    // 댓글 저장
    const saveComments = (newComments) => {
        setComments(newComments);
        try {
            localStorage.setItem(`comments_${postId}`, JSON.stringify(newComments));
        } catch (error) {
            console.error('댓글 저장 중 오류가 발생했습니다:', error);
        }
    };

    // 댓글/답글 등록
    const handleAddComment = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        try {
            setIsSubmitting(true);
            const hasProfanity = await checkProfanity(comment);
            if (hasProfanity) {
                alert('비속어가 포함되어 있습니다.');
                return;
            }

            const response = await axios.post(
                `${process.env.REACT_APP_LOCAL_BACKEND_COMMUNITY_URI}/comment`,
                { postId: postId, content: comment },
                {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            setComments([...comments, response.data]);
            setComment("");
        } catch (error) {
            console.error('Error adding comment:', error);
            alert('댓글 작성 중 오류가 발생했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // 댓글 수정/삭제/대댓글 관련
    const handleEditComment = async (commentId) => {
        if (isSubmitting) return;

        try {
            setIsSubmitting(true);
            const hasProfanity = await checkProfanity(editCommentText);
            if (hasProfanity) {
                alert('비속어가 포함되어 있습니다.');
                return;
            }

            await axios.put(
                `${process.env.REACT_APP_LOCAL_BACKEND_COMMUNITY_URI}/comment`,
                { postId: postId, commentId, content: editCommentText },
                {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            setComments(comments.map(comment => 
                comment.id === commentId 
                    ? { ...comment, content: editCommentText }
                    : comment
            ));
            setEditingCommentId(null);
            setEditCommentText('');
        } catch (error) {
            console.error('Error editing comment:', error);
            alert('댓글 수정 중 오류가 발생했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm('댓글을 삭제하시겠습니까?')) return;

        try {
            await axios.patch(
                `${process.env.REACT_APP_LOCAL_BACKEND_COMMUNITY_URI}/comment`,
                { postId: postId, commentId, delete: true },
                {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            setComments(comments.filter(comment => comment.id !== commentId));
        } catch (error) {
            console.error('Error deleting comment:', error);
            alert('댓글 삭제 중 오류가 발생했습니다.');
        }
    };

    const handleEdit = async () => {
        if (!post) return;
        
        // 팀 정보 가져오기
        const teamInfo = getTeamInfo(team || post.team);
        if (!teamInfo) {
            console.error('팀 정보를 찾을 수 없습니다.');
            alert('팀 정보를 찾을 수 없습니다.');
            return;
        }

        if (!currentUser) {
            alert('로그인이 필요합니다.');
            return;
        }

        navigate('/newpost', {
            state: {
                post: {
                    ...post,
                    id: post.id || post.postId,
                    user: {
                        id: currentUser.id,
                        nickname: currentUser.nickname
                    }
                },
                isEditing: true,
                team: teamInfo.teamId,
                teamName: teamInfo.name
            }
        });
    };

    const handleDelete = async () => {
        if (!postId) {
            alert('postId가 없습니다.');
            return;
        }
        if (!window.confirm('게시글을 삭제하시겠습니까?')) return;

        try {
            const response = await axios.delete(
                `${process.env.REACT_APP_LOCAL_BACKEND_COMMUNITY_URI}/post/${postId}`,
                {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data) {
                alert('게시글이 삭제되었습니다.');
                // 현재 보고 있는 팀의 게시판으로 돌아가기
                const currentTeam = team || post?.team;
                if (!currentTeam) {
                    console.error('팀 정보가 없습니다.');
                    navigate('/community');
                    return;
                }
                navigate(`/community/post/${currentTeam}`);
            }
        } catch (error) {
            console.error('Error deleting post:', error);
            if (error.response) {
                console.error('Error response:', error.response.data);
                if (error.response.status === 403) {
                    alert('게시글을 삭제할 권한이 없습니다.');
                } else {
                    alert('게시글 삭제 중 오류가 발생했습니다.');
                }
            } else {
                alert('게시글 삭제 중 오류가 발생했습니다.');
            }
        }
    };

    const handleBackToList = () => {
        // 현재 보고 있는 팀의 게시판으로 돌아가기
        const currentTeam = team || post?.team;
        if (!currentTeam) {
            console.error('팀 정보가 없습니다.');
            navigate('/community');
            return;
        }
        navigate(`/community/post/${currentTeam}`);
    };

    const toggleMenu = () => {
        setShowMenu(!showMenu);
    };

    const getTeamInfo = (teamId) => {
        if (!teamId) return null;
        const normalize = v => (v || '').replace(/_/g, '').toUpperCase();
        return teamInfoMapCommunity.find(t => normalize(t.teamId) === normalize(teamId));
    };

    const teamParam = team || post?.team;
    const teamInfo = getTeamInfo(teamParam);

    if (post) {
        console.log('상세 post.team:', post.team);
        console.log('상세 teamInfo:', teamInfo);
    }

    if (!post) {
        return <div>로딩 중...</div>;
    }

    // Add missing handler functions
    const handleSaveCommentEdit = async (commentId) => {
        if (isSubmitting) return;

        try {
            setIsSubmitting(true);
            const hasProfanity = await checkProfanity(editingContent);
            if (hasProfanity) {
                alert('비속어가 포함되어 있습니다.');
                return;
            }

            await axios.put(
                `${process.env.REACT_APP_LOCAL_BACKEND_COMMUNITY_URI}/comment`,
                { postId: postId, commentId, content: editingContent },
                {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            setComments(comments.map(comment => 
                comment.id === commentId 
                    ? { ...comment, content: editingContent }
                    : comment
            ));
            setEditingCommentId(null);
            setEditingContent('');
        } catch (error) {
            console.error('Error editing comment:', error);
            alert('댓글 수정 중 오류가 발생했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditReply = (commentId, replyId, content) => {
        setEditingCommentId(`${commentId}_${replyId}`);
        setEditingContent(content);
    };

    const handleDeleteReply = async (commentId, replyId) => {
        if (!window.confirm('답글을 삭제하시겠습니까?')) return;

        try {
            await axios.patch(
                `${process.env.REACT_APP_LOCAL_BACKEND_COMMUNITY_URI}/comment/reply`,
                { postId: postId, commentId, replyId, delete: true },
                {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            setComments(comments.map(comment => {
                if (comment.id === commentId) {
                    return {
                        ...comment,
                        replies: comment.replies.filter(reply => reply.id !== replyId)
                    };
                }
                return comment;
            }));
        } catch (error) {
            console.error('Error deleting reply:', error);
            alert('답글 삭제 중 오류가 발생했습니다.');
        }
    };

    const handleSaveEditReply = async (commentId, replyId) => {
        if (isSubmitting) return;

        try {
            setIsSubmitting(true);
            const hasProfanity = await checkProfanity(editingContent);
            if (hasProfanity) {
                alert('비속어가 포함되어 있습니다.');
                return;
            }

            await axios.put(
                `${process.env.REACT_APP_LOCAL_BACKEND_COMMUNITY_URI}/comment/reply`,
                { postId: postId, commentId, replyId, content: editingContent },
                {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            setComments(comments.map(comment => {
                if (comment.id === commentId) {
                    return {
                        ...comment,
                        replies: comment.replies.map(reply =>
                            reply.id === replyId
                                ? { ...reply, content: editingContent }
                                : reply
                        )
                    };
                }
                return comment;
            }));
            setEditingCommentId(null);
            setEditingContent('');
        } catch (error) {
            console.error('Error editing reply:', error);
            alert('답글 수정 중 오류가 발생했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={styles.detailWrapper}>
            {/* 상단바 */}
            <div className={styles.topBar}>
                <button className={styles.backBtn} onClick={handleBackToList}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M16 5L9 12L16 19" stroke="#111" strokeWidth="2.2" strokeLinecap="round"
                              strokeLinejoin="round"/>
                    </svg>
                </button>
                <img src={teamInfo?.logo || `${process.env.PUBLIC_URL}/Logo/TeamLogo/emblem_HH.png`}
                     alt="팀로고" className={styles.teamLogo}/>
                <span className={styles.teamName}>{post?.teamName || teamInfo?.name || ''}</span>
            </div>
            {/* 게시글 카드 */}
            <div className={styles.card}>
                <div className={styles.titleRow}>
                    <h2 className={styles.title}>{post.title}</h2>
                    <div className={styles.profileBox}>
                        <img className={styles.profileImg} 
                             src={post.profileImg || post.writerProfileImage || `${process.env.PUBLIC_URL}/profile/default.png`}
                             alt="프로필"
                             onError={(e) => {
                                 e.target.onerror = null;
                                 e.target.src = `${process.env.PUBLIC_URL}/profile/default.png`;
                             }}
                        />
                        <span className={styles.profileName}>{post.writerNickname}</span>
                        {isAuthor() && (
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
                                    {isCommentAuthor(c.author) && (
                                        <div className={styles.menuWrapper}>
                                            <button
                                                onClick={() => setShowCommentMenu(showCommentMenu === c.id ? null : c.id)}
                                                className={styles.menuButton}>⋮
                                            </button>
                                            {showCommentMenu === c.id && (
                                                <div className={styles.menuPopup}>
                                                    <div className={styles.menuItem}
                                                         onClick={() => handleEditComment(c.id)}>수정하기
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
            {showAbsModal && (
                <Modal
                    title="ABS봇이 작동중입니다."
                    message={
                        <>
                            ABS봇이 부적절한 키워드를 감지했습니다.
                            <br />
                            작성글을 수정해 주세요.
                            <br />
                            <br />
                            감지된 단어: {profanityMessage}
                        </>
                    }
                    buttons={[
                        { label: '확인', onClick: () => setShowAbsModal(false) }
                    ]}
                    onClose={() => setShowAbsModal(false)}
                />
            )}
            <CasterbotButton onClick={() => setShowCasterbot(true)}/>

            {showCasterbot && (
                <CasterbotModal onClose={() => setShowCasterbot(false)}/>
            )}
        </div>
    );
};

export default PostDetail; 