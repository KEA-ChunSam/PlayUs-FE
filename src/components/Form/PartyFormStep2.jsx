// 직관팟 만들기 2단계 Flow 컴포넌트.
import React, {useState} from 'react';
import styles from './PartyFormStep2.module.css';
import TabNav from "../TabNav/TabNav";
import {useNavigate} from "react-router-dom";

const PartyFormStep2 = ({form, setForm, onSubmit}) => {
    const handleChange = (field, value) => {
        setForm(prev => ({...prev, [field]: value}));
    };

    const handleThumbnailChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 10 * 1024 * 1024) {
            alert('파일 크기는 10MB 이하여야 합니다.');
            return;
        }

        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            alert('JPG, PNG, GIF, WEBP 형식의 이미지만 업로드 가능합니다.');
            return;
        }

        if (Array.isArray(form.thumbnailImageNameList) && form.thumbnailImageNameList.length >= 10) {
            alert('이미지는 최대 10개까지 업로드할 수 있습니다.');
            return;
        }

        const updated = Array.isArray(form.thumbnailImageNameList)
            ? [...form.thumbnailImageNameList, file]
            : [file];

        handleChange('thumbnailImageNameList', updated);
    };

    // Remove image at index from imageUrls array
    const removeImageAt = (index) => {
        if (!Array.isArray(form.thumbnailImageNameList)) return;
        const updated = [...form.thumbnailImageNameList];
        updated.splice(index, 1);
        handleChange('thumbnailImageNameList', updated);
    };
    const [activeTab, setActiveTab] = useState(0);
    const navigate = useNavigate();
    const tabLabels = ["직관팟 만들기"];

    const isFormValid = () => {
        if (!form.message || form.message.trim() === '') {
            alert('소개글을 작성해 주세요.');
            return false;
        }

        if (!Array.isArray(form.thumbnailImageNameList) || form.thumbnailImageNameList.length === 0) {
            alert('최소 1개 이상의 이미지를 업로드해 주세요.');
            return false;
        }

        return true;
    }

    return (
        <div className={styles.container}>
            <TabNav tabs={tabLabels} onTabChange={setActiveTab} onBack={() => navigate(-1)}/>
            <div className={styles.inputForm}>
                <h2 className={styles.title}>썸네일을 등록해 주세요. (최대 10개까지 선택 가능)</h2>
                <div className={styles.thumbnailContainer}>
                    <img
                        src="/Button/uploadImage.png"
                        alt="이미지 선택"
                        width={50}
                        height={50}
                        className={styles.imageUploadButton}
                        onClick={() => document.getElementById('imageUpload').click()}
                    />
                    <input
                        id="imageUpload"
                        type="file"
                        accept="image/*"
                        onChange={handleThumbnailChange}
                        className={styles.hiddenInput}
                    />
                    {form.thumbnailImageNameList && form.thumbnailImageNameList.length > 0 && form.thumbnailImageNameList.map((url, index) => (
                        <div key={index} className={styles.thumbnailWrapper}>
                            <img
                                src={typeof url === 'string' ? url : URL.createObjectURL(url)}
                                alt={`썸네일 미리보기 ${index + 1}`}
                                className={styles.thumbnailPreview}
                            />
                            <button
                                type="button"
                                className={styles.removeButton}
                                onClick={() => removeImageAt(index)}
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>

                <h2 className={styles.title}>소개글을 작성해 주세요.</h2>
                <textarea
                    rows="8"
                    value={form.message || ''}
                    onChange={(e) => handleChange('message', e.target.value)}
                    placeholder="소개글을 자유롭게 작성해 주세요. (최대 500자)"
                    maxLength={500}
                    className={styles.textarea}
                />
                <div className={styles.charCount}>
                    {form.message?.length || 0}/500
                </div>

                <button
                    onClick={() => isFormValid() && onSubmit()}
                    className={styles.submitButton}
                >
                    직관팟 만들기!
                </button>
            </div>
        </div>
    );
};

export default PartyFormStep2;
