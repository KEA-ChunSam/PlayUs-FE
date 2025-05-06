import React, { useState } from 'react';
import PartyFormStep1 from '../../components/Form/PartyFormStep1';
import PartyFormStep2 from '../../components/Form/PartyFormStep2';

const PartyMake = () => {
  const [step, setStep] = useState(1);
  const [partyForm, setPartyForm] = useState({
    partyName: '',
    applyType: '',
    gender: '',
    age: '',
    min: '',
    max: '',
    imageUrls: [],
    description: '',
  });

  const handleSubmit = () => {
    const formData = new FormData();
    Object.entries(partyForm).forEach(([key, value]) => {
      if (value !== null) formData.append(key, value);
    });

    // 이후 백엔드와 연동 시 사용
    fetch('http://localhost:8080/party', {
      method: 'POST',
      body: formData,
    })
      .then(res => {
        if (!res.ok) throw new Error('서버 오류');
        alert('직관팟이 성공적으로 생성되었습니다!');
      })
      .catch(err => {
        alert('생성 실패: ' + err.message);
      });
  };

  return (
    <>
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
    </>
  );
};

export default PartyMake;
