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

  const fetchPost = async () => {
    const teamParam = team || post?.team;
    if (!teamParam || !postId) return;
    try {
        const res = await axios.get(
            `${process.env.REACT_APP_LOCAL_BACKEND_COMMUNITY_URI}/post/${teamParam}/${postId}`,
            { withCredentials: true }
        );
        let postData = { ...res.data, id: res.data.postId || res.data.id };

        console.log('1. 백엔드로부터 받은 원본 postData (댓글 포함):', res.data); // 1. 백엔드 원본 데이터 확인

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
            console.log('2. 댓글 구조화 시작 전 원본 댓글 배열:', postData.comments); // 2. 구조화 전 배열 확인

            // 1차 순회: commentGroupId 별로 댓글 그룹화 및 닉네임 처리
            const fetchNicknamePromises = postData.comments.map(async comment => {
                const commentId = comment.id || comment.commentId;
                const commentGroupId = comment.commentGroupId;

                 if (commentId === undefined || commentId === null || commentGroupId === undefined || commentGroupId === null) {
                    console.warn('댓글에 필수 필드(id, commentGroupId)가 없습니다:', comment);
                    return null; // 필수 필드가 없는 댓글은 건너뛰고 null 반환
                }

                let writerNickname = comment.writerNickname || comment.author; // 백엔드 필드 사용
                let authorId = comment.writerId || comment.authorId; // 백엔드 필드 사용

                // writerNickname이 User#숫자 형태인지 확인하고 실제 닉네임 가져오기
                const match = writerNickname && String(writerNickname).match(/^User#(\d+)$/);
                if (match) {
                    const idFromNickname = match[1];
                    authorId = authorId || idFromNickname; // writerId가 없으면 User#숫자의 숫자를 authorId로 사용
                    if (authorId) {
                         try {
                            const userRes = await axios.get(
                                `${process.env.REACT_APP_LOCAL_BACKEND_URI}/user/profile/${authorId}`,
                                { withCredentials: true }
                            );
                            writerNickname = userRes.data.nickname; // 실제 닉네임으로 업데이트
                        } catch (e) {
                            console.error(`댓글 작성자 프로필 API 실패 (ID: ${authorId}):`, e);
                            // 실패 시 기존 User#숫자 형태 유지
                        }
                    }
                }

                const processedComment = {
                    ...comment, // 원본 필드 복사
                    id: commentId,
                    commentGroupId: commentGroupId,
                    // 필요한 다른 필드 매핑 (postId, content 등)
                    postId: comment.postId || Number(postId),
                    content: comment.content || comment.body || comment.text || '',
                    author: writerNickname, // 업데이트된 닉네임 사용
                    authorId: authorId,     // authorId 사용
                    time: comment.time,
                    replies: [] // replies 배열 초기화
                };

                return processedComment; // 처리된 댓글 객체 반환
            });

            // 모든 닉네임 정보가 로딩될 때까지 대기
            const processedComments = (await Promise.all(fetchNicknamePromises)).filter(comment => comment !== null); // null 필터링

            // commentGroupId 별로 댓글 그룹화
            const commentsByGroup = new Map(); // commentGroupId -> [comments in this group] 매핑
            const structuredComments = []; // 최종 구조화될 댓글 목록 (부모 댓글만 포함)

            processedComments.forEach(comment => {
                const commentGroupId = comment.commentGroupId;
                 if (!commentsByGroup.has(commentGroupId)) {
                    commentsByGroup.set(commentGroupId, []);
                }
                commentsByGroup.get(commentGroupId).push(comment);
            });

            // 2차 순회: 각 그룹 내에서 부모와 자식 구분 및 연결
            commentsByGroup.forEach(commentGroup => {
                // commentGroup 배열의 첫 번째 댓글을 부모 댓글로 간주
                const parentCommentCandidate = commentGroup[0];

                if (parentCommentCandidate) {
                    // 부모 댓글 후보를 구조화된 목록에 추가
                    const parentComment = {
                        ...parentCommentCandidate,
                        replies: [] // 부모 댓글의 replies 초기화
                    };
                    structuredComments.push(parentComment);

                    // 나머지 댓글들을 해당 부모의 답글로 연결
                    for (let i = 1; i < commentGroup.length; i++) {
                        parentComment.replies.push(commentGroup[i]);
                    }
                } else {
                    console.warn('댓글 그룹에 댓글이 없습니다:', commentGroup);
                }
                 // 각 그룹 내 답글들은 필요시 시간 순 등으로 정렬 가능 (현재는 백엔드에서 넘어온 순서 유지)
                 // parentComment.replies.sort((a, b) => new Date(a.time) - new Date(b.time));
            });

            // 최종 구조화된 댓글 목록 (부모 댓글 목록)을 원래 댓글 배열처럼 보이게
            // commentGroupId 또는 부모 댓글의 ID/시간 기준으로 정렬
            const finalStructuredComments = structuredComments.sort((a, b) => (a.commentGroupId || 0) - (b.commentGroupId || 0)); // commentGroupId 기준으로 정렬 (필요시 time 등으로 변경)


            console.log('3. 프론트 구조화된 최종 댓글 데이터 (setComments에 전달될 값):', finalStructuredComments); // 3. 구조화 후 배열 확인
            postData.comments = finalStructuredComments; // 구조화된 목록으로 교체

        } else {
             console.log('백엔드 응답에 comments 배열이 없거나 Array가 아닙니다.'); // comments 배열이 없는 경우
             postData.comments = []; // comments가 없으면 빈 배열로 설정
        }

        setPost(postData);
        setComments(postData.comments || []); // 받은 (구조화된) 데이터로 무조건 상태 업데이트, 없으면 빈 배열

        console.log('4. fetchPost 완료 - setComments 호출됨'); // 4. setComments 호출 확인

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

          if (replyTo !== null && replyTo !== undefined && replyTo !== '') {
              const parentComment = comments.find(c => String(c.id) === String(replyTo)); // 구조화된 comments에서 부모 찾기
              console.log('답글 작성 - 부모 댓글 정보:', {
                  replyTo,
                  parentComment,
                  found: !!parentComment,
                  commentGroupId: parentComment?.commentGroupId // 부모의 commentGroupId 사용
              });
              if (parentComment?.commentGroupId) {
                  payload.commentGroupId = Number(parentComment.commentGroupId);
              } else {
                  console.error('답글 작성 실패 - 부모 댓글의 commentGroupId를 찾을 수 없음');
                  alert('답글 작성에 실패했습니다. 페이지를 새로고침 후 다시 시도해주세요.');
                  return;
              }
          } else {
              // 일반 댓글인 경우, commentGroupId를 백엔드에서 생성하도록 payload에서 제외
              // payload에 commentGroupId를 포함하면 백엔드에서 기존 그룹에 추가하려 할 수 있음
              // 백엔드에서 일반 댓글 저장 시 새로운 commentGroupId를 생성해야 함.
              // payload.commentGroupId = null; // 명시적으로 null 전달 시도 (백엔드 API에 따라 다름)
              delete payload.commentGroupId; // payload에서 제거하여 백엔드에서 새로 생성하도록 유도
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

          // 댓글 작성 성공 후에는 전체 댓글 목록을 다시 불러와서 화면 갱신
          // 백엔드가 새 댓글 정보만 주거나 전체 목록을 주더라도, 프론트 구조화 로직을 다시 거치는 것이 가장 안전
          await fetchPost();

          if (replyTo) {
              setReplyInputValue({ ...replyInputValue, [String(replyTo)]: '' });
              setReplyTo(null);
          } else {
              setComment("");
          }


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
              console.error('삭제하려는 댓글/대댓글을 찾을 수 없음:', commentId);
              alert('댓글을 찾을 수 없습니다.');
              return;
          }

          if (!targetComment.commentGroupId) {
              throw new Error('댓글 그룹 ID를 찾을 수 없습니다.');
          }

          const payload = {
              commentId: Number(commentId),
              commentGroupId: Number(targetComment.commentGroupId), // 찾은 댓글의 commentGroupId 사용
            
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

          // 상태 직접 업데이트 (재조회 없이)
          setComments(prevComments =>
              prevComments.reduce((acc, comment) => {
                  if (String(comment.id) === String(commentId)) {
                      // 부모 댓글 삭제: 해당 댓글 그룹 전체를 제거
                      // 해당 댓글(comment)을 acc에 추가하지 않음으로써 삭제 효과
                      return acc;
                  }
                  if (comment.replies) {
                      // 대댓글 삭제: 해당 대댓글만 replies 배열에서 제거
                      const initialReplyCount = comment.replies.length;
                      const updatedReplies = comment.replies.filter(reply => String(reply.id) !== String(commentId));

                      if (updatedReplies.length !== initialReplyCount) {
                           // 대댓글이 삭제되었으면 부모 댓글 객체를 업데이트된 replies와 함께 추가
                           acc.push({ ...comment, replies: updatedReplies });
                      } else {
                           // 현재 comment의 replies에 삭제하려는 대댓글이 없었으면 comment 객체 그대로 추가
                           acc.push(comment);
                      }
                       return acc;
                  }
                   // replies가 없는 부모 댓글 (구조화 로직 상 이 경우는 없어야 함)
                   // 혹시나 있다면 그대로 추가
                   acc.push(comment);
                   return acc;

              }, []) // 초기값 빈 배열
          );

          setShowCommentMenu(null);
          setShowReplyMenu(null); // 대댓글 메뉴도 닫음
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

           // 상태 직접 업데이트 (재조회 없이)
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
                      <div key={c.id} className={styles.commentItem}>
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
                                  <button className={styles.sendBtn} onClick={handleAddComment}>
                                      <img src={`${process.env.PUBLIC_URL}/Button/paperplane.png`} alt="전송" width="24" />
                                  </button>
                              </div>
                          )}

                          {/* 대댓글 목록 */}
                          <div className={styles.replySection}>
                              {c.replies && c.replies.map(r => (
                                  <div key={r.id} className={styles.replyItem}>
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
                      <button className={styles.sendBtn} onClick={handleAddComment}>
                          <img src={`${process.env.PUBLIC_URL}/Button/paperplane.png`} alt="전송" width={24}/>
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