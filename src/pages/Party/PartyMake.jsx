// 직관팟 작성 페이지
import React, {useRef, useState, useEffect} from 'react';
import axios from 'axios';
import PartyFormStep1 from '../../components/Form/PartyFormStep1';
import PartyFormStep2 from '../../components/Form/PartyFormStep2';
import Modal from '../../components/Modal/Modal'; // adjust path if necessary
import { useLocation, useParams, useNavigate } from 'react-router-dom';

const baseUrl = import.meta.env.VITE_LOCAL_BACKEND_TWP_URI;

const getCookie = (name) => {
    const cookies = document.cookie.split(';').map(cookie => cookie.trim());
    const found = cookies.find(cookie => cookie.startsWith(`${name}=`));
    return found ? found.split('=')[1] : null;
};

const PartyMake = () => {
    const location = useLocation();
    const { partyId } = useParams();
    const navigate = useNavigate();
    const isEditMode = location.pathname.includes('/party/edit');

    const [step, setStep] = useState(1);
    const [partyForm, setPartyForm] = useState({
        title: '',
        partyJoinMethod: '',
        partyGender: '',
        ageGroup: [],
        minimumParticipants: '',
        maximumParticipants: '',
        thumbnailImageNameList: [],
        message: '',
        matchId: 1,
    });

    const [modalVisible, setModalVisible] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [redirectId, setRedirectId] = useState(null);

    const imageFileRef = useRef();

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

    /*
    const checkProfanity = async (description) => {
        try {
            const response = await axios.post(
                "https://xrnfbckpskycrstm.tunnel.elice.io/detect",
                {sentence: description},
                {headers: {'Content-Type': 'application/json'}}
            );
            const raw = response.data.result
                .replace(/```json\n/, '')
                .replace(/`{3,}[\s\S]*$/, '')
                .trim();

            const parsed = JSON.parse(raw);
            const isCurse = String(parsed.is_curse).toLowerCase() === 'true';
            if (isCurse) {
                const detectedWords = parsed.words || [];
                setModalMessage(detectedWords.join(', '));
                return false;
            }
            return true;

        } catch (error) {
            console.error('비속어 필터링 오류:', error);
            return false;
        }
    };
    */

    const handleSubmit = async () => {
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
                await axios.put(`${baseUrl}/party/${partyId}`, payload, {
                    withCredentials: true,
                    headers: { 'Content-Type': 'application/json' },
                });
                setModalMessage('직관팟이 성공적으로 수정되었습니다!');
                setModalVisible(true);
            } else {
                const response = await axios.post(`${baseUrl}/party`, payload, {
                    withCredentials: true,
                    headers: { 'Content-Type': 'application/json' },
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
            {/*{modalVisible && (*/}
            {/*    <Modal*/}
            {/*        title="ABS봇이 작동중입니다."*/}
            {/*        message={*/}
            {/*            <>*/}
            {/*                ABS봇이 부적절한 키워드를 감지했습니다.*/}
            {/*                <br/>*/}
            {/*                작성글을 수정해 주세요.*/}
            {/*                <br/>*/}
            {/*                <br />*/}
            {/*                감지된 단어: {modalMessage}*/}
            {/*            </>*/}
            {/*        }*/}
            {/*        buttons={[*/}
            {/*            {label: '확인', onClick: () => setModalVisible(false)}*/}
            {/*        ]}*/}
            {/*        onClose={() => setModalVisible(false)}*/}
            {/*    />*/}
            {/*)}*/}
            {modalVisible && (
                <Modal
                    title="알림"
                    message={modalMessage}
                    buttons={[{ label: '확인', onClick: () => {
                        setModalVisible(false);
                        if (isEditMode) {
                            navigate(`/party/matchid/${partyId}`);
                        } else if (redirectId) {
                            navigate(`/party/matchid/${redirectId}`);
                        }
                    }}]}
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
