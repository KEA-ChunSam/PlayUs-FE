import React, {useEffect, useRef, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import styles from './PostDetail.module.css';
import axios from 'axios';
import Modal from '../../components/Modal/Modal';
import CasterbotButton from "../../components/CasterbotButton/CasterbotButton";
import CasterbotModal from "../Chatbot/CasterbotModal";
import { teamInfoMapCommunity } from '../../utils/teamInfoMap';
import { useAuth } from '../../utils/AuthContext';

const PostDetail = () => {
  const { postId, team } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [showCommentMenu, setShowCommentMenu] = useState(null); // 댓글 삼점바(댓글 id)
  const [showReplyMenu, setShowReplyMenu] = useState(null); // 대댓글 삼점바(댓글id_대댓글id)
  const [comment, setComment] = useState("");
  const [replyInputValue, setReplyInputValue] = useState({}); // 답글 입력값을 댓글 id별로 분리
  const [comments, setComments] = useState([]);
  const [replyTo, setReplyTo] = useState(null); // 대댓글 대상
  const commentInputRef = useRef(null); // 입력창 참조
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingContent, setEditingContent] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [showCasterbot, setShowCasterbot] = useState(false);
  const [showAbsModal, setShowAbsModal] = useState(false);
  const [profanityMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user: currentUser } = useAuth();

  const getWriterId = () => {
    if (post?._writerId) return String(post._writerId);
    if (post?.writerId) return String(post.writerId);
    const match = post?.writerNickname && post.writerNickname.match(/^User#(\d+)$/);
    return match ? match[1] : undefined;
  };

  const isAuthor = () =>
    currentUser?.id && getWriterId() && String(currentUser.id) === String(getWriterId());

    const checkProfanity = async (text) => {
        try {
            const token = document.cookie
                .split('; ')
                .find(cookie => cookie.startsWith('Access='))
                ?.split('=')[1];
            const response = await axios.post(
                `${process.env.REACT_APP_AI_API_BASE}/detect`,
                { sentence: text },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    withCredentials: true
                }
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
            return { isCurse: false, words: [] };
        }
    };

  const fetchPost = async () => {
    const teamParam = team || post?.team;
    if (!teamParam || !postId) return;
    try {
        const res = await axios.get(
            `${process.env.REACT_APP_LOCAL_BACKEND_COMMUNITY_URI}/post/${teamParam}/${postId}`,
            { withCredentials: true }
        );
        let postData = { ...res.data, id: res.data.postId || res.data.id };

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
                // Error handling for nickname fetch, can be empty if no specific action needed
            }
        } else if (postData.writerId) {
            postData._writerId = postData.writerId;
        }

        if (postData.comments && Array.isArray(postData.comments)) {

            const fetchNicknamePromises = postData.comments.map(async comment => {
                const commentId = comment.commentId || comment.id;
                const commentGroupId = comment.commentGroupId;

                if (commentId === undefined || commentId === null) {
                    return null;
                }

                let writerNickname = comment.writerNickname || comment.author;
                let authorId = comment.writerId || comment.authorId;

                const match = writerNickname && String(writerNickname).match(/^User#(\d+)$/);
                if (match) {
                    const idFromNickname = match[1];
                    authorId = authorId || idFromNickname;
                    if (authorId) {
                        try {
                            const userRes = await axios.get(
                                `${process.env.REACT_APP_LOCAL_BACKEND_URI}/user/profile/${authorId}`,
                                { withCredentials: true }
                            );
                            writerNickname = userRes.data.nickname;
                        } catch (e) {
                            // Error handling for nickname fetch, can be empty if no specific action needed
                        }
                    }
                }

                const processedReComments = await Promise.all((comment.reComments || []).map(async reComment => {
                    let reWriterNickname = reComment.writerNickname;
                    let reAuthorId = reComment.writerId;

                    const reMatch = reWriterNickname && String(reWriterNickname).match(/^User#(\d+)$/);
                    if (reMatch) {
                        const reIdFromNickname = reMatch[1];
                        reAuthorId = reAuthorId || reIdFromNickname;
                        if (reAuthorId) {
                            try {
                                const userRes = await axios.get(
                                    `${process.env.REACT_APP_LOCAL_BACKEND_URI}/user/profile/${reAuthorId}`,
                                    { withCredentials: true }
                                );
                                reWriterNickname = userRes.data.nickname;
                            } catch (e) {
                                // Error handling for nickname fetch, can be empty if no specific action needed
                            }
                        }
                    }

                    return {
                        ...reComment,
                        id: reComment.reCommentId,
                        author: reWriterNickname,
                        authorId: reAuthorId,
                        content: reComment.content || reComment.body || reComment.text || '',
                        time: reComment.time
                    };
                }));

                const processedComment = {
                    ...comment,
                    id: commentId,
                    commentGroupId: commentGroupId,
                    postId: comment.postId || Number(postId),
                    content: comment.content || comment.body || comment.text || '',
                    author: writerNickname,
                    authorId: authorId,
                    time: comment.time,
                    replies: processedReComments
                };

                return processedComment;
            });

            const processedComments = (await Promise.all(fetchNicknamePromises)).filter(comment => comment !== null);

            const groupedComments = {};
            processedComments.forEach(comment => {
                const groupId = comment.commentGroupId;
                if (!groupedComments[groupId]) {
                    groupedComments[groupId] = { ...comment, replies: [] };
                } else if (comment.parentId === null || comment.parentId === undefined) {
                    groupedComments[groupId] = { ...comment, replies: groupedComments[groupId].replies };
                }
            });

            processedComments.forEach(comment => {
                const groupId = comment.commentGroupId;
                if (comment.parentId !== null && comment.parentId !== undefined) {
                    if (groupedComments[groupId]) {
                        groupedComments[groupId].replies.push(comment);
                    }
                }
            });

            const finalComments = Object.values(groupedComments).sort((a, b) => new Date(a.time) - new Date(b.time));

            postData.comments = finalComments;
        }

        setPost(postData);
        setComments(postData.comments || []);
    } catch (error) {
        setPost(null);
        setComments([]);
    }
  };

  useEffect(() => {
    fetchPost();
  }, [postId, team, isSubmitting]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    const hasProfanity = await checkProfanity(comment);
    if (hasProfanity.isCurse) {
        alert(`비속어가 감지되었습니다: ${hasProfanity.words.join(', ')}`);
        return;
    }

    setIsSubmitting(true);
    try {
        let newCommentData = {
            content: comment,
            postId: Number(postId),
            teamId: teamInfoMapCommunity.find(t => t.teamId === team)?.id, // teamId를 숫자로 변환
            writerNickname: currentUser?.nickname || currentUser?.name || '익명',
            writerProfileImage: currentUser?.profileImage || null
        };

        if (replyTo) {
            newCommentData.parentId = replyTo.commentId;
        }

        const url = `${process.env.REACT_APP_LOCAL_BACKEND_COMMUNITY_URI}/comment/${team}`;
        const response = await axios.post(url, newCommentData, {
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.data) {
            setComment('');
            setReplyTo(null);
            fetchPost(); // 게시글과 댓글을 다시 불러와서 최신 상태 반영
        }
    } catch (error) {
        alert('댓글 작성 실패.');
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleEditComment = async (commentId, content) => {
    if (!content.trim()) return;

    const hasProfanity = await checkProfanity(content);
    if (hasProfanity.isCurse) {
        alert(`비속어가 감지되었습니다: ${hasProfanity.words.join(', ')}`);
        return;
    }

    setIsSubmitting(true);
    try {
        const response = await axios.patch(
            `${process.env.REACT_APP_LOCAL_BACKEND_COMMUNITY_URI}/comment/${commentId}`,
            { content: content },
            {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        if (response.status === 200) {
            setEditingCommentId(null);
            setEditingContent('');
            fetchPost();
        } else {
            alert('댓글 수정 실패.');
        }
    } catch (error) {
        alert('댓글 수정 중 오류가 발생했습니다.');
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('댓글을 삭제하시겠습니까?')) return;
    setIsSubmitting(true);
    try {
        const response = await axios.delete(
            `${process.env.REACT_APP_LOCAL_BACKEND_COMMUNITY_URI}/comment/${commentId}`,
            { withCredentials: true }
        );
        if (response.status === 200) {
            fetchPost();
            setShowCommentMenu(null);
        } else {
            alert('댓글 삭제 실패.');
        }
    } catch (error) {
        alert('댓글 삭제 중 오류가 발생했습니다.');
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleEditReply = (commentId, replyId, content) => {
    setEditingCommentId(`${commentId}_${replyId}`);
    setEditingContent(content);
    setReplyInputValue(prev => ({
        ...prev,
        [`${commentId}_${replyId}`]: content
    }));
  };

  const handleSaveEditReply = async (commentId, replyId) => {
    const content = replyInputValue[`${commentId}_${replyId}`];
    if (!content.trim()) return;

    const hasProfanity = await checkProfanity(content);
    if (hasProfanity.isCurse) {
        alert(`비속어가 감지되었습니다: ${hasProfanity.words.join(', ')}`);
        return;
    }

    setIsSubmitting(true);
    try {
        const response = await axios.patch(
            `${process.env.REACT_APP_LOCAL_BACKEND_COMMUNITY_URI}/comment/recomment/${replyId}`,
            { content: content },
            {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        if (response.status === 200) {
            setEditingCommentId(null);
            setEditingContent('');
            setReplyInputValue(prev => ({ ...prev, [`${commentId}_${replyId}`]: '' }));
            fetchPost();
        } else {
            alert('대댓글 수정 실패.');
        }
    } catch (error) {
        alert('대댓글 수정 중 오류가 발생했습니다.');
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleDeleteReply = async (commentId, replyId) => {
    if (!window.confirm('대댓글을 삭제하시겠습니까?')) return;
    setIsSubmitting(true);
    try {
        const response = await axios.delete(
            `${process.env.REACT_APP_LOCAL_BACKEND_COMMUNITY_URI}/comment/recomment/${replyId}`,
            { withCredentials: true }
        );
        if (response.status === 200) {
            fetchPost();
            setShowReplyMenu(null);
        } else {
            alert('대댓글 삭제 실패.');
        }
    } catch (error) {
        alert('대댓글 삭제 중 오류가 발생했습니다.');
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleReplyClick = (comment) => {
    setReplyTo(comment);
    if (commentInputRef.current) {
        commentInputRef.current.focus();
    }
  };

  const handleCancelReply = () => {
    setReplyTo(null);
  };

  const handleEdit = async () => {
    navigate(`/editpost/${postId}`, { state: { post, isEditing: true, team: team } });
  };

  const handleDelete = async () => {
        if (!postId) {
            alert('postId가 없습니다.');
            return;
        }
        if (!window.confirm('게시글을 삭제하시겠습니까?')) return;

        try {
            const response = await axios.delete(
                `${process.env.REACT_APP_LOCAL_BACKEND_COMMUNITY_URI}/post/${team}/${postId}`,
                {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data) {
                alert('게시글이 삭제되었습니다.');
                const currentTeam = team || post?.team;
                if (!currentTeam) {
                    navigate('/community');
                    return;
                }
                navigate(`/community/post/${currentTeam}`);
            }
        } catch (error) {
            if (error.response) {
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
    const currentTeam = team || post?.team;
    if (!currentTeam) {
        navigate('/community');
        return;
    }
    navigate(`/community/post/${currentTeam}`);
  };

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  const getTeamInfo = (teamId) => {
    return teamInfoMapCommunity.find(t => t.teamId === teamId);
  };

  const teamInfo = getTeamInfo(team);

  if (!post) {
    return <div className={styles.loading}>게시글 로딩 중...</div>;
  }

  const postDate = new Date(post.date);
  const formattedDate = !isNaN(postDate) ? postDate.toLocaleDateString('ko-KR') : '날짜 없음';
  const formattedTime = post.time || '';

  const hasImage = post.image && post.image.startsWith('data:image');

  const isCommentAuthor = (authorId) => {
    return currentUser?.id && String(currentUser.id) === String(authorId);
  };

  const handleUpdateCommentsStateAfterAdd = (prevComments, replyTo, newComment) => {
    if (replyTo) {
      return prevComments.map(comment =>
        comment.id === replyTo.commentId
          ? { ...comment, replies: [...(comment.replies || []), { ...newComment, parentId: replyTo.commentId }] }
          : comment
      );
    } else {
      return [...prevComments, newComment];
    }
  };

  const getTeamLogo = (teamId) => {
    const team = teamInfoMapCommunity.find(t => t.teamId.toUpperCase() === teamId.toUpperCase());
    return team ? team.logo : '';
  };

  const handleCasterbotButtonClick = () => {
    setShowCasterbot(true);
  };

  const handleCasterbotClose = () => {
    setShowCasterbot(false);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button onClick={handleBackToList} className={styles.backButton}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 className={styles.teamName}>{teamInfo?.name || ''} 라커룸</h1>
        {isAuthor() && (
            <div className={styles.menuContainer}>
              <button onClick={toggleMenu} className={styles.menuButton}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 6C12.5523 6 13 5.55228 13 5C13 4.44772 12.5523 4 12 4C11.4477 4 11 4.44772 11 5C11 5.55228 11.4477 6 12 6Z" fill="#333"/>
                  <path d="M12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13Z" fill="#333"/>
                  <path d="M12 20C12.5523 20 13 19.5523 13 19C13 18.4477 12.5523 18 12 18C11.4477 18 11 18.4477 11 19C11 19.5523 11.4477 20 12 20Z" fill="#333"/>
                </svg>
              </button>
              {showMenu && (
                  <div className={styles.menuDropdown}>
                    <button onClick={handleEdit} className={styles.dropdownItem}>수정</button>
                    <button onClick={handleDelete} className={styles.dropdownItem}>삭제</button>
                  </div>
              )}
            </div>
        )}
      </header>
      <main className={styles.postContent}>
        <h2 className={styles.postTitle}>{post.title}</h2>
        <div className={styles.postMeta}>
          <div className={styles.authorInfo}>
            <img src={post.writerProfileImage || `${process.env.PUBLIC_URL}/Logo/TeamLogo/emblem_HH.png`} alt="작성자 프로필" className={styles.authorProfileImage}/>
            <span className={styles.postAuthor}>{post.writerNickname || post.author}</span>
          </div>
          <span className={styles.postDate}>{formattedDate} {formattedTime}</span>
        </div>
        {hasImage && (
          <div className={styles.postImageContainer}>
            <img src={post.image} alt="게시글 이미지" className={styles.postImage} />
          </div>
        )}
        <p className={styles.postText}>{post.content}</p>
      </main>
      <section className={styles.commentsSection}>
        <h3 className={styles.commentsTitle}>댓글 {comments.length}</h3>
        <form onSubmit={handleCommentSubmit} className={styles.commentForm}>
          {replyTo && (
            <div className={styles.replyingTo}>
              <span>{replyTo.author}님에게 답글 작성 중</span>
              <button type="button" onClick={handleCancelReply} className={styles.cancelReplyButton}>X</button>
            </div>
          )}
          <input
            type="text"
            placeholder={replyTo ? '답글을 입력하세요...' : '댓글을 입력하세요...'}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className={styles.commentInput}
            ref={commentInputRef}
            disabled={isSubmitting}
          />
          <button type="submit" className={styles.submitCommentButton} disabled={isSubmitting}>
            등록
          </button>
        </form>
        <ul className={styles.commentList}>
          {comments.map((cmt) => ( // cmt는 이제 부모 댓글 또는 단독 댓글
            <li key={cmt.id} className={styles.commentItem}>
              <div className={styles.commentHeader}>
                <img src={cmt.writerProfileImage || getTeamLogo(cmt.team)} alt="작성자 프로필" className={styles.commentAuthorProfileImage}/>
                <span className={styles.commentAuthor}>{cmt.author}</span>
                <span className={styles.commentTime}>{cmt.time}</span>
                {(isCommentAuthor(cmt.authorId) || isAuthor()) && (
                  <div className={styles.commentMenuContainer}>
                    <button onClick={() => setShowCommentMenu(showCommentMenu === cmt.id ? null : cmt.id)} className={styles.commentMenuButton}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 6C12.5523 6 13 5.55228 13 5C13 4.44772 12.5523 4 12 4C11.4477 4 11 4.44772 11 5C11 5.55228 11.4477 6 12 6Z" fill="#888"/>
                        <path d="M12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13Z" fill="#888"/>
                        <path d="M12 20C12.5523 20 13 19.5523 13 19C13 18.4477 12.5523 18 12 18C11.4477 18 11 18.4477 11 19C11 19.5523 11.4477 20 12 20Z" fill="#888"/>
                      </svg>
                    </button>
                    {showCommentMenu === cmt.id && (
                      <div className={styles.commentMenuDropdown}>
                        <button onClick={() => { setEditingCommentId(cmt.id); setEditingContent(cmt.content); setShowCommentMenu(null); }} className={styles.dropdownItem}>수정</button>
                        <button onClick={() => handleDeleteComment(cmt.id)} className={styles.dropdownItem}>삭제</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              {editingCommentId === cmt.id ? (
                <div className={styles.editCommentForm}>
                  <input
                    type="text"
                    value={editingContent}
                    onChange={(e) => setEditingContent(e.target.value)}
                    className={styles.editCommentInput}
                  />
                  <button onClick={() => handleEditComment(cmt.id, editingContent)} className={styles.saveEditButton}>저장</button>
                  <button onClick={() => setEditingCommentId(null)} className={styles.cancelEditButton}>취소</button>
                </div>
              ) : (
                <p className={styles.commentText}>{cmt.content}</p>
              )}
              <button onClick={() => handleReplyClick(cmt)} className={styles.replyButton}>답글 달기</button>

              {cmt.replies && cmt.replies.length > 0 && (
                <ul className={styles.replyList}>
                  {cmt.replies.map((reply) => ( // reply는 이제 대댓글
                    <li key={`${cmt.id}_${reply.id}`} className={styles.replyItem}>
                      <div className={styles.replyHeader}>
                        <img src={reply.writerProfileImage || getTeamLogo(reply.team)} alt="작성자 프로필" className={styles.replyAuthorProfileImage}/>
                        <span className={styles.replyAuthor}>{reply.author}</span>
                        <span className={styles.replyTime}>{reply.time}</span>
                        {(isCommentAuthor(reply.authorId) || isAuthor()) && (
                            <div className={styles.replyMenuContainer}>
                                <button onClick={() => setShowReplyMenu(showReplyMenu === `${cmt.id}_${reply.id}` ? null : `${cmt.id}_${reply.id}`)} className={styles.replyMenuButton}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 6C12.5523 6 13 5.55228 13 5C13 4.44772 12.5523 4 12 4C11.4477 4 11 4.44772 11 5C11 5.55228 11.4477 6 12 6Z" fill="#888"/>
                                        <path d="M12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13Z" fill="#888"/>
                                        <path d="M12 20C12.5523 20 13 19.5523 13 19C13 18.4477 12.5523 18 12 18C11.4477 18 11 18.4477 11 19C11 19.5523 11.4477 20 12 20Z" fill="#888"/>
                                    </svg>
                                </button>
                                {showReplyMenu === `${cmt.id}_${reply.id}` && (
                                    <div className={styles.replyMenuDropdown}>
                                        <button onClick={() => handleEditReply(cmt.id, reply.id, reply.content)} className={styles.dropdownItem}>수정</button>
                                        <button onClick={() => handleDeleteReply(cmt.id, reply.id)} className={styles.dropdownItem}>삭제</button>
                                    </div>
                                )}
                            </div>
                        )}
                      </div>
                      {editingCommentId === `${cmt.id}_${reply.id}` ? (
                          <div className={styles.editReplyForm}>
                              <input
                                  type="text"
                                  value={replyInputValue[`${cmt.id}_${reply.id}`] || ''}
                                  onChange={(e) => setReplyInputValue(prev => ({ ...prev, [`${cmt.id}_${reply.id}`]: e.target.value }))}
                                  className={styles.editReplyInput}
                              />
                              <button onClick={() => handleSaveEditReply(cmt.id, reply.id)} className={styles.saveEditButton}>저장</button>
                              <button onClick={() => setEditingCommentId(null)} className={styles.cancelEditButton}>취소</button>
                          </div>
                      ) : (
                          <p className={styles.replyText}>{reply.content}</p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </section>
      <CasterbotButton onClick={handleCasterbotButtonClick} />

      {showCasterbot && (
          <CasterbotModal onClose={handleCasterbotClose}/>
      )}
      {showAbsModal && (
          <Modal show={showAbsModal} onClose={() => setShowAbsModal(false)} title="비속어 감지">
              <p>{profanityMessage}</p>
          </Modal>
      )}
    </div>
  );
};

export default PostDetail; 