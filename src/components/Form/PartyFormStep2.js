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

        // 파일 크기 제한 10MB
        if (file.size > 10 * 1024 * 1024) {
            alert('파일 크기는 5MB 이하여야 합니다.');
            return;
        }

        // 지원되는 이미지 형식 확인
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            alert('JPG, PNG, GIF, WEBP 형식의 이미지만 업로드 가능합니다.');
            return;
        }

        // Do not allow more than 10 images
        if (Array.isArray(form.imageUrls) && form.imageUrls.length >= 10) {
            alert('이미지는 최대 10개까지 업로드할 수 있습니다.');
            return;
        }

        setForm(prev => ({...prev, isUploading: true}));
        const reader = new FileReader();
        reader.onloadend = () => {
            const newUrl = reader.result;
            const updated = Array.isArray(form.imageUrls) ? [...form.imageUrls, newUrl] : [newUrl];
            handleChange('imageUrls', updated);
            handleChange('isUploading', false);
        };
        reader.onerror = () => {
            alert('이미지 업로드 중 오류가 발생했습니다.');
            handleChange('isUploading', false);
        };
        reader.readAsDataURL(file);
    };

    // Remove image at index from imageUrls array
    const removeImageAt = (index) => {
        if (!Array.isArray(form.imageUrls)) return;
        const updated = [...form.imageUrls];
        updated.splice(index, 1);
        handleChange('imageUrls', updated);
    };
    const [activeTab, setActiveTab] = useState(0);
    const navigate = useNavigate();
    const tabLabels = ["직관팟 구하기", "내 신청 현황", "승인 요청"];

    const isFormValid = () => {
        if (!form.description || form.description.trim() === '') {
            alert('소개글을 작성해 주세요.');
            return false;
        }

        if (!Array.isArray(form.imageUrls) || form.imageUrls.length === 0) {
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
                        src={`${process.env.PUBLIC_URL}/Button/uploadImage.png`}
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
                    {form.imageUrls && form.imageUrls.length > 0 && form.imageUrls.map((url, index) => (
                        <div key={index} className={styles.thumbnailWrapper}>
                            <img
                                src={url}
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
                    value={form.description || ''}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="소개글을 자유롭게 작성해 주세요. (최대 500자)"
                    maxLength={500}
                    className={styles.textarea}
                />
                <div className={styles.charCount}>
                    {form.description?.length || 0}/500
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
