import React, { useEffect, useRef, useState } from 'react';
import { Spin, Button, message } from 'antd';
import { LeftOutlined, RightOutlined, ZoomInOutlined, ZoomOutOutlined, MenuUnfoldOutlined, CloseOutlined } from '@ant-design/icons';
import './index.less';

// 使用CDNJS上的PDF.js库
const pdfjsLib = window.pdfjsLib;
// 确保PDF.js worker正确加载
if (!pdfjsLib) {
  // 如果没有全局加载PDF.js，这里需要显示一个错误信息
  console.error('PDF.js库未加载，请确保在index.html中引入了PDF.js');
}

/**
 * PDF查看器组件，支持定位到指定位置和高亮显示
 * @param {Object} props 组件属性
 * @param {string} props.documentId 文档ID
 * @param {Object} props.citation 引用信息，包含页码和坐标
 * @param {function} props.onClose 关闭回调
 */
const PDFViewer = ({ documents, onClose }) => {
  console.log('PDFViewer received documents:', documents);
  
  // 确保 documents 数组不为空
  if (!documents || documents.length === 0) {
    console.warn('No documents provided to PDFViewer');
    return null;
  }

  const [activeDoc, setActiveDoc] = useState(documents[0]);
  console.log('Initial activeDoc set to:', documents[0]);

  const pdfContainerRef = useRef(null);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.2);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // 清理函数
  const cleanup = () => {
    const container = pdfContainerRef.current;
    if (container) {
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
    }
  };

  // 加载PDF文档
  useEffect(() => {
    const loadPDF = async () => {
      if (!activeDoc) {
        console.warn('No active document available');
        return;
      }

      const docId = activeDoc.id || activeDoc.document_id;
      console.log('loadPDF called with activeDoc:', activeDoc);
      console.log('Document ID for loading:', docId);
      
      if (!docId) {
        console.warn('No document ID found in active document:', activeDoc);
        return;
      }
      
      setLoading(true);
      cleanup();
      
      try {
        // 设置PDF.js工作线程
        if (pdfjsLib && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
          pdfjsLib.GlobalWorkerOptions.workerSrc = '//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
        }
        
        console.log('Loading document:', { docId, activeDoc });
        
        // 从API获取PDF文件
        const response = await fetch(`/api/v1/documents/download/${docId}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/pdf',
          },
        });

        if (!response.ok) {
          console.error('Download failed:', {
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries())
          });

          // 尝试备用 API
          const fallbackResponse = await fetch(`/api/v1/documents/${docId}/content`, {
            method: 'GET',
            headers: {
              'Accept': 'application/pdf',
            },
          });

          if (!fallbackResponse.ok) {
            throw new Error(`获取PDF文件失败: ${response.statusText}`);
          }

          const contentType = fallbackResponse.headers.get('content-type');
          console.log('Content type:', contentType);
          
          if (contentType && contentType.includes('application/pdf')) {
            const pdfData = await fallbackResponse.arrayBuffer();
            console.log('PDF data size:', pdfData.byteLength);
            
            // 加载PDF文档
            const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
            setPdfDoc(pdf);
            setTotalPages(pdf.numPages);
            
            // 如果有引用信息，跳转到对应页面
            if (activeDoc.citation?.page_number) {
              setCurrentPage(activeDoc.citation.page_number);
            } else {
              setCurrentPage(1);
            }
          } else {
            // 如果不是PDF，显示文本内容
            const textContent = await fallbackResponse.text();
            console.log('Received text content:', textContent.substring(0, 100));
            setError('文档不是PDF格式，显示文本内容：');
            activeDoc.text = textContent;
          }
        } else {
          const contentType = response.headers.get('content-type');
          console.log('Content type:', contentType);
          
          if (contentType && contentType.includes('application/pdf')) {
            const pdfData = await response.arrayBuffer();
            console.log('PDF data size:', pdfData.byteLength);
            
            // 加载PDF文档
            const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
            setPdfDoc(pdf);
            setTotalPages(pdf.numPages);
            
            // 如果有引用信息，跳转到对应页面
            if (activeDoc.citation?.page_number) {
              setCurrentPage(activeDoc.citation.page_number);
            } else {
              setCurrentPage(1);
            }
          } else {
            // 如果不是PDF，显示文本内容
            const textContent = await response.text();
            console.log('Received text content:', textContent.substring(0, 100));
            setError('文档不是PDF格式，显示文本内容：');
            activeDoc.text = textContent;
          }
        }
      } catch (err) {
        console.error('加载PDF文件失败:', err);
        setError(err.message);
        message.error(`无法加载PDF: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    loadPDF();
    return cleanup;
  }, [activeDoc]);

  // 高亮引用的位置
  const highlightCitation = async (citation, pageNumber) => {
    console.log('Attempting to highlight citation:', {
      citation,
      pageNumber
    });

    try {
      if (!citation || !pageNumber) {
        console.warn('Invalid citation or page number:', { citation, pageNumber });
        return;
      }

      // 验证 bbox 坐标是否存在且为数字
      const requiredFields = ['bbox_x', 'bbox_y', 'bbox_width', 'bbox_height'];
      const missingFields = requiredFields.filter(field => 
        typeof citation[field] !== 'number' || isNaN(citation[field])
      );
      
      if (missingFields.length > 0) {
        console.warn('Missing or invalid bbox fields:', {
          missingFields,
          citation
        });
        return;
      }

      // Get the PDF page
      const page = await pdfDoc.getPage(pageNumber);
      const viewport = page.getViewport({ scale });

      // Get the canvas for the current page
      const canvas = document.querySelector(`[data-page-number="${pageNumber}"]`);
      if (!canvas) {
        console.warn('Canvas not found:', {
          pageNumber,
          existingCanvases: document.querySelectorAll('canvas').length
        });
        return;
      }

      // Get the canvas context and draw highlight
      const ctx = canvas.getContext('2d');
      ctx.save();
      
      // 设置高亮样式
      ctx.fillStyle = 'rgba(255, 255, 0, 0.35)';  // 半透明黄色
      ctx.strokeStyle = 'rgba(255, 165, 0, 0.9)';  // 橙色边框
      ctx.lineWidth = 2;

      // 计算坐标
      const scaledX = citation.bbox_x * scale;
      const scaledY = citation.bbox_y * scale;
      const scaledWidth = citation.bbox_width * scale;
      const scaledHeight = citation.bbox_height * scale;

      console.log('Drawing highlight with coordinates:', {
        original: {
          x: citation.bbox_x,
          y: citation.bbox_y,
          width: citation.bbox_width,
          height: citation.bbox_height,
          text: citation.text
        },
        viewport: {
          height: viewport.height,
          scale: scale
        },
        scaled: {
          x: scaledX,
          y: scaledY,
          width: scaledWidth,
          height: scaledHeight
        }
      });

      // 绘制高亮矩形
      ctx.fillRect(scaledX, scaledY, scaledWidth, scaledHeight);
      ctx.strokeRect(scaledX, scaledY, scaledWidth, scaledHeight);

      // 添加文本标注（用于调试）
      ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';  // 红色文本
      ctx.font = '14px Arial';
      const debugText = `${citation.text || 'No text'} (${Math.round(scaledX)},${Math.round(scaledY)})`;
      ctx.fillText(debugText, scaledX, Math.max(scaledY - 5, 15));  // 确保文本不会超出顶部

      ctx.restore();

    } catch (error) {
      console.error('Error in highlightCitation:', error);
    }
  };

  // 渲染PDF页面
  const renderPage = async (pageNumber) => {
    try {
      if (!pdfDoc) return;

      // Get the PDF page
      const page = await pdfDoc.getPage(pageNumber);
      const viewport = page.getViewport({ scale });

      // Create canvas element
      const canvas = document.createElement('canvas');
      canvas.setAttribute('data-page-number', pageNumber.toString());
      canvas.className = 'pdf-page';
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      // Get canvas context
      const context = canvas.getContext('2d');

      // Add canvas to container
      const container = pdfContainerRef.current;
      if (container) {
        container.appendChild(canvas);
      }

      // Render PDF page
      await page.render({
        canvasContext: context,
        viewport: viewport
      }).promise;  // 等待渲染完成

      // 获取当前页面的所有引用
      const pageCitations = documents.flatMap(doc => {
        const citations = [];
        
        // 处理单个引用
        if (doc.citation && doc.citation.page_number === pageNumber) {
          citations.push({
            ...doc.citation,
            source: 'citation'
          });
        }
        
        // 处理引用数组
        if (Array.isArray(doc.citations)) {
          citations.push(...doc.citations
            .filter(cit => cit.page_number === pageNumber)
            .map(cit => ({
              ...cit,
              source: 'citations'
            }))
          );
        }
        
        // 处理文档中的其他引用（如果有）
        if (doc.references && Array.isArray(doc.references)) {
          citations.push(...doc.references
            .filter(ref => ref.page_number === pageNumber)
            .map(ref => ({
              ...ref,
              source: 'references'
            }))
          );
        }

        // 去重：根据 segment_id 去重
        const uniqueCitations = citations.reduce((acc, curr) => {
          const key = `${curr.segment_id}-${curr.bbox_x}-${curr.bbox_y}`;
          if (!acc[key]) {
            acc[key] = curr;
          }
          return acc;
        }, {});

        console.log('Document citations before dedup:', {
          docId: doc.id || doc.document_id,
          citationsCount: citations.length,
          uniqueCount: Object.keys(uniqueCitations).length,
          citations: citations,
          unique: Object.values(uniqueCitations)
        });

        return Object.values(uniqueCitations);
      });

      console.log('All citations for page', pageNumber, ':', pageCitations);

      // 高亮所有引用
      if (pageCitations.length > 0) {
        setTimeout(() => {
          const processedCoords = new Set(); // 用于跟踪已处理的坐标
          
          pageCitations.forEach(citation => {
            if (citation && typeof citation.bbox_x === 'number') {
              // 创建唯一坐标标识
              const coordKey = `${citation.bbox_x}-${citation.bbox_y}-${citation.bbox_width}-${citation.bbox_height}`;
              
              if (!processedCoords.has(coordKey)) {
                processedCoords.add(coordKey);
                console.log('Processing unique citation:', {
                  coordKey,
                  citation
                });
                highlightCitation(citation, pageNumber);
              } else {
                console.log('Skipping duplicate citation coordinates:', {
                  coordKey,
                  citation
                });
              }
            } else {
              console.warn('Invalid citation format:', citation);
            }
          });
        }, 0);
      }

    } catch (error) {
      console.error('Error rendering page:', error);
      setError(`Error rendering page ${pageNumber}: ${error.message}`);
    }
  };

  // 当页码或缩放比例变化时渲染PDF
  useEffect(() => {
    if (!pdfDoc || !currentPage) return;
    
    cleanup();
    renderPage(currentPage);
  }, [pdfDoc, currentPage, scale, activeDoc?.citation]);
  
  // 上一页
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  // 下一页
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  // 放大
  const zoomIn = () => {
    setScale(prevScale => Math.min(prevScale + 0.2, 3)); // 最大放大到3倍
  };
  
  // 缩小
  const zoomOut = () => {
    setScale(prevScale => Math.max(prevScale - 0.2, 0.5)); // 最小缩小到0.5倍
  };

  const handleDocumentClick = (doc) => {
    setActiveDoc(doc);
  };

  // 渲染文档列表项
  const renderDocumentItem = (doc, index) => {
    const docId = doc.id || doc.document_id;
    const docName = doc.name || doc.document_name || `Document ${index + 1}`;
    const activeDocId = activeDoc?.id || activeDoc?.document_id;
    
    return (
      <div
        key={`${docId}-${index}`}
        className={`document-item ${docId === activeDocId ? 'active' : ''}`}
        onClick={() => handleDocumentClick(doc)}
      >
        <div className="document-name">{docName}</div>
        {doc.citation && (
          <div className="document-info">
            Page {doc.citation.page_number}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="pdf-viewer">
      <div className="header">
        <div className="title">
          <MenuUnfoldOutlined className="icon" />
          <span>Sources</span>
        </div>
        <CloseOutlined className="close-btn" onClick={onClose} />
      </div>

      <div className="content">
        <div className="document-list">
          {documents.map(renderDocumentItem)}
        </div>

        <div className="pdf-container">
          {loading && <div className="pdf-loading"><Spin tip="加载中..." /></div>}
          {error && (
            <div className="pdf-error">
              <div className="error-message">{error}</div>
              {activeDoc?.text && (
                <div className="text-content">
                  <pre>{activeDoc.text}</pre>
                </div>
              )}
            </div>
          )}
          <div ref={pdfContainerRef} className="pdf-container-inner" />
        </div>

        {pdfDoc && (
          <div className="pdf-toolbar">
            <div className="pdf-nav">
              <Button 
                icon={<LeftOutlined />} 
                onClick={goToPreviousPage} 
                disabled={currentPage <= 1 || loading}
              />
              <span className="page-info">{`${currentPage} / ${totalPages}`}</span>
              <Button 
                icon={<RightOutlined />} 
                onClick={goToNextPage} 
                disabled={currentPage >= totalPages || loading}
              />
            </div>
            <div className="pdf-zoom">
              <Button 
                icon={<ZoomOutOutlined />} 
                onClick={zoomOut} 
                disabled={scale <= 0.5 || loading}
              />
              <span className="zoom-info">{`${Math.round(scale * 100)}%`}</span>
              <Button 
                icon={<ZoomInOutlined />} 
                onClick={zoomIn} 
                disabled={scale >= 3 || loading}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PDFViewer; 