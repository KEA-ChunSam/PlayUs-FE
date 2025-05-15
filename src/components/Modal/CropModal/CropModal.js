import React, {useCallback, useState} from 'react';
import Cropper from 'react-easy-crop';
import getCroppedImg from "../../../utils/CropImage";
import styles from './CropModal.module.css';

const CropModal = ({image, onClose, onCropDone}) => {
    const [crop, setCrop] = useState({x: 0, y: 0});
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    const onCropComplete = useCallback((_, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleDone = async () => {
        try {
            const croppedImage = await getCroppedImg(image, croppedAreaPixels);
            onCropDone(croppedImage);
        } catch (e) {
            console.error('Crop failed', e);
        }
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <div className={styles.cropContainer}>
                    <Cropper
                        image={image}
                        crop={crop}
                        zoom={zoom}
                        aspect={1}
                        cropShape="round"
                        showGrid={false}
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                        onCropComplete={onCropComplete}
                    />
                </div>
                <div className={styles.cropButtonGroup}>
                    <button className={styles.cropApplyButton} onClick={handleDone}>완료</button>
                    <button className={styles.cropCancelButton} onClick={onClose}>취소</button>
                </div>
            </div>
        </div>
    );
};

export default CropModal;