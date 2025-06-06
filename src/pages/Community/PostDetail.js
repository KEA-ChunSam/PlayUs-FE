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
  console.log('내 userId:', currentUser?.id);
  console.log('게시글 작성자 writerId:', getWriterId());
  console.log('isAuthor:', isAuthor());

    const checkProfanity = async (text) => {
        try {
            // Extract access token from cookies
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
            console.error('비속어 필터링 오류:', error);
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

        // User#숫자 처리
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

        // 댓글 데이터 구조화 (commentGroupId를 기준으로 그룹화하고 각 그룹의 첫 댓글을 부모로 간주)
        if (postData.comments && Array.isArray(postData.comments)) {
            console.log('5. 댓글 구조화 시작 전 원본 댓글 배열:', postData.comments);
            
            // 1차 순회: 댓글과 답글 처리
            const fetchNicknamePromises = postData.comments.map(async comment => {
                const commentId = comment.commentId || comment.id;
                const commentGroupId = comment.commentGroupId;

                if (commentId === undefined || commentId === null) {
                    console.warn('댓글에 필수 필드(id)가 없습니다:', comment);
                    return null;
                }

                let writerNickname = comment.writerNickname || comment.author;
                let authorId = comment.writerId || comment.authorId;

                // writerNickname이 User#숫자 형태인지 확인하고 실제 닉네임 가져오기
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
                            console.error(`댓글 작성자 프로필 API 실패 (ID: ${authorId}):`, e);
                        }
                    }
                }

                // 답글들도 같은 방식으로 처리
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
                                console.error(`답글 작성자 프로필 API 실패 (ID: ${reAuthorId}):`, e);
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
                    replies: processedReComments // 처리된 답글들
                };

                return processedComment;
            });

            // 모든 닉네임 정보가 로딩될 때까지 대기
            const processedComments = (await Promise.all(fetchNicknamePromises)).filter(comment => comment !== null);

    const handleDelete = async () => {
        if (!postId) {
            alert('postId가 없습니다.');
            return;
        }
        if (!window.confirm('게시글을 삭제하시겠습니까?')) return;

        try {
            const response = await axios.delete(
                `${process.env.REACT_APP_LOCAL_BACKEND_COMMUNITY_URI}/post/${teamParam}/${postId}`,
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

            postData.comments = processedComments;
        } else {
            console.log('12. 댓글 데이터가 없거나 배열이 아님');
            postData.comments = [];
        }

        setPost(postData);
        setComments(postData.comments || []);

        console.log('13. 상태 업데이트 완료 - comments 길이:', postData.comments.length);
        console.log('=== 댓글 데이터 디버깅 종료 ===');

    } catch (error) {
        console.error('Error fetching post:', error);
        alert('게시글을 불러오는 중 오류가 발생했습니다.');
    } finally {
        setIsSubmitting(false);
    }
};

useEffect(() => {
    if (postId && team) {
        console.log('fetchPost 호출 전 - postId:', postId, 'team:', team);
    fetchPost();
    }
    // eslint-disable-next-line
}, [postId, team]);


  // 댓글 작성자 확인 함수 (authorId 기반)
  const isCommentAuthor = (authorId) => {
      // console.log('isCommentAuthor called', { authorId, currentUserId: currentUser?.id });
      if (authorId !== undefined && authorId !== null && currentUser?.id !== undefined && currentUser?.id !== null) {
          return String(authorId) === String(currentUser.id);
      }
      // authorNickname만 있는 경우 (User#숫자 형식 외) 닉네임 비교 - 현재 authorId를 우선하므로 주석 처리
      // if (authorNickname !== undefined && authorNickname !== null && currentUser?.nickname !== undefined && currentUser?.nickname !== null && !String(authorNickname).match(/^User#(\d+)$/)) {
      //    return authorNickname === currentUser.nickname;
      // }
      return false; // authorId가 없거나 currentUser가 없는 경우
  };


  // 댓글/답글 등록
  const handleAddComment = async (e) => {
      e.preventDefault();
      if (isSubmitting) return;

      const text = replyTo ? replyInputValue[String(replyTo)] : comment;
      if (!text || text.trim() === '') {
          alert('내용을 입력해 주세요.');
          return;
      }

      try {
          setIsSubmitting(true);
          const hasProfanity = await checkProfanity(text);
          if (hasProfanity.isCurse) {
              alert('비속어가 포함되어 있습니다.');
              return;
          }

          const payload = {
              postId: Number(postId),
              content: text
          };

          let parentComment = null;
          if (replyTo !== null && replyTo !== undefined && replyTo !== '') {
              parentComment = comments.find(c => String(c.id) === String(replyTo));
              if (parentComment) {
                  if (!parentComment.commentGroupId) {
                      console.error('부모 댓글에 commentGroupId가 없습니다:', parentComment);
                      alert('답글 작성에 실패했습니다. 부모 댓글 정보를 확인할 수 없습니다.');
                      return;
                  }
                  payload.commentGroupId = Number(parentComment.commentGroupId);

                  console.log('답글 작성 - 부모 댓글 정보 및 Payload:', {
                      parentCommentId: parentComment.id,
                      parentCommentGroupId: parentComment.commentGroupId,
                      payloadCommentGroupId: payload.commentGroupId,
                      payload
                  });

              } else {
                  console.error('답글 작성 실패 - 부모 댓글을 찾을 수 없음 (replyTo ID:', replyTo, ')');
                  alert('답글 작성에 실패했습니다. 페이지를 새로고침 후 다시 시도해주세요.');
                  return;
              }
          }

          const requestUrl = `${process.env.REACT_APP_LOCAL_BACKEND_COMMUNITY_URI}/comment`;
          console.log('실제 요청 URL:', requestUrl);
          console.log('댓글/답글 전송 payload:', payload);

          const response = await axios.post(
              requestUrl,
              payload,
              {
                  withCredentials: true,
                  headers: {
                      'Content-Type': 'application/json'
                  }
              }
          );
          console.log('서버 응답:', response.data);

          const newCommentData = response.data;

          let writerNickname = newCommentData.writerNickname || newCommentData.author;
          let authorId = newCommentData.writerId || newCommentData.authorId;
          let profileImg = newCommentData.profileImg || newCommentData.writerProfileImage;

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
                      profileImg = userRes.data.profileImageUrl || profileImg;
                  } catch (e) {
                      console.error('프로필 API 실패:', e);
                  }
              }
          }

          const processedNewComment = {
              ...newCommentData,
              id: newCommentData.commentId,
              commentGroupId: newCommentData.commentGroupId,
              postId: newCommentData.postId,
              content: newCommentData.content,
              author: writerNickname,
              authorId: authorId,
              time: newCommentData.time,
              profileImg: profileImg,
              replies: newCommentData.reComments || []
          };

          console.log('handleAddComment - 서버 응답 데이터 (newCommentData):', newCommentData);
          console.log('handleAddComment - 프론트 상태 추가될 데이터 (processedNewComment):', processedNewComment);

          // 상태 업데이트
          if (replyTo) {
              // 답글인 경우: 해당 부모 댓글의 replies 배열에 추가
              setComments(prevComments => {
                   const nextComments = prevComments.map(comment => {
                       // 상태 업데이트 시에는 백엔드 응답의 commentGroupId를 사용하여 부모 댓글을 찾음
                       // 백엔드가 답글의 commentGroupId에 부모 댓글의 ID를 담아준다고 가정
                       if (String(comment.id) === String(newCommentData.commentGroupId)) {
                            // 해당 부모 댓글의 replies 배열에 새로 생성된 답글 추가
                           const updatedReplies = [...(comment.replies || []), processedNewComment];
                           // 시간순으로 정렬 (선택 사항, 필요시 주석 해제)
                           // updatedReplies.sort((a, b) => new Date(a.time) - new Date(b.time));
                           return {
                               ...comment,
                               replies: updatedReplies,
                           };
                       }
                       return comment;
                   });
                   console.log('handleAddComment - 답글 상태 업데이트 후 comments:', nextComments);
                   return nextComments;
              });

          } else {
              // 일반 댓글인 경우: 댓글 목록의 마지막에 추가
               setComments(prevComments => {
                   const nextComments = [...prevComments, processedNewComment];
                   console.log('handleAddComment - 댓글 상태 업데이트 후 comments:', nextComments);
                   return nextComments;
               });
          }

           // 입력 필드 초기화 및 replyTo 초기화
           if (replyTo) {
               setReplyInputValue({ ...replyInputValue, [String(replyTo)]: '' });
               setReplyTo(null);
           } else {
               setComment("");
           }

           // 댓글/답글 작성 성공 후 전체 데이터 다시 불러오기
           await fetchPost();

      } catch (error) {
          console.error('댓글 작성 중 오류:', error);
          alert('댓글 작성 중 오류가 발생했습니다.');
      } finally {
          setIsSubmitting(false);
      }
  };

  // 댓글 수정
  const handleEditComment = async (commentId, content) => {
      console.log('handleEditComment id:', commentId);
      console.log('handleEditComment content:', content);
      console.log('Type of setEditingContent:', typeof setEditingContent);
      if (isSubmitting) return;
      try {
          setIsSubmitting(true);
          const hasProfanity = await checkProfanity(content);
          if (hasProfanity.isCurse) {
              alert('비속어가 포함되어 있습니다.');
              return;
          }
          // comments 배열(구조화된 상태)에서 해당 댓글 또는 대댓글 찾기
          let targetComment = null;

          // 부모 댓글 중에서 찾기
          targetComment = comments.find(c => String(c.id) === String(commentId));

          // 부모 댓글이 아니면 대댓글 중에서 찾기
          if (!targetComment) {
              for (const c of comments) {
                  targetComment = c.replies?.find(r => String(r.id) === String(commentId));
                  if (targetComment) {
                      break;
                  }
              }
          }

          if (!targetComment) {
              console.error('수정하려는 댓글/대댓글을 찾을 수 없음:', commentId);
              alert('댓글을 찾을 수 없습니다.');
              return;
          }

          // 백엔드로 보낼 payload 구성 (commentGroupId 포함)
          const payload = {
              commentId: Number(commentId),
              commentGroupId: Number(targetComment.commentGroupId), // 찾은 댓글의 commentGroupId 사용
              content: content
          };
          console.log('수정 payload:', payload);
          const response = await axios.put(
              `${process.env.REACT_APP_LOCAL_BACKEND_COMMUNITY_URI}/comment/${commentId}`,
              payload,
              {
                  withCredentials: true,
                  headers: {
                      'Content-Type': 'application/json'
                  }
              }
          );

          // 상태 직접 업데이트 (재조회 없이)
          setComments(prevComments =>
              prevComments.map(comment => {
                  if (String(comment.id) === String(commentId)) {
                       // 부모 댓글 수정
                      return { ...comment, content: response.data.content || content };
                  }
                  if (comment.replies) {
                       // 대댓글 수정
                      return {
                          ...comment,
                          replies: comment.replies.map(reply =>
                              String(reply.id) === String(commentId)
                                  ? { ...reply, content: response.data.content || content }
                                  : reply
                          )
                      };
                  }
                  return comment;
              })
          );

          setEditingCommentId(null);
          setEditingContent("");
          setShowCommentMenu(null);
          setShowReplyMenu(null); // 대댓글 메뉴도 닫음

      } catch (error) {
          console.error('댓글 수정 중 오류:', error);
          alert('댓글 수정 중 오류가 발생했습니다.');
      } finally {
          setIsSubmitting(false);
      }
  };

  // 댓글 삭제
  const handleDeleteComment = async (commentId) => {
      console.log('handleDeleteComment - 삭제 시도 Comment ID:', commentId);
      if (!window.confirm('댓글을 삭제하시겠습니까?')) return;
      try {
          // 부모 댓글인지 답글인지 확인
          const parentComment = comments.find(c => String(c.id) === String(commentId));
          const isParentComment = !!parentComment;

          if (!isParentComment) {
              // 답글인 경우, 부모 댓글 찾기
              const parentWithReply = comments.find(c => 
                  c.replies && c.replies.some(r => String(r.id) === String(commentId))
              );
              
              if (!parentWithReply) {
                  console.error('삭제하려는 댓글/대댓글을 찾을 수 없음:', commentId);
                  alert('댓글을 찾을 수 없습니다.');
                  return;
              }

              const targetReply = parentWithReply.replies.find(r => String(r.id) === String(commentId));
              if (!targetReply) {
                  console.error('답글을 찾을 수 없음:', commentId);
                  return;
              }

              const payload = {
                  commentId: Number(commentId),
                  commentGroupId: Number(targetReply.commentGroupId)
              };

              await axios.patch(
                  `${process.env.REACT_APP_LOCAL_BACKEND_COMMUNITY_URI}/comment/${commentId}`,
                  payload,
                  {
                      withCredentials: true,
                      headers: {
                          'Content-Type': 'application/json'
                      }
                  }
              );

              // 상태 업데이트 - 답글만 제거
              setComments(prevComments =>
                  prevComments.map(comment => {
                      if (String(comment.id) === String(parentWithReply.id)) {
                          return {
                              ...comment,
                              replies: comment.replies.filter(reply => String(reply.id) !== String(commentId))
                          };
                      }
                      return comment;
                  })
              );

          } else {
              // 부모 댓글인 경우 기존 로직 유지
              if (!parentComment.commentGroupId) {
                  throw new Error('댓글 그룹 ID를 찾을 수 없습니다.');
              }

              const payload = {
                  commentId: Number(commentId),
                  commentGroupId: Number(parentComment.commentGroupId)
              };

              await axios.patch(
                  `${process.env.REACT_APP_LOCAL_BACKEND_COMMUNITY_URI}/comment/${commentId}`,
                  payload,
                  {
                      withCredentials: true,
                      headers: {
                          'Content-Type': 'application/json'
                      }
                  }
              );

              // 상태 업데이트 - 부모 댓글과 그 답글들 모두 제거
              setComments(prevComments =>
                  prevComments.filter(comment => String(comment.id) !== String(commentId))
              );
          }

          setShowCommentMenu(null);
          setShowReplyMenu(null);
          console.log('handleDeleteComment - 댓글 삭제 성공 (클라이언트 상태 업데이트 완료): ID', commentId);

      } catch (error) {
          console.error('댓글 삭제 중 오류:', error);
          alert('댓글 삭제 중 오류가 발생했습니다.');
      }
  };


  const handleEditReply = (commentId, replyId, content) => {
      console.log('handleEditReply parentCommentId:', commentId, 'replyId:', replyId);
      console.log('handleEditReply content:', content);
      console.log('Type of setEditingCommentId:', typeof setEditingCommentId);
      console.log('Type of setEditingContent:', typeof setEditingContent);
      setEditingCommentId(`${commentId}_${replyId}`);
      setEditingContent(content);
      setShowReplyMenu(null);
  };

  const handleSaveEditReply = async (commentId, replyId) => {
      console.log('handleSaveEditReply parentCommentId:', commentId, 'replyId:', replyId); // commentId는 부모 ID
      console.log('Type of setEditingCommentId:', typeof setEditingCommentId);
      console.log('Type of setEditingContent:', typeof setEditingContent);
      if (isSubmitting) return;
      try {
          setIsSubmitting(true);
          const hasProfanity = await checkProfanity(editingContent);
          if (hasProfanity.isCurse) {
              alert('비속어가 포함되어 있습니다.');
              return;
          }
          // comments 배열(구조화된 상태)에서 해당 대댓글 찾기
          let targetReply = null;
           // comments는 부모 댓글 목록. 각 부모 댓글의 replies 배열에서 대댓글 찾기.
          const parentComment = comments.find(c => String(c.id) === String(commentId)); // 부모 댓글 찾기
          if (parentComment && parentComment.replies) {
               targetReply = parentComment.replies.find(r => String(r.id) === String(replyId)); // 부모의 replies에서 대댓글 찾기
          }


          if (!targetReply) {
               console.error('수정하려는 대댓글을 찾을 수 없음:', replyId);
               alert('대댓글을 찾을 수 없습니다.');
               return;
          }

          // 백엔드로 보낼 payload 구성 (commentGroupId 포함)
          const payload = {
              commentId: Number(replyId),
              commentGroupId: Number(targetReply.commentGroupId), // 찾은 대댓글의 commentGroupId 사용
              content: editingContent
          };
          console.log('대댓글 수정 payload:', payload);
          const response = await axios.put(
              `${process.env.REACT_APP_LOCAL_BACKEND_COMMUNITY_URI}/comment/${replyId}`,
              payload,
              {
                  withCredentials: true,
                  headers: {
                      'Content-Type': 'application/json'
                  }
              }
          );

          // 상태 직접 업데이트 (재조회 없이)
          setComments(prevComments =>
              prevComments.map(comment => {
                  if (String(comment.id) === String(commentId) && comment.replies) { // 해당 부모 댓글을 찾고 replies가 있는지 확인
                      return {
                          ...comment,
                          replies: comment.replies.map(reply =>
                              String(reply.id) === String(replyId) // 수정하려는 대댓글 ID와 일치
                                  ? { ...reply, content: response.data.content || editingContent } // 대댓글 내용 업데이트
                                  : reply // 일치하지 않으면 원래 대댓글 객체 반환
                          )
                      };
                  }
                  return comment; // 해당 부모 댓글이 아니면 원래 comment 객체 반환
              })
          );


          setEditingCommentId(null);
          setEditingContent("");
          setShowReplyMenu(null);

      } catch (error) {
          console.error('대댓글 수정 중 오류:', error);
          alert('대댓글 수정 중 오류가 발생했습니다.');
      } finally {
          setIsSubmitting(false);
      }
  };

  const handleDeleteReply = async (commentId, replyId) => {
      console.log('handleDeleteReply - 삭제 시도 Parent Comment ID:', commentId, 'Reply ID:', replyId);
      if (!window.confirm('답글을 삭제하시겠습니까?')) return;
      try {
           // comments 배열(구조화된 상태)에서 해당 대댓글 찾기
           let targetReply = null;
           const parentComment = comments.find(c => String(c.id) === String(commentId)); // 부모 댓글 찾기
           if (parentComment && parentComment.replies) {
                targetReply = parentComment.replies.find(r => String(r.id) === String(replyId)); // 부모의 replies에서 대댓글 찾기
           }

           if (!targetReply) {
                console.error('삭제하려는 대댓글을 찾을 수 없음:', replyId);
                alert('대댓글을 찾을 수 없습니다.');
                return;
           }

           // 백엔드로 보낼 payload 구성 (commentGroupId 포함)
           const payload = {
               commentId: Number(replyId),
               commentGroupId: Number(targetReply.commentGroupId), // 찾은 대댓글의 commentGroupId 사용
               
           };
           await axios.patch(
               `${process.env.REACT_APP_LOCAL_BACKEND_COMMUNITY_URI}/comment/${replyId}`,
               payload,
               {
                   withCredentials: true,
                   headers: {
                       'Content-Type': 'application/json'
                   }
               }
           );

           setComments(prevComments =>
               prevComments.map(comment => {
                   if (String(comment.id) === String(commentId) && comment.replies) { // 해당 부모 댓글을 찾고 replies가 있는지 확인
                       return {
                           ...comment,
                           replies: comment.replies.filter(reply => String(reply.id) !== String(replyId)) // 삭제하려는 대댓글 제외
                       };
                   }
                   return comment; // 해당 부모 댓글이 아니면 원래 comment 객체 반환
               })
           );

           setShowReplyMenu(null);
           console.log('handleDeleteReply - 답글 삭제 성공 (클라이언트 상태 업데이트 완료): Reply ID', replyId);

       } catch (error) {
           console.error('대댓글 삭제 중 오류:', error);
           alert('대댓글 삭제 중 오류가 발생했습니다.');
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
          const response = await axios.patch(
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

  console.log('5. 현재 comments 상태 변수 (렌더링 직전):', comments); // 5. 렌더링 시점의 상태 확인

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
                               if (!e.target.src.includes('default.png')) {
                                   e.target.onerror = null;
                                   e.target.src = `${process.env.PUBLIC_URL}/profile/default.png`;
                               }
                           }}
                      />
                      <span className={styles.profileName}>{post.writerNickname}</span>
                      {isAuthor() && (
                          <div className={styles.menuWrapper}>
                              <button className={styles.menuButton} onClick={toggleMenu}>⋮</button>
                              {showMenu && (
                                  <div className={styles.menuPopup}>
                                      <div className={styles.menuItem} onClick={handleEdit}>수정하기</div>
                                      <div className={`${styles.menuItem} ${styles.activated}`}
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
                      <div key={c.id} id={`comment-${c.id}`} className={styles.commentItem}>
                          {/* 부모 댓글 렌더링 */}
                          <div className={styles.commentTop}>
                              <div className={styles.commentProfile}>
                                  <img 
                                      className={styles.commentProfileImg} 
                                      src={(c.profileImg || c.writerProfileImage) ?? `${process.env.PUBLIC_URL}/profile/default.png`} 
                                       alt="프로필"
                                       onError={e => {
                                          if (!e.target.src.includes("default.png")) {
                                           e.target.onerror = null;
                                           e.target.src = `${process.env.PUBLIC_URL}/profile/default.png`;
                                         }
                                       }}
                                  />
                                  <span className={styles.commentAuthor}>{c.author}</span>
                              </div>
                              <div className={styles.commentRight}>
                                  <span className={styles.commentTime}>{c.time}</span>
                                  {isCommentAuthor(c.authorId) && (
                                      <div className={styles.menuWrapper}>
                                          <button
                                              onClick={() => setShowCommentMenu(showCommentMenu === c.id ? null : c.id)}
                                              className={styles.menuButton}
                                          >
                                              ⋮
                                          </button>
                                          {showCommentMenu === c.id && (
                                              <div className={styles.menuPopup}>
                                                  <div 
                                                      className={styles.menuItem} 
                                                       onClick={() => {
                                                          console.log("수정하기 클릭, c.content:", c.content);
                                                          console.log("Type of setEditingContent inside onClick:", typeof setEditingContent);
                                                           setEditingCommentId(c.id);
                                                           setEditingContent(c.content);
                                                           setShowCommentMenu(null);
                                                      }}
                                                  >
                                                      수정하기
                                                  </div>
                                                  <div 
                                                      className={styles.menuItem} 
                                                      onClick={() => handleDeleteComment(c.id)}
                                                  >
                                                      삭제하기
                                                  </div>
                                              </div>
                                          )}
                                      </div>
                                  )}
                              </div>
                          </div>
                          {editingCommentId === c.id ? (
                              <div className={styles.editBox}>
                                  <input
                                      value={editingContent}
                                      onChange={e => {
                                          console.log("input onChange - editingContent:", editingContent, "c.content:", c.content, "e.target.value:", e.target.value);
                                          console.log("Type of setEditingContent inside input onChange:", typeof setEditingContent);
                                          setEditingContent(e.target.value);
                                      }}
                                  />
                                  <button 
                                      onClick={() => {
                                          console.log("저장 클릭 - editingContent:", editingContent);
                                          console.log("Type of setEditingContent inside save onClick:", typeof setEditingContent);
                                      handleEditComment(c.id, editingContent);
                                      }}
                                  >
                                      저장
                                  </button>
                              </div>
                          ) : (
                              <div className={styles.commentContent}>{c.content}</div>
                          )}
                          {/* 답글쓰기 버튼 */}
                          <div className={styles.replyWriteRow}>
                              <button 
                                  className={styles.replyBtn} 
                                  onClick={() => {
                                  setReplyTo(String(c.id));
                                  setTimeout(() => {
                                      commentInputRef.current?.focus();
                                  }, 0);
                                  }}
                              >
                                  답글쓰기
                              </button>
                          </div>

                          {/* 답글 입력창 */}
                          {replyTo === String(c.id) && (
                              <div className={styles.replyInputBox}>
                                  <input
                                      className={styles.commentInput}
                                      value={replyInputValue[String(c.id)] || ''}
                                      onChange={e => setReplyInputValue({ ...replyInputValue, [String(c.id)]: e.target.value })}
                                      placeholder="답글을 입력하세요"
                                      ref={commentInputRef}
                                  />
                                  <button 
                                      className={styles.sendBtn} 
                                      onClick={handleAddComment}
                                      disabled={isSubmitting}
                                  >
                                      <img 
                                          src={`${process.env.PUBLIC_URL}/Button/paperplane.png`} 
                                          alt="전송" 
                                          width={24}
                                      />
                                  </button>
                              </div>
                          )}

                          {/* 대댓글 목록 */}
                          <div className={styles.replySection}>
                              {c.replies && c.replies.map(r => (
                                  <div key={r.id} id={`comment-${r.id}`} className={styles.replyItem}>
                                      <div className={styles.replyRow}>
                                          <div className={styles.commentProfile}>
                                              <img 
                                                  className={styles.commentProfileImg}
                                                  src={(r.profileImg || r.writerProfileImage) ?? `${process.env.PUBLIC_URL}/profile/default.png`}
                                                   alt="프로필"
                                                   onError={e => {
                                                      if (!e.target.src.includes("default.png")) {
                                                       e.target.onerror = null;
                                                       e.target.src = `${process.env.PUBLIC_URL}/profile/default.png`;
                                                     }
                                                   }}
                                              />
                                              <span className={styles.commentAuthor}>{r.author}</span>
                                          </div>
                                          <div className={styles.commentRight}>
                                              <span className={styles.commentTime}>{r.time}</span>
                                              {isCommentAuthor(r.authorId) && (
                                                  <div className={styles.menuWrapper}>
                                                      <button
                                                          onClick={() => setShowReplyMenu(showReplyMenu === `${c.id}_${r.id}` ? null : `${c.id}_${r.id}`)}
                                                          className={styles.menuButton}
                                                      >
                                                          ⋮
                                                      </button>
                                                      {showReplyMenu === `${c.id}_${r.id}` && (
                                                          <div className={styles.menuPopup}>
                                                              <div 
                                                                  className={styles.menuItem}
                                                                  onClick={() => handleEditReply(c.id, r.id, r.content)}
                                                              >
                                                                  수정하기
                                                              </div>
                                                              <div 
                                                                  className={styles.menuItem}
                                                                  onClick={() => handleDeleteReply(c.id, r.id)}
                                                              >
                                                                  삭제하기
                                                              </div>
                                                          </div>
                                                      )}
                                                  </div>
                                              )}
                                          </div>
                                      </div>
                                      {editingCommentId === `${c.id}_${r.id}` ? (
                                          <div className={styles.editBox}>
                                              <input 
                                                  value={editingContent}
                                                  onChange={e => setEditingContent(e.target.value)}
                                              />
                                              <button onClick={() => handleSaveEditReply(c.id, r.id)}>
                                                  저장
                                              </button>
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
              {/* 댓글 입력창(일반 댓글용)은 replyTo가 null일 때만 하단에 노출 */}
              {replyTo === null && (
                  <div className={styles.commentInputBox}>
                      <input
                          ref={commentInputRef}
                          className={styles.commentInput}
                          value={comment}
                          onChange={e => setComment(e.target.value)}
                          placeholder="댓글을 남겨보세요"
                      />
                      <button 
                          className={styles.sendBtn} 
                          onClick={handleAddComment}
                          disabled={isSubmitting}
                      >
                          <img 
                              src={`${process.env.PUBLIC_URL}/Button/paperplane.png`} 
                              alt="전송" 
                              width={24}
                          />
                      </button>
                  </div>
              )}
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