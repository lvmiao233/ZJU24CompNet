import React, { useState, useEffect, useRef, useContext, useCallback } from 'react';
import { Segmented, Button, Modal, ColorPicker, Tooltip } from 'antd';
import { UploadOutlined, EditOutlined, LineOutlined, BorderOutlined, DeleteOutlined, SaveOutlined, AimOutlined } from '@ant-design/icons';
import { useDropzone } from 'react-dropzone';
import { Canvas, FabricImage, Line, Rect } from 'fabric';
import { AnswerContext } from '@site/src/context/AnswerContext';
import './ScreenshotCard.css';

const PRESET_COLORS = [
  { name: '红色', value: '#ee0000' },
  { name: '橙色', value: '#ffc000' },
  { name: '黄色', value: '#ffff00' },
  { name: '浅绿色', value: '#92d050' },
  { name: '绿色', value: '#00b050' },
  { name: '浅蓝色', value: '#00b0f0' },
  { name: '蓝色', value: '#0070c0' },
  { name: '紫色', value: '#7030a0' }
];

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
  const strokeColorRef = useRef('#ff0000');
  const originalImageRef = useRef(null);
  const scaleRatioRef = useRef(1);

  useEffect(() => {
    strokeColorRef.current = strokeColor;
  }, [strokeColor]);

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
      
      // 保存原始图片信息
      originalImageRef.current = {
        width: img.width,
        height: img.height,
        element: img
      };
      
      // 响应式计算最大显示尺寸
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      
      // 基于屏幕大小和容器大小计算合理的最大显示尺寸
      const maxDisplayWidth = Math.min(
        maxWidth * 0.9,                    // 容器宽度的90%
        viewportWidth * 0.8,               // 视口宽度的80%
        Math.max(600, viewportWidth * 0.8) // 最小600px，或视口宽度的60%
      );
      
      const maxDisplayHeight = Math.min(
        viewportHeight * 0.7,              // 视口高度的60%
        Math.max(400, viewportHeight * 0.7) // 最小400px，或视口高度的50%
      );
      
      const scale = Math.min(
        maxDisplayWidth / img.width, 
        maxDisplayHeight / img.height,
        maxWidth / img.width // 还要考虑容器限制
      );
      
      scaleRatioRef.current = scale;
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
                  stroke: strokeColorRef.current,
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
                  stroke: strokeColorRef.current,
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
  }, [uploadedImage, annotationTool]);

  const deleteSelectedObject = () => {
    const canvas = fabricCanvasRef.current;
    if (canvas && canvas.getActiveObject()) {
      canvas.remove(canvas.getActiveObject());
    }
  };

  const saveAnnotation = () => {
    const canvas = fabricCanvasRef.current;
    const originalImage = originalImageRef.current;
    const currentScale = scaleRatioRef.current;
    
    if (!canvas || !originalImage) {
      console.error('Canvas or original image not available');
      return;
    }

    // 创建原始尺寸的临时Canvas
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = originalImage.width;
    tempCanvas.height = originalImage.height;
    
    const fabricTempCanvas = new Canvas(tempCanvas, {
      width: originalImage.width,
      height: originalImage.height,
      backgroundColor: '#ffffff'
    });

    // 重新加载原始尺寸的背景图片
    FabricImage.fromURL(uploadedImage).then((bgImg) => {
      // 设置背景图片为原始尺寸（不缩放）
      bgImg.set({
        left: 0,
        top: 0,
        selectable: false,
        evented: false
      });
      
      fabricTempCanvas.set('backgroundImage', bgImg);

      // 复制所有标注对象到临时Canvas，按比例放大
      const objects = canvas.getObjects();
      const scaleFactor = 1 / currentScale; // 放大倍数

      objects.forEach((obj) => {
        let clonedObj;
        
        if (obj.type === 'line') {
          clonedObj = new Line([
            obj.x1 * scaleFactor,
            obj.y1 * scaleFactor,
            obj.x2 * scaleFactor,
            obj.y2 * scaleFactor
          ], {
            stroke: obj.stroke,
            strokeWidth: Math.max(2, obj.strokeWidth * scaleFactor),
            selectable: true,
            evented: true,
          });
        } else if (obj.type === 'rect') {
          clonedObj = new Rect({
            left: obj.left * scaleFactor,
            top: obj.top * scaleFactor,
            width: obj.width * scaleFactor,
            height: obj.height * scaleFactor,
            stroke: obj.stroke,
            strokeWidth: Math.max(2, obj.strokeWidth * scaleFactor),
            fill: obj.fill,
            selectable: true,
            evented: true,
          });
        }
        
        if (clonedObj) {
          fabricTempCanvas.add(clonedObj);
        }
      });

      fabricTempCanvas.renderAll();

      // 导出高分辨率图片
      setTimeout(() => {
        const tempCanvasElement = fabricTempCanvas.toCanvasElement();
        tempCanvasElement.toBlob((blob) => {
          handleFileAccept([blob]);
          setAnnotationModalVisible(false);
          // 清理临时Canvas
          fabricTempCanvas.dispose();
        });
      }, 100);
    }).catch((error) => {
      console.error('Error creating high-res canvas:', error);
    });
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
                    <Button icon={<AimOutlined />} onClick={() => handleAnnotationToolChange(null)} type={!annotationTool ? 'primary' : 'default'}>选择元素</Button>
                </Tooltip>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {PRESET_COLORS.map((color) => (
                        <Tooltip key={color.value} title={color.name}>
                            <div
                                style={{
                                    width: '20px',
                                    height: '20px',
                                    backgroundColor: color.value,
                                    border: strokeColor === color.value ? '2px solid #333' : '1px solid #ccc',
                                    borderRadius: '3px',
                                    cursor: 'pointer',
                                    boxSizing: 'border-box'
                                }}
                                onClick={() => setStrokeColor(color.value)}
                            />
                        </Tooltip>
                    ))}
                    <ColorPicker value={strokeColor} onChange={(color) => setStrokeColor(color.toHexString())} />
                </div>
                <Tooltip title="删除选中的元素">
                    <Button icon={<DeleteOutlined />} onClick={deleteSelectedObject} danger>删除元素</Button>
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