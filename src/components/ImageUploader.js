import React, { useState, useEffect } from 'react';
import { Upload, message } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { saveImage, getImage } from '../utils/db';

const { Dragger } = Upload;

const getBase64 = (img, callback) => {
  const reader = new FileReader();
  reader.addEventListener('load', () => callback(reader.result));
  reader.readAsDataURL(img);
};

const beforeUpload = (file) => {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
  if (!isJpgOrPng) {
    message.error('You can only upload JPG/PNG file!');
  }
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    message.error('Image must smaller than 2MB!');
  }
  return isJpgOrPng && isLt2M;
};

const ImageUploader = ({ questionId }) => {
  const [imageUrl, setImageUrl] = useState();

  useEffect(() => {
    getImage(questionId).then(savedImage => {
      if (savedImage) {
        setImageUrl(savedImage.data);
      }
    });
  }, [questionId]);

  const handleChange = (info) => {
    if (info.file.status === 'done') {
      getBase64(info.file.originFileObj, (url) => {
        setImageUrl(url);
        saveImage(questionId, url).catch(err => {
          message.error('Failed to save image locally.');
          console.error(err);
        });
      });
    }
  };

  return (
    <Dragger
      name="avatar"
      listType="picture-card"
      className="avatar-uploader"
      showUploadList={false}
      customRequest={({ file, onSuccess }) => {
        setTimeout(() => {
          onSuccess("ok");
        }, 0);
      }}
      beforeUpload={beforeUpload}
      onChange={handleChange}
    >
      {imageUrl ? <img src={imageUrl} alt={`题目 ${questionId} 的已上传图片`} style={{ width: '100%' }} /> : 
        <div>
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">Click or drag file to this area to upload</p>
          <p className="ant-upload-hint">
            Support for a single or bulk upload. Strictly prohibit from uploading company data or other
            band files
          </p>
        </div>
      }
    </Dragger>
  );
};

export default ImageUploader;