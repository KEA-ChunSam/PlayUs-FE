

import { useEffect, useRef, useState, useCallback } from 'react';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import axios from 'axios';

/**
 * useChatSocket
 * - roomId: 현재 채팅방 ID (URL 파라미터 등으로 전달)
 * - userId: 로그인된 내 사용자 ID
 *
 * 반환값:
 *   isConnected    : WebSocket 연결 상태 (boolean)
 *   messages       : 서버로부터 실시간으로 들어오는 메시지 배열
 *   participants   : (선택) 참여자 리스트나 count
 *   sendMessage    : WS로 메시지를 보내는 함수
 *   leaveChatRoom  : 채팅방 나가기 처리 함수 (EXIT 메시지, 구독 해제, REST API 호출)
 *   error          : 연결 또는 구독 중 발생한 오류
 */
export function useChatSocket(roomId, userId) {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [error, setError] = useState(null);

  const stompClientRef = useRef(null);
  const subscriptionRef = useRef(null);
  const hasEnteredRef = useRef(false);

  // WS 엔드포인트 설정 (http -> ws로 변경)
    const WS_URL = `${process.env.REACT_APP_LOCAL_BACKEND_TWP_URI}/ws`;
  const WS_SUBSCRIBE_DEST = `/sub/chat/room/${roomId}`;
  const WS_PUBLISH_DEST   = `/pub/chat/message`;
  const CHAT_EXIT_API     = `${process.env.REACT_APP_LOCAL_BACKEND_TWP_URI}/chat/${roomId}`; // DELETE

  /**
   * 실시간 메시지 구독 함수
   */
  const subscribeToChat = useCallback((client) => {
    if (!client || !client.connected || subscriptionRef.current) return;

    try {
      const sub = client.subscribe(WS_SUBSCRIBE_DEST, (frame) => {
        const raw = JSON.parse(frame.body);
        setMessages(prev => [...prev, raw]);

        // ENTER/EXIT 메시지면 참여자 정보를 다시 가져오거나 카운트 갱신 가능
        // 예) setParticipants(updatedList)
      });

      subscriptionRef.current = sub;
      setError(null);

      // 최초 ENTER 메시지 전송
      if (!hasEnteredRef.current) {
        client.send(
          WS_PUBLISH_DEST,
          {},
          JSON.stringify({
            roomId,
            senderId: userId,
            message: '',
            messageType: 'ENTER'
          })
        );
        hasEnteredRef.current = true;
      }
    } catch (e) {
      console.error('구독 에러:', e);
      setError('채팅방 구독에 실패했습니다.');
    }
  }, [roomId, userId]);

  /**
   * WS 연결 및 STOMP 초기화
   */
  const initializeWebSocket = useCallback(() => {
    if (stompClientRef.current && stompClientRef.current.connected) {
      if (subscriptionRef.current) return;
      return subscribeToChat(stompClientRef.current);
    }

    const socket = new SockJS(WS_URL);
    const client = Stomp.over(socket);
    client.debug = () => {};
    stompClientRef.current = client;

    client.connect(
      { Cookie: document.cookie },
      () => {
        setIsConnected(true);
        subscribeToChat(client);
      },
      (err) => {
        console.error('STOMP 연결 에러:', err);
        setIsConnected(false);
        setError('채팅 서버 연결에 실패했습니다.');
      }
    );
  }, [WS_URL, subscribeToChat]);

  /**
   * 구독 해제 및 연결 해제 + EXIT 메시지 전송 + REST API 호출
   */
  const handleExitChat = useCallback(async () => {
    try {
      // 1) 구독 해제
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }

      // 2) EXIT 메시지 전송
      if (stompClientRef.current && stompClientRef.current.connected) {
        stompClientRef.current.send(
          WS_PUBLISH_DEST,
          {},
          JSON.stringify({
            roomId,
            senderId: userId,
            message: '',
            messageType: 'EXIT'
          })
        );
        stompClientRef.current.disconnect(() => {
          stompClientRef.current = null;
          setIsConnected(false);
        });
      }

      hasEnteredRef.current = false;
    } catch (e) {
      console.error('웹소켓 연결 해제 에러:', e);
      setError('채팅방 연결 해제 중 오류가 발생했습니다.');
    } finally {
      // 3) 백엔드 REST API 호출: 참여자 삭제 처리
      try {
        await axios.delete(CHAT_EXIT_API, { withCredentials: true });
      } catch (apiErr) {
        console.error('채팅방 나가기 API 에러:', apiErr);
      }
    }
  }, [roomId, userId, CHAT_EXIT_API]);

  /**
   * WS를 통해 채팅 메시지 보냄 (TALK)
   */
  const sendMessage = useCallback((text) => {
    if (!stompClientRef.current || !stompClientRef.current.connected) {
      console.warn('메시지 전송 실패: WebSocket 연결이 없습니다.');
      return;
    }
    if (!text || text.trim() === '') return;

    const payload = {
      roomId,
      senderId: userId,
      senderName: '', // 필요 시 사용자의 닉네임 할당
      message: text.trim(),
      messageType: 'TALK'
    };

    try {
      stompClientRef.current.publish({
        destination: WS_PUBLISH_DEST,
        body: JSON.stringify(payload)
      });
    } catch (e) {
      console.error('메시지 전송 예외:', e);
      setError('메시지를 전송하지 못했습니다.');
    }
  }, [roomId, userId]);

  /**
   * 주기적으로 연결/구독 상태 체크 후 재시도
   */
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (!stompClientRef.current || !stompClientRef.current.connected) {
        initializeWebSocket();
      } else if (stompClientRef.current.connected && !subscriptionRef.current) {
        subscribeToChat(stompClientRef.current);
      }
    }, 30000);

    return () => clearInterval(intervalId);
  }, [initializeWebSocket, subscribeToChat]);

  /**
   * 마운트/언마운트 시 소켓 연결 및 해제
   */
  useEffect(() => {
    initializeWebSocket();
    return () => {
      handleExitChat();
    };
  }, [initializeWebSocket, handleExitChat]);

  return {
    isConnected,
    messages,
    participants,
    sendMessage,
    leaveChatRoom: handleExitChat,
    error
  };
}