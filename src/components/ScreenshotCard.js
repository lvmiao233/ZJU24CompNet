import React, { useState, useEffect, useRef, useContext, useCallback } from 'react';
import { Segmented, Button, Modal, ColorPicker, Tooltip } from 'antd';
import { UploadOutlined, EditOutlined, LineOutlined, BorderOutlined, DeleteOutlined, SaveOutlined } from '@ant-design/icons';
import { useDropzone } from 'react-dropzone';
import { Canvas, FabricImage, Line, Rect } from 'fabric';
import { AnswerContext } from '@site/src/context/AnswerContext';
import './ScreenshotCard.css';

const ScreenshotCard = ({ questionId, title, children, uploadOptions = [{ id: 'default', label: '上传并标记截图' }] }) => {
  const [mode, setMode] = useState(children ? 'reference' : uploadOptions[0].id);
  const { images, addImage, getImage } = useContext(AnswerContext);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isUploadModalVisible, setUploadModalVisible] = useState(false);
  const [isAnnotationModalVisible, setAnnotationModalVisible] = useState(false);

  const canvasRef = useRef(null);
  const fabricCanvasRef = useRef(null);
  const annotationContainerRef = useRef(null);
  const [annotationTool, setAnnotationTool] = useState(null);
  const annotationToolRef = useRef(null);
  const [strokeColor, setStrokeColor] = useState('#ff0000');

  useEffect(() => {
    if (questionId && images && mode !== 'reference') {
      const imageKey = `${questionId}-${mode}`;
      const savedImage = getImage(imageKey);
      
      if (savedImage && savedImage.data) {
        if (typeof savedImage.data === 'string') {
          setUploadedImage(savedImage.data);
        } else {
          const url = URL.createObjectURL(savedImage.data);
          setUploadedImage(url);
        }
      } else {
        setUploadedImage(null);
      }
    } else {
      setUploadedImage(null);
    }
  }, [questionId, images, getImage, mode]);

  const handleFileAccept = async (acceptedFiles) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      
      try {
        const imageKey = `${questionId}-${mode}`;
        await addImage(imageKey, file); // Wait for the image to be saved
        const url = URL.createObjectURL(file);
        setUploadedImage(url); // Manually update the state
        setUploadModalVisible(false);
      } catch (error) {
        console.error('Failed to save image:', error);
      }
    }
  };

  const onDrop = (acceptedFiles) => {
    handleFileAccept(acceptedFiles);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    noClick: true,
  });

  const { getRootProps: getMainRootProps, getInputProps: getMainInputProps, isDragActive: isMainDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    noClick: true,
  });

  const handlePaste = useCallback(async (event) => {
    const items = event.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const blob = items[i].getAsFile();
        handleFileAccept([blob]);
        break;
      }
    }
  }, [handleFileAccept]);

  useEffect(() => {
    if (isUploadModalVisible) {
      window.addEventListener('paste', handlePaste);
      return () => window.removeEventListener('paste', handlePaste);
    }
  }, [isUploadModalVisible, handlePaste]);

  const openFileDialog = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => handleFileAccept(e.target.files);
    input.click();
  };

  const handleAnnotationToolChange = (tool) => {
    setAnnotationTool(tool);
    annotationToolRef.current = tool;
    
    const canvas = fabricCanvasRef.current;
    if (canvas) {
      if (tool) {
        // 启用绘图模式
        canvas.selection = false;
        canvas.defaultCursor = 'crosshair';
        canvas.hoverCursor = 'crosshair';
        canvas.moveCursor = 'crosshair';
        
        // 取消当前选中的对象
        canvas.discardActiveObject();
        canvas.renderAll();
      } else {
        // 禁用绘图模式，恢复选择模式
        canvas.selection = true;
        canvas.defaultCursor = 'default';
        canvas.hoverCursor = 'move';
        canvas.moveCursor = 'move';
      }
    }
  };

  const initFabric = useCallback(() => {
    if (!uploadedImage || !canvasRef.current || !annotationContainerRef.current) {
      return;
    }

    if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
    }

    const container = annotationContainerRef.current;
    const maxWidth = container.clientWidth;

    if (maxWidth === 0) {
      setTimeout(() => initFabric(), 100);
      return;
    }

    // 先加载图片获取尺寸，再创建适配的canvas
    FabricImage.fromURL(uploadedImage).then((img) => {
      if (!img) {
        console.error('Failed to load image');
        return;
      }
      
      // 计算缩放比例，保持图像宽度不超过容器宽度
      const scale = Math.min(maxWidth / img.width, maxWidth / img.height);
      const canvasWidth = img.width * scale;
      const canvasHeight = img.height * scale;
      
      // 创建适配图像尺寸的canvas
      const canvas = new Canvas(canvasRef.current, {
        width: canvasWidth,
        height: canvasHeight,
        backgroundColor: '#ffffff'
      });

      fabricCanvasRef.current = canvas;
      
      // 缩放图片适应canvas
      img.scale(scale);
      img.set({
        left: 0,
        top: 0,
        selectable: false,
        evented: false
      });

      // 使用Fabric.js v6的正确API设置背景图像
      canvas.set('backgroundImage', img);
      canvas.renderAll();

      // 设置事件处理
      let isDown = false;
      let origX, origY;
      let currentShape = null;

      // 初始状态：启用选择模式
      canvas.selection = true;
      canvas.defaultCursor = 'default';

      canvas.on('mouse:down', (o) => {
          const currentTool = annotationToolRef.current;
          if (!currentTool) return;
          
          // 临时禁用选择功能，进入绘图模式
          canvas.selection = false;
          canvas.discardActiveObject();
          
          isDown = true;
          const pointer = canvas.getPointer(o.e);
          origX = pointer.x;
          origY = pointer.y;
 
          let shape;
          if (currentTool === 'line') {
              shape = new Line([origX, origY, origX, origY], {
                  stroke: strokeColor,
                  strokeWidth: 2,
                  selectable: false, // 绘图时不可选择
                  evented: false,    // 绘图时不响应事件
              });
          } else if (currentTool === 'rect') {
              shape = new Rect({
                  left: origX,
                  top: origY,
                  originX: 'left',
                  originY: 'top',
                  width: 0,
                  height: 0,
                  stroke: strokeColor,
                  strokeWidth: 2,
                  fill: 'transparent',
                  selectable: false, // 绘图时不可选择
                  evented: false,    // 绘图时不响应事件
              });
          }
          
          if (shape) {
              canvas.add(shape);
              currentShape = shape;
              canvas.renderAll();
          }
      });

      canvas.on('mouse:move', (o) => {
        if (!isDown || !currentShape) return;
        
        const pointer = canvas.getPointer(o.e);

        if (currentShape.type === 'line') {
            // 约束直线为水平或垂直方向
            const deltaX = Math.abs(pointer.x - origX);
            const deltaY = Math.abs(pointer.y - origY);
            
            if (deltaX > deltaY) {
                // 水平线：y坐标保持不变
                currentShape.set({ x2: pointer.x, y2: origY });
            } else {
                // 垂直线：x坐标保持不变
                currentShape.set({ x2: origX, y2: pointer.y });
            }
        } else if (currentShape.type === 'rect') {
            // 正确处理矩形的绘制方向
            const left = Math.min(origX, pointer.x);
            const top = Math.min(origY, pointer.y);
            const width = Math.abs(origX - pointer.x);
            const height = Math.abs(origY - pointer.y);
            
            currentShape.set({
                left: left,
                top: top,
                width: width,
                height: height,
            });
        }
        
        currentShape.setCoords();
        canvas.renderAll();
      });

      canvas.on('mouse:up', () => {
        if (isDown && currentShape) {
            isDown = false;
            
            // 绘图完成后，使对象可选择和响应事件
            currentShape.selectable = true;
            currentShape.evented = true;
            currentShape.setCoords();
            canvas.renderAll();
            currentShape = null;
            
            // 根据当前工具状态决定是否恢复选择功能
            if (!annotationToolRef.current) {
                canvas.selection = true;
                canvas.defaultCursor = 'default';
            }
        }
      });
    }).catch((error) => {
      console.error('Error loading image:', error);
    });
  }, [uploadedImage, annotationTool, strokeColor]);

  const deleteSelectedObject = () => {
    const canvas = fabricCanvasRef.current;
    if (canvas && canvas.getActiveObject()) {
      canvas.remove(canvas.getActiveObject());
    }
  };

  const saveAnnotation = () => {
    const canvas = fabricCanvasRef.current;
    if (canvas) {
      const canvasElement = canvas.toCanvasElement();
      canvasElement.toBlob((blob) => {
        handleFileAccept([blob]);
        setAnnotationModalVisible(false);
      });
    }
  };

  const generateSegmentedOptions = () => {
    const options = [];
    
    if (children) {
      options.push({ label: title || '参考', value: 'reference' });
    }
    
    uploadOptions.forEach(option => {
      options.push({ label: option.label, value: option.id });
    });
    
    return options;
  };

  const shouldShowSegmented = () => {
    const totalOptions = (children ? 1 : 0) + uploadOptions.length;
    return totalOptions > 1;
  };

  const renderContent = () => {
    if (mode === 'reference') {
      return children;
    }

    return (
      <div className="uploadContainer">
        {uploadedImage ? (
          <img src={uploadedImage} alt="已上传" className="uploadedImage" />
        ) : (
          <div 
            {...getMainRootProps({ 
              className: `placeholder ${isMainDragActive ? 'drag-active' : ''}`,
              onClick: () => setUploadModalVisible(true)
            })}
          >
            <input {...getMainInputProps()} />
            点击或拖拽文件到此区域上传
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="screenshot-card">
        <div className="header">
          {shouldShowSegmented() ? (
            <Segmented
              options={generateSegmentedOptions()}
              value={mode}
              onChange={setMode}
            />
          ) : (
            <span className="single-option-label">{uploadOptions[0].label}</span>
          )}
          {mode !== 'reference' && (
            <div className="toolbar">
              <Button icon={<UploadOutlined />} onClick={() => setUploadModalVisible(true)}>
                上传 / 替换
              </Button>
              {uploadedImage && (
                <Button icon={<EditOutlined />} onClick={() => setAnnotationModalVisible(true)}>
                  标注
                </Button>
              )}
            </div>
          )}
        </div>
        <div className="content">
          {renderContent()}
        </div>
      </div>

      <Modal
        title="上传图片"
        open={isUploadModalVisible}
        onCancel={() => setUploadModalVisible(false)}
        footer={null}
      >
        <div {...getRootProps({ className: `dropzone ${isDragActive ? 'active' : ''}` })}>
          <input {...getInputProps()} />
          <p>拖拽图片到此处，或从剪贴板粘贴，或</p>
          <Button onClick={openFileDialog}>点击选择文件</Button>
        </div>
      </Modal>

      <Modal
        title="标注图片"
        open={isAnnotationModalVisible}
        onCancel={() => setAnnotationModalVisible(false)}
        afterOpenChange={(open) => {
          if (open && uploadedImage) {
            setTimeout(() => {
              initFabric();
            }, 100);
          }
        }}
        width="90vw"
        destroyOnClose
        footer={null}
        className="annotationModal"
      >
        <div className="annotationContainer" ref={annotationContainerRef}>
            <div className="annotationToolbar">
                <Tooltip title="绘制直线">
                    <Button icon={<LineOutlined />} onClick={() => handleAnnotationToolChange('line')} type={annotationTool === 'line' ? 'primary' : 'default'} />
                </Tooltip>
                <Tooltip title="绘制矩形">
                    <Button icon={<BorderOutlined />} onClick={() => handleAnnotationToolChange('rect')} type={annotationTool === 'rect' ? 'primary' : 'default'} />
                </Tooltip>
                <Tooltip title="选择模式">
                    <Button onClick={() => handleAnnotationToolChange(null)} type={!annotationTool ? 'primary' : 'default'}>选择</Button>
                </Tooltip>
                <ColorPicker value={strokeColor} onChange={(color) => setStrokeColor(color.toHexString())} />
                <Tooltip title="删除选中">
                    <Button icon={<DeleteOutlined />} onClick={deleteSelectedObject} danger />
                </Tooltip>
                <Button icon={<SaveOutlined />} onClick={saveAnnotation} type="primary" style={{ marginLeft: 'auto' }}>
                    保存
                </Button>
            </div>
            <canvas ref={canvasRef} />
        </div>
      </Modal>
    </>
  );
};

export default ScreenshotCard;