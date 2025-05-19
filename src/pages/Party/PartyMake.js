// 직관팟 작성 페이지
import React, {useRef, useState} from 'react';
import axios from 'axios';
import PartyFormStep1 from '../../components/Form/PartyFormStep1';
import PartyFormStep2 from '../../components/Form/PartyFormStep2';
import Modal from '../../components/Modal/Modal'; // adjust path if necessary

const getCookie = (name) => {
    const cookies = document.cookie.split(';').map(cookie => cookie.trim());
    const found = cookies.find(cookie => cookie.startsWith(`${name}=`));
    return found ? found.split('=')[1] : null;
};

const PartyMake = () => {
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

    const imageFileRef = useRef();

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
        /*
        setModalMessage('');
        const isClean = await checkProfanity(partyForm.message);
        if (!isClean) {
            setModalVisible(true);
            return;
        }
        */

        const uploadedFileNames = [];

        for (const file of partyForm.thumbnailImageNameList) {
            if (typeof file === 'string') {
                uploadedFileNames.push(file); // already uploaded
                continue;
            }

            const { data } = await axios.post('http://localhost:8081/party/presigned-url', {
                imageFileName: file.name,
            }, { withCredentials: true });

            await axios.put(data.presignedUrl, file, {
                headers: { 'Content-Type': file.type },
            });

            uploadedFileNames.push(file.name); // store filename only
        }

        const payload = {
            title: partyForm.title,
            partyJoinMethod: partyForm.partyJoinMethod,
            partyGender: partyForm.partyGender,
            ageGroup: partyForm.ageGroup,
            minimumParticipants: parseInt(partyForm.minimumParticipants),
            maximumParticipants: parseInt(partyForm.maximumParticipants),
            thumbnailUrl: uploadedFileNames,
            message: partyForm.message,
            matchId: partyForm.matchId,
        };

        try {
            const response = await axios.post('http://localhost:8081/party', payload, {
                withCredentials: true,
                headers: {
                    // Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            });

            alert('직관팟이 성공적으로 생성되었습니다!');
            console.log('Created Party:', response.data);
        } catch (err) {
            alert('생성 실패: ' + err.message);
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
        </>
    );
};

export default PartyMake;
