// 직관팟 작성 페이지
import React, {useEffect, useRef, useState} from 'react';
import axios from 'axios';
import PartyFormStep1 from '../../components/Form/PartyFormStep1';
import PartyFormStep2 from '../../components/Form/PartyFormStep2';
import Modal from '../../components/Modal/Modal'; // adjust path if necessary
import {useLocation, useNavigate, useParams} from 'react-router-dom';

const getCookie = (name) => {
    const cookies = document.cookie.split(';').map(cookie => cookie.trim());
    const found = cookies.find(cookie => cookie.startsWith(`${name}=`));
    return found ? found.split('=')[1] : null;
};

const PartyMake = () => {
    const location = useLocation();
    const receivedMatchId = location.state?.matchId;
    const {partyId} = useParams();
    const navigate = useNavigate();
    const isEditMode = location.pathname.includes('/party/edit');

    const [step, setStep] = useState(1);

    const [partyName, setPartyName] = useState('');

    const [partyForm, setPartyForm] = useState({
        title: '',
        partyJoinMethod: '',
        partyGender: '',
        ageGroup: [],
        minimumParticipants: '',
        maximumParticipants: '',
        thumbnailImageNameList: [],
        message: '',
        matchId: location.state?.matchId || 1,
    });

    const [modalVisible, setModalVisible] = useState(false);
    const [detectModalVisible, setDetectModalVisible] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [redirectId, setRedirectId] = useState(null);

    const imageFileRef = useRef();

    useEffect(() => {
        if (receivedMatchId) {
            // matchId 전달 확인
        } else {
            // matchId 없음 경고
        }
    }, [receivedMatchId]);

    useEffect(() => {
        if (isEditMode && location.state) {
            const party = location.state;
            setPartyForm({
                title: party.title || '',
                partyJoinMethod: party.partyJoinMethod || '',
                partyGender: party.partyGender || '',
                ageGroup: party.partyAges || [],
                minimumParticipants: party.minimumParticipantsCount?.toString() || '',
                maximumParticipants: party.maximumParticipantsCount?.toString() || '',
                thumbnailImageNameList: [],
                message: party.message || '',
                matchId: party.matchId || 1,
            });
        }
    }, [isEditMode, location.state]);

    const handleImageUpload = async () => {
        // This function is no longer used for immediate upload
    };


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
            // 비속어 필터링 오류 처리
            return { isCurse: false, words: [] };
        }
    };


    const handleSubmit = async () => {
        const { isCurse, words } = await checkProfanity(partyForm.message);
        if (isCurse) {
            setModalMessage(words.join(', '));
            setDetectModalVisible(true);
            return;
        }

        const uploadedFileNames = ["default.png"];

        const payload = {
            ...(isEditMode && {
                partyId: parseInt(partyId),
                writerId: location.state?.writerId
            }),
            title: partyForm.title,
            partyJoinMethod: partyForm.partyJoinMethod,
            partyGender: partyForm.partyGender,
            ageGroup: partyForm.ageGroup,
            minimumParticipants: parseInt(partyForm.minimumParticipants),
            maximumParticipants: parseInt(partyForm.maximumParticipants),
            thumbnailImageNameList: uploadedFileNames, // This field is still named thumbnailUrl in payload
            message: partyForm.message,
            matchId: partyForm.matchId,
        };

        try {
            if (isEditMode) {
                await axios.put(`${process.env.REACT_APP_LOCAL_BACKEND_TWP_URI}/party/${partyId}`, payload, {
                    withCredentials: true,
                    headers: {'Content-Type': 'application/json'},
                });
                setModalMessage('직관팟이 성공적으로 수정되었습니다!');
                setModalVisible(true);
            } else {
                const response = await axios.post(`${process.env.REACT_APP_LOCAL_BACKEND_TWP_URI}/party`, payload, {
                    withCredentials: true,
                    headers: {'Content-Type': 'application/json'},
                });
                const newPartyId = response.data.partyId;
                setRedirectId(newPartyId);
                setModalMessage('직관팟이 성공적으로 생성되었습니다!');
                setModalVisible(true);
            }
        } catch (err) {
            setModalMessage(`${isEditMode ? '수정' : '생성'} 실패: ` + err.message);
            setModalVisible(true);
        }
    };

    return (
        <>
            {/*<input type="file" ref={imageFileRef}/>*/}
            {/*<button type="button" onClick={handleImageUpload}>이미지 업로드</button>*/}
            {step === 1 ? (
                <PartyFormStep1
                    form={partyForm}
                    setForm={setPartyForm}
                    onNext={() => setStep(2)}
                />
            ) : (
                <PartyFormStep2
                    form={partyForm}
                    setForm={setPartyForm}
                    onSubmit={handleSubmit}
                />
            )}
            {detectModalVisible && (
                <Modal
                    title="ABS봇이 작동중입니다."
                    message={
                        <>
                            ABS봇이 부적절한 키워드를 감지했습니다.
                            <br/>
                            작성글을 수정해 주세요.
                            <br/>
                            <br/>
                            감지된 단어: {modalMessage}
                        </>
                    }
                    buttons={[
                        {label: '확인', onClick: () => setDetectModalVisible(false)}
                    ]}
                    onClose={() => setDetectModalVisible(false)}
                />
            )}
            {modalVisible && (
                <Modal
                    title="알림"
                    message={modalMessage}
                    buttons={[{
                        label: '확인', onClick: () => {
                            setModalVisible(false);
                            if (isEditMode) {
                                navigate(`/party/matchid/${partyId}`);
                            } else if (redirectId) {
                                navigate(`/party/matchid/${redirectId}`);
                            }
                        }
                    }]}
                    onClose={() => {
                        setModalVisible(false);
                        if (isEditMode) {
                            navigate(`/party/matchid/${partyId}`);
                        } else if (redirectId) {
                            navigate(`/party/matchid/${redirectId}`);
                        }
                    }}
                />
            )}
        </>
    );
};

export default PartyMake;
